下面给你一份「可在 Next.js App Router 中直接落地」的技术方案，目标是在手机端（Chrome/Android、iOS Safari、以及常见 App 内 WebView 能力允许时）调用后置摄像头，叠加你提供的 SVG 蒙版 做取景约束，并在取景过程中用 MediaPipe（HandLandmarker） 实时捕获手部 21 个关键点。

⸻

一、总体设计

技术栈
	•	前端：Next.js（App Router）、React 18/19、TypeScript、Tailwind（可选）
	•	相机：navigator.mediaDevices.getUserMedia
	•	手部关键点：MediaPipe Tasks Vision 的 HandLandmarker（WASM + WebGL，移动端兼容性更好）
	•	叠加层：SVG 蒙版 + Canvas（绘制关键点）
	•	帧循环：HTMLVideoElement.requestVideoFrameCallback（iOS 15+），降级到 requestAnimationFrame

关键路径
	1.	点击「开始取景」→ 基于 getUserMedia 请求后置摄像头（facingMode: 'environment'）。
	2.	若 iOS/Safari 未严格支持 facingMode：先用一次通用 getUserMedia 拿权限，再 enumerateDevices() 找到 back 摄像头的 deviceId，二次调用切换到后置。
	3.	启动 MediaPipe HandLandmarker（runningMode: 'VIDEO'），在每帧回调里 detectForVideo(video, performance.now())。
	4.	使用 绝对定位 将 <video>、<svg>（你的蒙版）与 <canvas>（画关键点）叠在同一容器内，尺寸靠 ResizeObserver 同步。
	5.	输出：对外抛出 landmarks 数组（21 × (x,y,z))，以及可选的打点可视化。

目录建议

/public/mediapipe/hand_landmarker.task      // 模型文件
/public/mediapipe/wasm/                    // tasks-vision wasm 运行时（可用官方 CDN 先跑通）
/app/camera/page.tsx                       // 演示页（可选）
/components/HandCamera.tsx                 // 核心组件（下面提供）
/lib/camera.ts                             // 摄像头工具函数（可内联）


⸻

二、兼容性策略（重点）
	•	HTTPS & 用户手势：移动端必须 https，且需用户点击按钮触发摄像头权限。
	•	iOS Safari：
	•	需要 playsinline、muted，避免自动全屏和无声限制。
	•	facingMode: { ideal: 'environment' } 不是 100% 可靠 → 二段式：先拿权限，再用 enumerateDevices() 找到 back 设备。
	•	App 内 WebView（微信、FB/IG、某些内嵌浏览器）：
	•	某些容器不开放或受限 getUserMedia；建议检测失败后给出降级方案（上传静态图 input capture=environment），但需说明无法实时追踪。
	•	Android Chrome：一般对 facingMode: 'environment' 友好。
	•	性能与功耗：限制检测帧率（如 24–30fps），必要时开启节流/采样。

⸻

三、SVG 蒙版接入

你已经有 SVG。有两种叠加方式：
	1.	绝对定位覆盖（推荐，最简单、兼容好）：把 <svg> 放在 position:absolute; inset:0; pointer-events:none；内部用半透明/镂空区域约束取景。
	2.	CSS mask：用 mask-image/-webkit-mask-image 把视频裁剪成形状（更“硬核”，但旧端兼容可能差一些）。

下方代码默认采用 绝对定位覆盖，你只需把你提供的 <svg>...</svg> 贴进去（或通过 props.svgMask 传入）。

⸻

四、模型与静态资源
	•	模型：hand_landmarker.task（官方发布，约几 MB）。
放置：/public/mediapipe/hand_landmarker.task
	•	WASM 运行时：两种方案
	1.	CDN 快速接入（开发期）：FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm')
	2.	本地部署（生产）：把 wasm/ 目录拷贝进 /public/mediapipe/wasm/，然后传入该本地路径，降低首包受外链影响。

⸻

五、完整可用组件（Next.js App Router）

直接新建 /components/HandCamera.tsx。
注意：把你的 SVG 蒙版替换到 /* TODO: Paste your SVG here */ 位置（或通过 svgMask 传入）。

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type HandLandmark = { x: number; y: number; z: number };
type HandResult = {
  // 多手时：每只手 21 点
  landmarks: HandLandmark[][];
  // 每手的分数（可选）
  handedness?: { categoryName: 'Left' | 'Right'; score: number }[];
};

type Props = {
  onResults?: (r: HandResult) => void;
  svgMask?: React.ReactNode;          // 传入你的 SVG（推荐）
  maxHands?: number;                  // 默认 2
  targetFps?: number;                 // 限帧，默认 30
  showDebugDots?: boolean;            // 显示关键点
};

