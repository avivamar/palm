'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'
import CameraOverlayOptimized from '../CameraOverlayOptimized'

type Step13Props = {
  userData: PalmUserData;
  updateUserData: (data: Partial<PalmUserData>) => void;
  goToNextStep: () => void;
  trackEvent: (type: string, data?: any) => void;
};

export default function Step13CaptureOptimized({
  userData,
  updateUserData,
  goToNextStep,
  trackEvent,
}: Step13Props) {
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // 打开相机 - 基于竞品的成功策略
  const openCameraOptimized = async () => {
    console.log('Opening optimized camera...')
    setErrorMessage(null)
    
    trackEvent('palm_camera_optimized_open', {
      timestamp: Date.now(),
      isMobile: isMobile(),
    })

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('您的浏览器不支持相机功能')
      return
    }

    try {
      // 简单直接的相机获取
      const cameraStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      
      console.log('Camera stream obtained successfully')
      setStream(cameraStream)
      setShowCamera(true)
      
    } catch (error) {
      console.error('Camera access failed:', error)
      const errorName = error instanceof Error ? error.name : 'UnknownError'
      
      if (errorName === 'NotAllowedError') {
        setErrorMessage('请允许相机权限后重试')
      } else if (errorName === 'NotFoundError') {
        setErrorMessage('未找到相机设备')
      } else {
        setErrorMessage('相机访问失败，请使用文件上传')
      }
    }
  }

  // 处理拍照结果
  const handleCapture = (imageData: string) => {
    console.log('Photo captured!')
    setIsProcessing(true)
    
    trackEvent('palm_photo_captured', {
      timestamp: Date.now(),
      method: 'camera_optimized'
    })
    
    // 保存图片数据
    updateUserData({ 
      palmImageData: imageData,
      palmCaptureMethod: 'camera'
    })
    
    // 清理相机流
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    
    setShowCamera(false)
    setIsProcessing(false)
    
    // 进入下一步
    goToNextStep()
  }

  // 关闭相机
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  // 文件上传
  const handleFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const file = files[0]
        if (file) {
          setIsProcessing(true)
          
          const reader = new FileReader()
          reader.onload = () => {
            const imageData = reader.result as string
            
            updateUserData({ 
              palmImageData: imageData,
              palmCaptureMethod: 'file'
            })
            
            trackEvent('palm_file_uploaded', {
              timestamp: Date.now(),
              fileName: file.name,
              fileSize: file.size
            })
            
            setIsProcessing(false)
            goToNextStep()
          }
          reader.readAsDataURL(file)
        }
      }
    }
    input.click()
  }

  return (
    <>
      {/* 优化版相机蒙版 */}
      <CameraOverlayOptimized
        isVisible={showCamera}
        onClose={closeCamera}
        onCapture={handleCapture}
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
            <div className="h-full w-[93%] bg-violet-500 rounded-full"></div>
            <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 13 / 14</span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-2xl font-bold leading-snug"
          >
            拍摄手掌照片
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-3 text-gray-600"
          >
            请按照指示拍摄清晰的手掌照片，AI将分析您的掌纹特征
          </motion.p>

          {/* Illustration */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6">
              {/* 手掌示意图 */}
              <div className="flex justify-center mb-4">
                <svg width="120" height="150" viewBox="0 0 120 150" fill="none">
                  <path
                    d="M60 140 C40 140 25 125 25 105 L25 65 C25 50 28 40 33 33 L33 20 C33 10 38 5 43 5 C48 5 53 10 53 20 L53 15 C53 5 58 0 63 0 C68 0 73 5 73 15 L73 13 C73 3 78 -2 83 -2 C88 -2 93 3 93 13 L93 18 C93 8 98 3 103 3 C108 3 113 8 113 18 L113 65 C113 65 115 80 110 100 C105 120 85 140 60 140 Z"
                    fill="url(#gradient)"
                    fillOpacity="0.3"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="60" y1="0" x2="60" y2="140">
                      <stop stopColor="#8B5CF6" />
                      <stop offset="1" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-violet-600">拍摄要求</p>
                <ul className="mt-2 text-xs text-gray-600 space-y-1">
                  <li>✓ 手掌平整展开</li>
                  <li>✓ 光线充足均匀</li>
                  <li>✓ 掌纹清晰可见</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 space-y-3"
          >
            {/* 主要操作：拍照 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCameraOptimized}
              disabled={isProcessing}
              className="relative w-full h-14 flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-lg font-semibold shadow-lg transition disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  处理中...
                </span>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  立即拍照
                </>
              )}
            </motion.button>

            {/* 次要操作：上传 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFileUpload}
              disabled={isProcessing}
              className="w-full h-12 rounded-xl border-2 border-violet-300 text-violet-600 font-medium transition hover:bg-violet-50 disabled:opacity-50"
            >
              从相册选择
            </motion.button>
          </motion.div>

          {/* Privacy Notice */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex gap-2 text-xs text-gray-600">
              <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="font-medium text-gray-700">隐私保护</p>
                <p>照片仅用于本次分析，处理后立即删除，不会存储或分享您的数据。</p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}