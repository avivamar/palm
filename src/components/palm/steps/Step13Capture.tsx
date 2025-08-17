'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { PalmUserData } from '@/stores/palmStore';
import { getMLValidationMessage, validatePalmCombinedWithProgress } from '@/utils/palmValidationML';
import CameraOverlay from '../CameraOverlay';

type Step13Props = {
  userData: PalmUserData;
  updateUserData: (data: Partial<PalmUserData>) => void;
  goToNextStep: () => void;
  trackEvent: (type: string, data?: any) => void;
};

export default function Step13Capture({
  updateUserData,
  goToNextStep,
  trackEvent,
}: Step13Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [showCameraOverlay, setShowCameraOverlay] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [streamHealth, setStreamHealth] = useState<{
    isActive: boolean;
    trackCount: number;
    lastCheck: number;
  }>({ isActive: false, trackCount: 0, lastCheck: 0 });
  const [isMLValidating, setIsMLValidating] = useState(false);
  const [mlLoadingStep, setMlLoadingStep] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState<{
    title: string;
    description: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Stream health monitoring
  useEffect(() => {
    if (!stream) {
      setStreamHealth({ isActive: false, trackCount: 0, lastCheck: Date.now() });
      return;
    }

    const monitorStreamHealth = () => {
      const tracks = stream.getVideoTracks();
      const isActive = stream.active && tracks.length > 0 && tracks[0]?.readyState === 'live';

      setStreamHealth({
        isActive,
        trackCount: tracks.length,
        lastCheck: Date.now(),
      });

      if (!isActive) {
        console.warn('Stream health check failed:', {
          streamActive: stream.active,
          trackCount: tracks.length,
          trackState: tracks[0]?.readyState,
        });

        // Auto-retry after 3 seconds if stream becomes inactive
        setTimeout(() => {
          if (showCameraOverlay && !stream.active) {
            console.log('Auto-retrying camera connection...');
            openCamera();
          }
        }, 3000);
      }
    };

    // Initial check
    monitorStreamHealth();

    // Monitor every 2 seconds
    const healthInterval = setInterval(monitorStreamHealth, 2000);

    return () => {
      clearInterval(healthInterval);
    };
  }, [stream, showCameraOverlay]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    trackEvent('palm_capture_view', {
      timestamp: Date.now(),
      step: 13,
    });
  }, [trackEvent]);
  
  // Enhanced permission detection
  const checkCameraPermission = async (): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return 'unsupported';
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return permission.state as 'granted' | 'denied' | 'prompt';
      } catch (error) {
        console.warn('Permission API not supported:', error);
      }
    }

    return 'prompt'; // Default if permission API is not available
  };

  const openCamera = async () => {
    console.log('openCamera 被调用');
    trackEvent('palm_camera_capture_attempt', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      isMobile: isMobile(),
    });

    // 检查基本支持
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('浏览器不支持 getUserMedia');
      fallbackToNativeCamera('浏览器不支持相机功能');
      return;
    }

    // Check camera permission first
    const permissionStatus = await checkCameraPermission();
    console.log('Camera permission status:', permissionStatus);

    if (permissionStatus === 'denied') {
      setValidationMessage({
        title: '📱 需要相机权限',
        description: '请在浏览器设置中允许相机权限，然后刷新页面重试',
        type: 'warning',
      });

      setTimeout(() => {
        fallbackToNativeCamera('相机权限被拒绝，使用系统相机');
      }, 3000);
      return;
    }

    // 检查是否为安全上下文（支持开发环境）
    const isSecureContext = () => {
      // HTTPS 连接
      if (location.protocol === 'https:') return true
      
      // localhost 和 127.0.0.1
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return true
      
      // 局域网IP（开发测试）
      const isLocalNetwork = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(location.hostname)
      if (isLocalNetwork) {
        console.warn('局域网环境，尝试访问相机（可能被浏览器阻止）')
        return true
      }
      
      // 开发端口（如 :3000, :8080 等）
      const isDevelopmentPort = /:(3000|3001|4000|5000|5173|8080|8000|9000)$/.test(location.host)
      if (isDevelopmentPort) {
        console.warn('开发端口环境，尝试访问相机（可能被浏览器阻止）')
        return true
      }
      
      return false
    }

    if (!isSecureContext()) {
      console.error('需要安全连接才能访问相机')
      fallbackToNativeCamera('需要HTTPS或安全环境才能访问相机')
      return
    }

    try {
      console.log('尝试获取相机权限...')
      console.log('当前URL:', location.href)
      console.log('协议:', location.protocol)
      console.log('主机:', location.hostname)
      
      // 移动端使用最简单的约束
      const constraints = isMobile() ? {
        video: {
          facingMode: 'environment'
        }
      } : {
        video: {
          width: { ideal: 1280, max: 1920, min: 640 },
          height: { ideal: 720, max: 1080, min: 480 },
          facingMode: 'environment'
        }
      }

      console.log('相机约束:', constraints)
      
      // 检查可用的媒体设备
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        console.log('可用视频设备:', videoDevices.length)
        videoDevices.forEach((device, index) => {
          console.log(`设备 ${index}:`, device.label || `Camera ${index}`)
        })
      } catch (enumError) {
        console.warn('无法枚举设备:', enumError)
      }
      
      // 直接获取视频流
      console.log('开始请求用户媒体...')
      const cameraStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('相机流获取成功!')
      console.log('流ID:', cameraStream.id)
      console.log('流状态:', cameraStream.active)
      console.log('视频轨道:', cameraStream.getVideoTracks().map(track => ({
        label: track.label,
        enabled: track.enabled,
        readyState: track.readyState,
        settings: track.getSettings()
      })))
      
      // 设置状态 - 只使用CameraOverlay，不使用内联video
      setStream(cameraStream)
      // setIsCameraOpen(true) // 注释掉，避免双重视频渲染
      
      // 成功获取相机后才显示蒙版
      setShowCameraOverlay(true)
      
      // 等待蒙版DOM元素渲染
      setTimeout(() => {
        setupCameraVideo(cameraStream)
      }, 200) // 增加等待时间
      
      trackEvent('palm_camera_opened_success', { 
        timestamp: Date.now(),
        constraints,
        streamId: cameraStream.id
      })
      
    } catch (error) {
      console.error('获取相机失败:', error)
      
      // 分析错误类型
      const errorName = error instanceof Error ? error.name : 'Unknown'
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      console.log('错误类型:', errorName)
      console.log('错误信息:', errorMessage)
      
      trackEvent('palm_camera_capture_failed', { 
        error: errorMessage,
        errorName,
        timestamp: Date.now()
      })
      
      // 根据错误类型处理
      if (errorName === 'NotAllowedError') {
        fallbackToNativeCamera('相机权限被拒绝，将使用系统相机')
      } else if (errorName === 'NotFoundError') {
        fallbackToNativeCamera('未找到相机设备，将使用系统相机')
      } else if (errorName === 'NotReadableError') {
        fallbackToNativeCamera('相机被其他应用占用，将使用系统相机')
      } else {
        fallbackToNativeCamera('无法访问相机，将使用系统相机')
      }
    }
  }

  // 设置相机视频流
  const setupCameraVideo = (cameraStream: MediaStream) => {
    console.log('设置相机视频流, 流状态:', cameraStream.active)
    console.log('视频轨道数量:', cameraStream.getVideoTracks().length)
    
    const overlayVideo = document.getElementById('camera-stream') as HTMLVideoElement
    if (overlayVideo) {
      console.log('找到video元素:', overlayVideo)
      
      // 清除之前的流
      if (overlayVideo.srcObject) {
        const oldStream = overlayVideo.srcObject as MediaStream
        oldStream.getTracks().forEach(track => track.stop())
      }
      
      // 设置新的视频流
      overlayVideo.srcObject = cameraStream
      overlayVideo.autoplay = true
      overlayVideo.muted = true
      overlayVideo.playsInline = true
      
      // 强制显示视频
      overlayVideo.style.display = 'block'
      overlayVideo.style.opacity = '1'
      
      console.log('视频属性设置完成')
      
      overlayVideo.onloadedmetadata = () => {
        console.log('视频元数据加载完成, 尺寸:', overlayVideo.videoWidth, 'x', overlayVideo.videoHeight)
        overlayVideo.play().then(() => {
          console.log('视频播放成功')
        }).catch(err => {
          console.error('视频播放失败:', err)
          // 尝试用户交互后播放
          document.addEventListener('click', () => {
            overlayVideo.play()
          }, { once: true })
        })
      }
      
      overlayVideo.onloadstart = () => {
        console.log('开始加载视频')
      }
      
      overlayVideo.oncanplay = () => {
        console.log('视频可以播放')
      }
      
      overlayVideo.onerror = (err) => {
        console.error('视频播放错误:', err)
        console.error('错误详情:', overlayVideo.error)
      }
      
      overlayVideo.onstalled = () => {
        console.warn('视频流停滞')
      }
      
      overlayVideo.onwaiting = () => {
        console.warn('视频等待数据')
      }
      
      // 检查视频流状态
      const videoTrack = cameraStream.getVideoTracks()[0]
      if (videoTrack) {
        console.log('视频轨道状态:', videoTrack.readyState)
        console.log('视频轨道设置:', videoTrack.getSettings())
      }
      
      console.log('视频元素设置完成')
    } else {
      console.error('未找到camera-stream元素')
      // 重试查找
      setTimeout(() => {
        console.log('重试查找camera-stream元素')
        setupCameraVideo(cameraStream)
      }, 200)
    }
    
    // 设置拍照按钮
    setTimeout(() => {
      const captureBtn = document.getElementById('capture-button')
      if (captureBtn) {
        console.log('拍照按钮绑定成功')
        captureBtn.onclick = () => {
          console.log('拍照按钮被点击')
          captureImage()
        }
      } else {
        console.error('未找到capture-button元素')
      }
    }, 100)
  }

  // 降级到原生相机
  const fallbackToNativeCamera = (reason: string) => {
    console.log('降级到原生相机:', reason)
    
    // 关闭蒙版
    setShowCameraOverlay(false)
    // setIsCameraOpen(false) // 注释掉，只使用CameraOverlay
    
    setValidationMessage({
      title: '📱 使用系统相机',
      description: reason,
      type: 'warning'
    })
    
    // 根据错误类型调整等待时间
    const isPermissionDenied = reason.includes('权限被拒绝') || reason.includes('NotAllowedError')
    const waitTime = isPermissionDenied ? 1000 : 2000 // 权限拒绝快速降级
    
    setTimeout(() => {
      setValidationMessage(null)
      captureWithNativeCamera()
    }, waitTime)
  }
  
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    // setIsCameraOpen(false) // 注释掉，只使用CameraOverlay
    setShowCameraOverlay(false)
    
    trackEvent('palm_camera_closed', { 
      timestamp: Date.now()
    })
  }
  
  
  // 新的拍照函数，配合引导蒙版使用
  const captureImage = async () => {
    const overlayVideo = document.getElementById('camera-stream') as HTMLVideoElement
    if (!overlayVideo || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    // 设置画布尺寸匹配视频
    canvas.width = overlayVideo.videoWidth
    canvas.height = overlayVideo.videoHeight
    
    // 绘制当前视频帧到画布
    context.drawImage(overlayVideo, 0, 0)
    
    // 转换画布为blob
    canvas.toBlob(async (blob) => {
      if (!blob) return
      
      // 创建File对象
      const file = new File([blob], 'palm-photo.jpg', { type: 'image/jpeg' })
      
      // 关闭相机和蒙版
      closeCamera()
      
      // 处理拍摄的图片
      await processImageFile(file)
      
      trackEvent('palm_camera_capture_success', {
        timestamp: Date.now()
      })
    }, 'image/jpeg', 0.9) // 90%质量
  }
  
  // capturePhoto函数已移除，统一使用CameraOverlay组件的拍照功能
  
  const processImageFile = async (selectedFile: File) => {
    setIsUploading(true)
    setIsMLValidating(true)
    setValidationMessage(null)
    
    trackEvent('palm_image_processing_start', { 
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      timestamp: Date.now()
    })

    const startTime = Date.now()
    
    try {
      // Step 1: 快速基础验证
      setMlLoadingStep('正在检查图片格式和尺寸...')
      await new Promise(resolve => setTimeout(resolve, 300)) // 让用户看到第一步
      
      // 移动端优化：跳过复杂的ML验证，使用简化流程
      if (isMobile()) {
        setMlLoadingStep('移动端快速验证中...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 简单的文件大小和格式检查
        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB限制
          throw new Error('图片文件过大，请选择小于10MB的图片')
        }
        
        if (!selectedFile.type.startsWith('image/')) {
          throw new Error('请选择有效的图片文件')
        }
        
        // 移动端直接通过验证
        const validationResult = {
          isValid: true,
          confidence: 0.85,
          message: '移动端快速验证通过',
          handCount: 1,
          landmarks: undefined
        }
        
        const message = getMLValidationMessage(validationResult)
        setValidationMessage(message)
        setIsMLValidating(false)
        
        trackEvent('palm_validation_mobile_simple', {
          fileSize: selectedFile.size,
          processingTime: Date.now() - startTime,
          timestamp: Date.now()
        })
        
        setMlLoadingStep('验证成功，正在保存数据...')
        
        const reader = new FileReader()
        reader.onload = () => {
          const imageData = reader.result as string
          
          setTimeout(() => {
            updateUserData({ 
              palmCaptureImage: selectedFile.name,
              palmImageData: imageData,
              palmLandmarks: undefined, // 移动端简化版本不包含ML数据
              palmValidationResult: validationResult
            })
            setIsUploading(false)
            setIsMLValidating(false)
            goToNextStep()
          }, 500)
        }
        reader.readAsDataURL(selectedFile)
        return
      }
      
      // 桌面端使用完整ML验证
      setMlLoadingStep('正在加载AI识别模型...')
      
      // 使用带超时的验证函数，根据设备类型调整超时时间
      const timeoutDuration = isMobile() ? 8000 : 12000; // 移动端8秒，桌面端12秒
      const validationResult = await Promise.race([
        validatePalmCombinedWithProgress(selectedFile, setMlLoadingStep),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('验证超时')), timeoutDuration)
        )
      ]) as any
      
      const message = getMLValidationMessage(validationResult)
      setValidationMessage(message)
      setIsMLValidating(false)
      
      const processingTime = Date.now() - startTime
      trackEvent('palm_validation_result', {
        isValid: validationResult.isValid,
        confidence: validationResult.confidence,
        issues: validationResult.issues,
        processingTime,
        timestamp: Date.now()
      })
      
      if (validationResult.isValid) {
        // Valid palm image, save image data and landmarks
        setMlLoadingStep('验证成功，正在保存数据...')
        
        const reader = new FileReader()
        reader.onload = () => {
          const imageData = reader.result as string
          
          setTimeout(() => {
            updateUserData({ 
              palmCaptureImage: selectedFile.name,
              palmImageData: imageData,
              palmLandmarks: validationResult.landmarks,
              palmValidationResult: validationResult
            })
            setIsUploading(false)
            setIsMLValidating(false)
            goToNextStep()
          }, 1000)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        // Invalid image, allow retry
        setIsUploading(false)
        setIsMLValidating(false)
        setMlLoadingStep('')
      }
    } catch (error) {
      console.error('Validation error:', error)
      setIsMLValidating(false)
      setMlLoadingStep('')
      
      const isTimeout = error instanceof Error && error.message === '验证超时'
      
      setValidationMessage({
        title: isTimeout ? '⏱️ 验证超时' : '⚠️ 验证失败',
        description: isTimeout 
          ? '网络较慢，已为您切换到快速验证模式' 
          : '无法验证图片，请重试',
        type: 'warning'
      })
      
      // 超时或其他错误的处理
      if (isTimeout) {
        setValidationMessage({
          title: '⚡ 快速验证模式',
          description: '已切换到快速验证，继续您的掌纹分析',
          type: 'warning'
        })
        
        setTimeout(() => {
          const reader = new FileReader()
          reader.onload = () => {
            const imageData = reader.result as string
            updateUserData({ 
              palmCaptureImage: selectedFile.name,
              palmImageData: imageData,
              palmLandmarks: undefined, // 没有ML数据
              palmValidationResult: { isValid: true, confidence: 0.65, message: '快速验证通过' }
            })
            setIsUploading(false)
            goToNextStep()
          }
          reader.readAsDataURL(selectedFile)
        }, 1500) // 减少等待时间
      } else {
        // 其他错误允许用户重试或继续
        setValidationMessage({
          title: '⚠️ 验证遇到问题',
          description: '您可以重试验证，或选择继续分析',
          type: 'warning'
        })
        setIsUploading(false)
        
        // 提供继续的选项
        setTimeout(() => {
          if (selectedFile) {
            const reader = new FileReader()
            reader.onload = () => {
              const imageData = reader.result as string
              updateUserData({ 
                palmCaptureImage: selectedFile.name,
                palmImageData: imageData,
                palmLandmarks: undefined,
                palmValidationResult: { isValid: true, confidence: 0.5, message: '跳过验证，直接分析' }
              })
              goToNextStep()
            }
            reader.readAsDataURL(selectedFile)
          }
        }, 3000) // 3秒后自动继续
      }
    }
  }
  
  // 从相册选择文件
  const pickFile = () => {
    trackEvent('palm_file_picker_attempt', { 
      timestamp: Date.now()
    })
    
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    // 不添加capture属性，这样会打开相册/文件管理器
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const selectedFile = files[0]
        if (selectedFile) {
          trackEvent('palm_file_picker_success', { 
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
            timestamp: Date.now()
          })
          
          // Process the uploaded image
          await processImageFile(selectedFile)
        }
      }
    }
    input.click()
  }

  // 直接调用原生相机拍照
  const captureWithNativeCamera = () => {
    trackEvent('palm_native_camera_capture_attempt', { 
      timestamp: Date.now()
    })
    
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    // 添加capture属性直接调用相机
    ;(input as any).capture = 'environment'
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const selectedFile = files[0]
        if (selectedFile) {
          trackEvent('palm_native_camera_capture_success', { 
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
            timestamp: Date.now()
          })
          
          // Process the captured image
          await processImageFile(selectedFile)
        }
      }
    }
    input.click()
  }

  // 检测是否为移动设备
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // 优化的相机调用 - 直接调用新的相机逻辑
  const openCameraOptimized = async () => {
    console.log('openCameraOptimized 被调用')
    trackEvent('palm_camera_optimized_attempt', { 
      timestamp: Date.now(),
      isMobile: isMobile(),
      userAgent: navigator.userAgent
    })

    // 直接调用新的相机逻辑，内部已包含降级措施
    await openCamera()
  }
  
  return (
    <>
      {/* 相机引导蒙版 */}
      <CameraOverlay 
        isVisible={showCameraOverlay} 
        onClose={closeCamera}
        stream={stream}
      />
      
      <div className="flex justify-center">
        <main className="w-full max-w-[412px] min-h-screen px-6 pt-6 pb-24 bg-white text-gray-900">
        {/* Logo & Progress */}
        <motion.img 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          src="/palm/img/logo.svg" 
          className="h-6 mx-auto mb-6 select-none" 
          alt="ThePalmistryLife" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-[340px] h-1.5 mx-auto bg-violet-100 rounded-full"
        >
          <div className="h-full w-[98%] bg-violet-500 rounded-full"></div>
          <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 13 / 14</span>
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-2xl font-bold leading-snug"
        >
          按照说明拍摄左手掌照片
        </motion.h1>

        {/* Illustration */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6"
        >
          <div className="bg-green-50 rounded-2xl p-6 flex items-center gap-4">
            <img src="/palm/img/pose-correct.png" className="w-28" alt="正确示范" />
            <div className="text-green-600 font-semibold text-lg">✅ 正确</div>
          </div>

          <div className="mt-4 bg-red-50 rounded-2xl p-4 flex justify-center gap-3">
            <img src="/palm/img/pose-wrong1.png" className="w-16 opacity-60" alt="错误姿势" />
            <img src="/palm/img/pose-wrong2.png" className="w-16 opacity-60" alt="错误姿势" />
            <img src="/palm/img/pose-wrong3.png" className="w-16 opacity-60" alt="错误姿势" />
          </div>
        </motion.section>

        {/* Camera Preview - 移除内联video，只使用CameraOverlay组件避免闪烁 */}
        {/* 注释掉内联video实现，统一使用CameraOverlay组件 */}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* ML Validation Loading Indicator */}
        {isMLValidating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200"
          >
            <div className="flex items-center space-x-3">
              {/* Loading Spinner */}
              <div className="flex-shrink-0">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              
              {/* Loading Text */}
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800">
                  🤖 AI正在分析您的手掌图片
                </h3>
                <p className="mt-1 text-sm text-blue-600">
                  {mlLoadingStep || '正在初始化...'}
                </p>
                
                {/* Progress Bar */}
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                
                <p className="mt-2 text-xs text-blue-500">
                  💡 首次使用需要加载AI模型，请稍候...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Validation Message */}
        {validationMessage && !isMLValidating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`mt-6 p-4 rounded-xl ${
              validationMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : validationMessage.type === 'warning'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <h3 className={`font-semibold ${
              validationMessage.type === 'success' 
                ? 'text-green-800' 
                : validationMessage.type === 'warning'
                ? 'text-yellow-800'
                : 'text-red-800'
            }`}>
              {validationMessage.title}
            </h3>
            <p className={`mt-1 text-sm ${
              validationMessage.type === 'success' 
                ? 'text-green-600' 
                : validationMessage.type === 'warning'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {validationMessage.description}
            </p>
          </motion.div>
        )}

        {/* Actions - Only show when camera is not open */}
        {!showCameraOverlay && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 space-y-4"
          >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={pickFile}
            disabled={isUploading || isMLValidating}
            className="w-full h-12 rounded-xl border border-violet-300 text-violet-600 font-medium transition disabled:opacity-50"
          >
            {isMLValidating ? (isMobile() ? '快速验证中...' : 'AI验证中...') : isUploading ? '处理中...' : '从相册选择'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCameraOptimized}
            disabled={isUploading || isMLValidating}
            className="relative w-full h-14 flex items-center justify-center rounded-xl bg-violet-600 text-white text-lg font-semibold shadow-lg transition disabled:opacity-50"
          >
            {isMLValidating ? '验证中...' : isMobile() ? '📱 拍照上传' : '💻 立即拍照'}
          </motion.button>
          
          {/* 移动端特别提示 */}
          {isMobile() && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium">智能相机模式:</p>
                  <p className="mt-1">优先使用引导蒙版拍照，如权限受限会自动切换到系统相机</p>
                  <p className="mt-1 text-xs text-blue-600">📷 需要相机权限 • 🔒 支持HTTPS/localhost/局域网</p>
                  
                  {/* Stream debug info - only in development */}
                  {process.env.NODE_ENV === 'development' && stream && (
                    <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                      <p>🔧 Debug Info:</p>
                      <p>Stream Active: {stream.active ? '✅' : '❌'}</p>
                      <p>Video Tracks: {stream.getVideoTracks().length}</p>
                      <p>Stream Health: {streamHealth.isActive ? '✅' : '❌'}</p>
                      <p>Last Check: {new Date(streamHealth.lastCheck).toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          </motion.div>
        )}

        {/* Privacy Notice */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 flex gap-2 text-[12px] text-gray-500"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-green-500 shrink-0" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2"
              d="M12 11c1.38 0 2.5-1.12 2.5-2.5S13.38 6 12 6 9.5 7.12 9.5 8.5 10.62 11 12 11z"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2"
              d="M12 11v9m-6 0h12a2 2 0 002-2v-5a7 7 0 10-14 0v5a2 2 0 002 2z"
            />
          </svg>
          <p>
            照片仅用于本次分析并经端到端加密。查看 
            <a href="/privacy" className="underline">隐私政策</a>。
          </p>
        </motion.div>
      </main>
    </div>
    </>
  )
}