export default function HandCamera({
  onResults,
  svgMask,
  maxHands = 2,
  targetFps = 30,
  showDebugDots = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const rVFCRef = useRef<number | null>(null);
  const lastDetectTsRef = useRef<number>(0);
  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>("");

  // --- 创建 HandLandmarker ---
  const initLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return;

    // 动态导入，避免 SSR
    const mp = await import('@mediapipe/tasks-vision');
    const { FilesetResolver, HandLandmarker } = mp as any;

    // 方案 A：CDN（开发期）
    const fileset = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    // 方案 B：本地（生产期），替换为：
    // const fileset = await FilesetResolver.forVisionTasks('/mediapipe/wasm');

    landmarkerRef.current = await HandLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: '/mediapipe/hand_landmarker.task',
        delegate: 'GPU', // WASM + WebGL。若少量设备异常可改 'CPU'
      },
      runningMode: 'VIDEO',
      numHands: maxHands,
      minTrackingConfidence: 0.5,
      minDetectionConfidence: 0.5,
    });

    setReady(true);
  }, [maxHands]);

  // --- 申请后置摄像头 ---
  const openBackCamera = useCallback(async (): Promise<MediaStream> => {
    // 先尝试 facingMode
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      return s;
    } catch {
      // iOS Safari 等设备：二段式
      const s1 = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter(d => d.kind === 'videoinput');
      const back = cams.find(d => /back|rear|environment/i.test(d.label));
      if (back?.deviceId) {
        s1.getTracks().forEach(t => t.stop());
        const s2 = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: back.deviceId } },
          audio: false,
        });
        return s2;
      }
      // 兜底：仍返回首次流（可能是前置）
      return s1;
    }
  }, []);

  // --- 同步画布尺寸到视频 ---
  const syncCanvasSize = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const { videoWidth, videoHeight } = video;
    if (videoWidth && videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }
  }, []);

  // --- 绘制关键点 ---
  const drawLandmarks = useCallback((results: any) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 清空
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showDebugDots) return;
    if (!results?.landmarks?.length) return;

    ctx.lineWidth = 2;
    ctx.globalAlpha = 1;

    // 按手绘制 21 点
    for (const hand of results.landmarks) {
      // 连接骨架（可选：简单连接，或引入官方连接表）
      // 这里只画点
      for (const p of hand) {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [showDebugDots]);

  // --- 帧循环：优先 rVFC，降级 RAF ---
  const loop = useCallback(() => {
    const landmarker = landmarkerRef.current;
    const video = videoRef.current;
    if (!landmarker || !video) return;

    const doDetect = () => {
      if (video.readyState >= 2) {
        // 限帧
        const now = performance.now();
        const minGap = 1000 / targetFps;
        if (now - lastDetectTsRef.current >= minGap) {
          const results = landmarker.detectForVideo(video, now);
          drawLandmarks(results);
          onResults?.({
            landmarks: results?.landmarks ?? [],
            handedness: results?.handedness?.map((h: any) => ({
              categoryName: h[0]?.categoryName,
              score: h[0]?.score,
            })),
          });
          lastDetectTsRef.current = now;
        }
      }
    };

    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      const cb = (window as any).requestVideoFrameCallback?.bind(video);
      rVFCRef.current = video.requestVideoFrameCallback((_ts: number) => {
        doDetect();
        loop();
      }) as unknown as number;
    } else {
      rafRef.current = requestAnimationFrame(() => {
        doDetect();
        loop();
      });
    }
  }, [drawLandmarks, onResults, targetFps]);

  const start = useCallback(async () => {
    setError("");
    try {
      await initLandmarker();

      const stream = await openBackCamera();
      streamRef.current = stream;

      const video = videoRef.current!;
      video.srcObject = stream;
      video.muted = true;
      video.setAttribute('playsinline', 'true');        // iOS
      (video as any).setAttribute('webkit-playsinline', 'true');

      await video.play();

      syncCanvasSize();

      // 尺寸响应
      const ro = new ResizeObserver(() => syncCanvasSize());
      ro.observe(video);
      // 存个引用，组件卸载时清理
      (video as any).__ro = ro;

      setRunning(true);
      loop();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || '摄像头或模型初始化失败');
      setRunning(false);
    }
  }, [initLandmarker, loop, openBackCamera, syncCanvasSize]);

  const stop = useCallback(() => {
    setRunning(false);

    // 停帧
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (rVFCRef.current && videoRef.current?.cancelVideoFrameCallback) {
      videoRef.current.cancelVideoFrameCallback(rVFCRef.current);
      rVFCRef.current = null;
    }
    // 停流
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    // 清理画布
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    return () => {
      stop();
      const video = videoRef.current as any;
      if (video?.__ro) {
        video.__ro.disconnect();
        delete video.__ro;
      }
    };
  }, [stop]);

  return (
    <div className="w-full max-w-[480px] mx-auto">
      <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden">
        {/* 原始视频层 */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          autoPlay
          muted
        />

        {/* 关键点绘制层 */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* SVG 蒙版层（请替换为你的 SVG） */}
        <div className="absolute inset-0 pointer-events-none">
          {svgMask ?? (
            <svg
              className="w-full h-full"
              viewBox="0 0 720 960"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* TODO: Paste your SVG here.
                  示例：外围半透明遮罩 + 中央透明取景窗 */}
              <defs>
                <mask id="hole">
                  <rect x="0" y="0" width="720" height="960" fill="white"/>
                  {/* 举例：中间一个圆角矩形透明窗 */}
                  <rect x="110" y="180" width="500" height="600" rx="36" ry="36" fill="black"/>
                </mask>
              </defs>
              <rect x="0" y="0" width="720" height="960" fill="rgba(0,0,0,0.45)" mask="url(#hole)"/>
              {/* 取景窗边框 */}
              <rect x="110" y="180" width="500" height="600" rx="36" ry="36"
                    fill="none" stroke="white" strokeWidth="4" strokeDasharray="16 10" />
            </svg>
          )}
        </div>

        {/* 顶部状态条 */}
        <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-white/90 text-xs">
          <span>{ready ? '模型已就绪' : '加载模型中…'}</span>
          <span>{running ? '捕获中' : '待机'}</span>
        </div>
      </div>

      {/* 控制区 */}
      <div className="mt-3 flex gap-2">
        {!running ? (
          <button
            onClick={start}
            className="flex-1 py-2 rounded-xl bg-emerald-600 text-white active:opacity-90"
          >
            开始取景
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex-1 py-2 rounded-xl bg-neutral-800 text-white active:opacity-90"
          >
            停止
          </button>
        )}
      </div>

      {!!error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
      <p className="mt-2 text-xs text-neutral-500">
        说明：某些 App 内 WebView 可能不支持相机权限，若无法开启，请改用系统浏览器或切换为文件拍照上传方案。
      </p>
    </div>
  );
}

