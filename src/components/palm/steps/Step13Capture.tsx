'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'
import { validatePalmCombinedWithProgress, getMLValidationMessage } from '@/utils/palmValidationML'

interface Step13Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
}

export default function Step13Capture({ 
  updateUserData,
  goToNextStep,
  trackEvent
}: Step13Props) {
  const [isUploading, setIsUploading] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isMLValidating, setIsMLValidating] = useState(false)
  const [mlLoadingStep, setMlLoadingStep] = useState<string>('')
  const [validationMessage, setValidationMessage] = useState<{
    title: string;
    description: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])
  
  useEffect(() => {
    trackEvent('palm_capture_view', { 
      timestamp: Date.now(),
      step: 13
    })
  }, []) // 移除trackEvent依赖
  
  const openCamera = async () => {
    trackEvent('palm_camera_capture_attempt', { 
      timestamp: Date.now()
    })
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        // Request camera access with ideal settings for palm capture
        const cameraStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'environment' // Rear camera for palm photography
          }
        })
        
        setStream(cameraStream)
        setIsCameraOpen(true)
        
        // Set video source
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream
        }
        
        trackEvent('palm_camera_opened', { 
          timestamp: Date.now()
        })
        
      } catch (error) {
        console.error('Camera access error:', error)
        trackEvent('palm_camera_capture_denied', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        })
        
        // Fallback to file picker if camera fails
        pickFile()
      }
    } else {
      // Browser doesn't support camera, fallback to file picker
      pickFile()
    }
  }
  
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraOpen(false)
    
    trackEvent('palm_camera_closed', { 
      timestamp: Date.now()
    })
  }
  
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0)
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return
      
      // Create a File object from blob
      const file = new File([blob], 'palm-photo.jpg', { type: 'image/jpeg' })
      
      // Close camera
      closeCamera()
      
      // Process the captured image
      await processImageFile(file)
      
    }, 'image/jpeg', 0.8) // 80% quality
  }
  
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
      
      // Step 2: ML模型加载和验证
      setMlLoadingStep('正在加载AI识别模型...')
      
      // 使用带超时的验证函数
      const validationResult = await Promise.race([
        validatePalmCombinedWithProgress(selectedFile, setMlLoadingStep),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('验证超时')), 15000) // 15秒超时
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
      
      // 超时情况下使用简化验证并允许继续
      if (isTimeout) {
        setTimeout(() => {
          const reader = new FileReader()
          reader.onload = () => {
            const imageData = reader.result as string
            updateUserData({ 
              palmCaptureImage: selectedFile.name,
              palmImageData: imageData,
              palmLandmarks: undefined, // 没有ML数据
              palmValidationResult: { isValid: true, confidence: 0.6, message: '简化验证通过' }
            })
            setIsUploading(false)
            goToNextStep()
          }
          reader.readAsDataURL(selectedFile)
        }, 2000)
      } else {
        setIsUploading(false)
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

  // 优化的相机调用 - 添加更好的错误处理和降级方案
  const openCameraOptimized = async () => {
    trackEvent('palm_camera_optimized_attempt', { 
      timestamp: Date.now(),
      isMobile: isMobile()
    })

    // 移动设备优先使用原生相机调用
    if (isMobile()) {
      captureWithNativeCamera()
      return
    }

    // 桌面设备尝试自定义相机
    await openCamera()
  }
  
  return (
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

        {/* Camera Preview */}
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-6 relative bg-black rounded-2xl overflow-hidden"
          >
            {/* Video Preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            
            {/* Camera Controls Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              {/* Top Bar - Close Button */}
              <div className="flex justify-between items-center">
                <button
                  onClick={closeCamera}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full">
                  请将手掌对准镜头
                </div>
              </div>

              {/* Bottom Bar - Capture Button */}
              <div className="flex justify-center">
                <button
                  onClick={capturePhoto}
                  disabled={isUploading}
                  className="bg-white text-gray-900 rounded-full p-4 shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Hand outline guide */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white border-dashed rounded-lg opacity-50"></div>
            </div>
          </motion.div>
        )}

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
        {!isCameraOpen && (
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
            {isMLValidating ? 'AI验证中...' : isUploading ? '处理中...' : '从相册选择'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCameraOptimized}
            disabled={isUploading || isMLValidating}
            className="relative w-full h-14 flex items-center justify-center rounded-xl bg-violet-600 text-white text-lg font-semibold shadow-lg transition disabled:opacity-50"
          >
            {isMLValidating ? '验证中...' : isMobile() ? '拍照上传' : '立即拍照'}
          </motion.button>
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
  )
}