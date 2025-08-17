/**
 * MediaPipe Hand Landmarker 服务
 * 基于官方文档: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js
 */

import { 
  HandLandmarker, 
  FilesetResolver,
  HandLandmarkerResult,
  NormalizedLandmark
} from '@mediapipe/tasks-vision';

export interface HandDetectionConfig {
  // 检测参数配置
  numHands?: number;                  // 最大检测手部数量 (默认: 2)
  minHandDetectionConfidence?: number; // 最小手部检测置信度 (默认: 0.5)
  minHandPresenceConfidence?: number;  // 最小手部存在置信度 (默认: 0.5)
  minTrackingConfidence?: number;      // 最小追踪置信度 (默认: 0.5)
  
  // 运行模式
  runningMode?: 'IMAGE' | 'VIDEO';    // 运行模式 (默认: IMAGE)
  
  // 回调函数
  onResults?: (result: HandLandmarkerResult) => void;
  onError?: (error: Error) => void;
}

export interface ProcessedHandData {
  landmarks: NormalizedLandmark[];     // 21个关键点坐标
  worldLandmarks: NormalizedLandmark[]; // 世界坐标系中的关键点
  handedness: 'Left' | 'Right';        // 手的左右
  confidence: number;                  // 检测置信度
}

class HandLandmarkerService {
  private handLandmarker: HandLandmarker | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  
  // 默认配置
  private defaultConfig: HandDetectionConfig = {
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    runningMode: 'IMAGE'
  };
  
  private config: HandDetectionConfig;
  
  constructor(config?: Partial<HandDetectionConfig>) {
    this.config = { ...this.defaultConfig, ...config };
  }
  
  /**
   * 初始化 MediaPipe Hand Landmarker
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // 避免重复初始化
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = this.performInitialization();
    
    try {
      await this.initializationPromise;
      this.isInitialized = true;
    } catch (error) {
      this.initializationPromise = null;
      throw error;
    }
  }
  
  private async performInitialization(): Promise<void> {
    try {
      console.log('🤖 正在初始化 MediaPipe Hand Landmarker...');
      
      // 加载 MediaPipe WASM 文件
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      
      // 创建 Hand Landmarker
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU' // 优先使用 GPU 加速
        },
        numHands: this.config.numHands,
        minHandDetectionConfidence: this.config.minHandDetectionConfidence,
        minHandPresenceConfidence: this.config.minHandPresenceConfidence,
        minTrackingConfidence: this.config.minTrackingConfidence,
        runningMode: this.config.runningMode
      });
      
      console.log('✅ MediaPipe Hand Landmarker 初始化成功');
    } catch (error) {
      console.error('❌ MediaPipe 初始化失败:', error);
      throw new Error(`MediaPipe 初始化失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 更新配置
   */
  async updateConfig(newConfig: Partial<HandDetectionConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    if (this.handLandmarker && this.isInitialized) {
      await this.handLandmarker.setOptions({
        numHands: this.config.numHands,
        minHandDetectionConfidence: this.config.minHandDetectionConfidence,
        minHandPresenceConfidence: this.config.minHandPresenceConfidence,
        minTrackingConfidence: this.config.minTrackingConfidence,
        runningMode: this.config.runningMode
      });
    }
  }
  
  /**
   * 设置运行模式（IMAGE 或 VIDEO）
   */
  async setRunningMode(mode: 'IMAGE' | 'VIDEO'): Promise<void> {
    if (this.config.runningMode === mode) return;
    
    this.config.runningMode = mode;
    
    if (this.handLandmarker) {
      await this.handLandmarker.setOptions({ runningMode: mode });
    }
  }
  
  /**
   * 检测图片中的手部
   */
  async detectFromImage(
    image: HTMLImageElement | HTMLCanvasElement | ImageBitmap
  ): Promise<ProcessedHandData[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.handLandmarker) {
      throw new Error('Hand Landmarker 未初始化');
    }
    
    // 确保是 IMAGE 模式
    if (this.config.runningMode !== 'IMAGE') {
      await this.setRunningMode('IMAGE');
    }
    