使用方式（示例页）：新建 /app/camera/page.tsx

'use client';
import HandCamera from '@/components/HandCamera';

export default function Page() {
  return (
    <main className="p-4">
      <h1 className="text-lg font-semibold mb-3">手部取景演示</h1>
      <HandCamera
        maxHands={2}
        targetFps={24}
        showDebugDots={true}
        onResults={(r) => {
          // 这里能拿到 landmarks 数据（每只手 21 点，已归一化 0~1）
          // console.log(r.landmarks);
        }}
      />
    </main>
  );
}


⸻

六、实现步骤（落地 Checklist）
	1.	静态资源
	•	下载 hand_landmarker.task 放到 /public/mediapipe/。
	•	开发期可先用 CDN 的 wasm 目录；上生产建议本地化到 /public/mediapipe/wasm/ 并替换路径。
	2.	组件接入
	•	复制上面的 HandCamera.tsx 到 /components。
	•	将你的 SVG 蒙版 替换到代码中标注位置，或用 svgMask 以 props 形式传入。
	3.	权限与启动
	•	在页面中渲染 <HandCamera />，通过用户点击按钮触发 getUserMedia。
	4.	校准与调优
	•	蒙版 viewBox 与容器 aspect-ratio 统一（上例使用 3:4 竖屏）。
	•	targetFps 在 24–30 之间权衡功耗与流畅度。
	•	需要截取「蒙版窗口内」画面时，可在 canvas 上按窗形状 getImageData / toDataURL。
	5.	降级方案
	•	若 getUserMedia 被拒或无权限，提示切换系统浏览器；或提供 <input type="file" accept="image/*" capture="environment"> 静态拍照上传（注意：此时不再实时追踪）。

⸻

七、性能与稳定性建议
	•	减少重排：容器固定比例（aspect-[3/4]），ResizeObserver 仅在视频尺寸初次就绪/旋转时同步。
	•	限帧：通过 targetFps 控制 detectForVideo 调用频次。
	•	GPU/CPU 切换：极少数机型若 WebGL 异常，可将 delegate: 'CPU' 作为兜底（检测异常时降级）。
	•	多手：numHands > 1 会更耗时，若只需单手，把 maxHands 设为 1。
	•	横竖屏：建议锁定竖屏使用；如需横屏，保证 SVG viewBox 与视频宽高一致。

⸻

八、常见坑位
	•	iOS 自动全屏/黑屏：一定加 playsinline、muted，并通过按钮启动。
	•	后置摄像头不生效：使用 二段式（先拿权限，再 enumerateDevices() 用 deviceId 精确选 back）。
	•	App 内 WebView 不支持：这不是前端代码问题，是容器权限限制。需改用系统浏览器或 App 端配置。
	•	跨域加载模型失败：生产环境请将模型与 wasm 运行时放在自己域名下的 /public。

⸻

九、数据输出与对接
	•	onResults 持续返回：

{
  landmarks: HandLandmark[][]; // 每个元素为一只手的 21 点
  handedness?: { categoryName: 'Left' | 'Right'; score: number }[];
}


	•	你可以在回调里：
	•	做手势识别（例如根据 21 点的几何关系）
	•	保存关键帧（点击快门时将 canvas 导出 toDataURL()）
	•	与后端联动（上传关键点或截图）

⸻

需要我把你的 SVG 蒙版 直接嵌到上面的组件里，或者改成 CSS 掩模裁剪视频 的形式吗？我可以帮你把那部分替换好。