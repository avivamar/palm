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
  userData: _userData, // 暂时未使用，用下划线前缀避免编译警告
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

  // 从相册选择照片
  const handleGallerySelect = () => {
    trackEvent('palm_gallery_select', {
      timestamp: Date.now(),
      isMobile: isMobile(),
    })
    
    // 创建文件输入，只从相册选择，不弹出对话框
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    // 不设置capture属性，直接从相册选择
    
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const file = files[0]
        if (file) {
          console.log('File selected from gallery:', file.name)
          setIsProcessing(true)
          
          const reader = new FileReader()
          reader.onload = () => {
            const imageData = reader.result as string
            
            updateUserData({ 
              palmImageData: imageData,
              palmCaptureMethod: 'gallery'
            })
            
            trackEvent('palm_gallery_upload_success', {
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

          {/* Illustration - 恢复完整的拍摄要求 */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6"
          >
            <div className="bg-green-50 rounded-2xl p-6 flex items-center gap-4">
              <img src="/palm/img/pose-correct.png" className="w-28" alt="正确示范" />
              <div className="text-green-600 font-semibold text-lg">✅ 正确姿势</div>
            </div>

            <div className="mt-4 bg-red-50 rounded-2xl p-4 flex justify-center gap-3">
              <img src="/palm/img/pose-wrong1.png" className="w-16 opacity-60" alt="错误姿势" />
              <img src="/palm/img/pose-wrong2.png" className="w-16 opacity-60" alt="错误姿势" />
              <img src="/palm/img/pose-wrong3.png" className="w-16 opacity-60" alt="错误姿势" />
            </div>

            {/* 详细拍摄要求 */}
            <div className="mt-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-violet-600 mb-3">📸 拍摄技巧</p>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>手掌完全展开</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>光线充足均匀</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>掌纹清晰可见</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>背景简洁干净</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>避免阴影遮挡</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>保持手掌稳定</span>
                  </div>
                </div>
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

            {/* 次要操作：从相册选择 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGallerySelect}
              disabled={isProcessing}
              className="w-full h-12 rounded-xl border-2 border-violet-300 text-violet-600 font-medium transition hover:bg-violet-50 disabled:opacity-50 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
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