    try {
      const results = this.handLandmarker.detect(image);
      return this.processResults(results);
    } catch (error) {
      console.error('手部检测失败:', error);
      if (this.config.onError) {
        this.config.onError(error as Error);
      }
      throw error;
    }
  }
  
  /**
   * 检测视频流中的手部（用于实时检测）
   */
  async detectFromVideoFrame(
    video: HTMLVideoElement,
    timestamp: number
  ): Promise<ProcessedHandData[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.handLandmarker) {
      throw new Error('Hand Landmarker 未初始化');
    }
    
    // 确保是 VIDEO 模式
    if (this.config.runningMode !== 'VIDEO') {
      await this.setRunningMode('VIDEO');
    }
    
    try {
      const results = this.handLandmarker.detectForVideo(video, timestamp);
      return this.processResults(results);
    } catch (error) {
      console.error('视频手部检测失败:', error);
      if (this.config.onError) {
        this.config.onError(error as Error);
      }
      throw error;
    }
  }
  
  /**
   * 处理检测结果
   */
  private processResults(results: HandLandmarkerResult): ProcessedHandData[] {
    if (!results.landmarks || results.landmarks.length === 0) {
      return [];
    }
    
    const processedHands: ProcessedHandData[] = [];
    
    for (let i = 0; i < results.landmarks.length; i++) {
      const landmarks = results.landmarks[i];
      const worldLandmarks = results.worldLandmarks?.[i] || [];
      const handedness = results.handednesses?.[i]?.[0];
      
      if (landmarks && landmarks.length === 21) {
        processedHands.push({
          landmarks,
          worldLandmarks,
          handedness: handedness?.categoryName === 'Left' ? 'Left' : 'Right',
          confidence: handedness?.score || 0
        });
      }
    }
    
    // 触发回调
    if (this.config.onResults) {
      this.config.onResults(results);
    }
    
    return processedHands;
  }
  
  /**
   * 获取手指和手掌的具体关键点
   */
  static getNamedLandmarks(landmarks: NormalizedLandmark[]) {
    if (landmarks.length !== 21) {
      throw new Error('无效的关键点数量，期望21个关键点');
    }
    
    return {
      wrist: landmarks[0],
      
      thumb: {
        cmc: landmarks[1],
        mcp: landmarks[2],
        ip: landmarks[3],
        tip: landmarks[4]
      },
      
      indexFinger: {
        mcp: landmarks[5],
        pip: landmarks[6],
        dip: landmarks[7],
        tip: landmarks[8]
      },
      
      middleFinger: {
        mcp: landmarks[9],
        pip: landmarks[10],
        dip: landmarks[11],
        tip: landmarks[12]
      },
      
      ringFinger: {
        mcp: landmarks[13],
        pip: landmarks[14],
        dip: landmarks[15],
        tip: landmarks[16]
      },
      
      pinky: {
        mcp: landmarks[17],
        pip: landmarks[18],
        dip: landmarks[19],
        tip: landmarks[20]
      }
    };
  }
  
  /**
   * 绘制手部关键点和连接线
   */
  static drawHandLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    canvasWidth: number,
    canvasHeight: number,
    options?: {
      pointColor?: string;
      lineColor?: string;
      pointRadius?: number;
      lineWidth?: number;
    }
  ): void {
    const { 
      pointColor = '#00ff00',
      lineColor = '#00ff00',
      pointRadius = 5,
      lineWidth = 2
    } = options || {};
    
    // 绘制连接线
    const connections = [
      // 拇指
      [0, 1], [1, 2], [2, 3], [3, 4],
      // 食指
      [0, 5], [5, 6], [6, 7], [7, 8],
      // 中指
      [5, 9], [9, 10], [10, 11], [11, 12],
      // 无名指
      [9, 13], [13, 14], [14, 15], [15, 16],
      // 小指
      [13, 17], [17, 18], [18, 19], [19, 20],
      // 手掌
      [0, 17]
    ];
    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start as number];
      const endPoint = landmarks[end as number];
      
      if (startPoint && endPoint) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * canvasWidth, startPoint.y * canvasHeight);
        ctx.lineTo(endPoint.x * canvasWidth, endPoint.y * canvasHeight);
        ctx.stroke();
      }
    });
    
    // 绘制关键点
    ctx.fillStyle = pointColor;
    
    landmarks.forEach((landmark) => {
      ctx.beginPath();
      ctx.arc(
        landmark.x * canvasWidth,
        landmark.y * canvasHeight,
        pointRadius,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  }
  
  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

// 导出单例实例
export const handLandmarkerService = new HandLandmarkerService();

export default HandLandmarkerService;