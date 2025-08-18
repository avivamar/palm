'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

type Step13Props = {
  userData: PalmUserData;
  updateUserData: (data: Partial<PalmUserData>) => void;
  goToNextStep: () => void;
  trackEvent: (type: string, data?: any) => void;
};

export default function Step13CaptureSimple({
  updateUserData,
  goToNextStep,
  trackEvent,
}: Step13Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // 基于 stable 版本的简化相机策略
  const handleCameraCapture = async () => {
    console.log('handleCameraCapture: 开始相机捕获')
    setErrorMessage(null)
    setIsProcessing(true)
    
    trackEvent('palm_camera_simple_attempt', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      isMobile: isMobile(),
    })

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('浏览器不支持相机功能')
      setErrorMessage('您的浏览器不支持相机功能，请使用文件上传')
      setIsProcessing(false)
      return
    }

    try {
      console.log('testing camera permission...')
      
      // 简单的相机权限测试 - 不保持流
      const testStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      console.log('相机权限测试成功')
      
      // 立即停止测试流
      testStream.getTracks().forEach(track => track.stop())
      
      // 模拟拍照处理
      setTimeout(() => {
        console.log('模拟拍照成功')
        
        // 保存捕获信息
        updateUserData({ 
          palmCaptureImage: 'camera_capture_' + Date.now() + '.jpg',
          palmCaptureMethod: 'camera'
        })
        
        trackEvent('palm_camera_capture_success', {
          timestamp: Date.now(),
          method: 'camera'
        })
        
        setIsProcessing(false)
        goToNextStep()
      }, 2000) // 2秒模拟拍照时间
      
    } catch (error) {
      console.error('相机访问失败:', error)
      
      const errorName = error instanceof Error ? error.name : 'UnknownError'
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      trackEvent('palm_camera_capture_failed', { 
        error: errorMessage,
        errorName,
        timestamp: Date.now()
      })
      
      if (errorName === 'NotAllowedError') {
        setErrorMessage('相机权限被拒绝，请允许相机权限后重试，或使用文件上传')
      } else if (errorName === 'NotFoundError') {
        setErrorMessage('未找到相机设备，请使用文件上传')
      } else if (errorName === 'NotReadableError') {
        setErrorMessage('相机被其他应用占用，请关闭其他应用后重试')
      } else {
        setErrorMessage('相机访问失败，请使用文件上传')
      }
      
      setIsProcessing(false)
    }
  }

  // 文件上传处理
  const handleFileUpload = () => {
    console.log('handleFileUpload: 开始文件上传')
    setErrorMessage(null)
    
    trackEvent('palm_file_upload_attempt', {
      timestamp: Date.now(),
    })
    
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const selectedFile = files[0]
        if (selectedFile) {
          console.log('文件选择成功:', selectedFile.name)
          
          setIsProcessing(true)
          
          // 模拟文件处理
          setTimeout(() => {
            updateUserData({ 
              palmCaptureImage: selectedFile.name,
              palmCaptureMethod: 'file'
            })
            
            trackEvent('palm_file_upload_success', {
              timestamp: Date.now(),
              fileName: selectedFile.name,
              fileSize: selectedFile.size
            })
            
            setIsProcessing(false)
            goToNextStep()
          }, 1500)
        }
      }
    }
    input.click()
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
          拍摄或上传手掌照片
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
            <div className="text-green-600 font-semibold text-lg">✅ 正确姿势</div>
          </div>

          <div className="mt-4 bg-red-50 rounded-2xl p-4 flex justify-center gap-3">
            <img src="/palm/img/pose-wrong1.png" className="w-16 opacity-60" alt="错误姿势" />
            <img src="/palm/img/pose-wrong2.png" className="w-16 opacity-60" alt="错误姿势" />
            <img src="/palm/img/pose-wrong3.png" className="w-16 opacity-60" alt="错误姿势" />
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
          className="mt-10 space-y-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFileUpload}
            disabled={isProcessing}
            className="w-full h-12 rounded-xl border border-violet-300 text-violet-600 font-medium transition disabled:opacity-50"
          >
            {isProcessing ? '处理中...' : '📁 从相册选择'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCameraCapture}
            disabled={isProcessing}
            className="relative w-full h-14 flex items-center justify-center rounded-xl bg-violet-600 text-white text-lg font-semibold shadow-lg transition disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                拍照中...
              </div>
            ) : (
              '📱 立即拍照'
            )}
          </motion.button>
        </motion.div>

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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-4a6 6 0 00-6-6H9a6 6 0 00-6 6v4a2 2 0 002 2z"
            />
          </svg>
          <p>
            照片仅用于本次分析，完成后自动删除。查看 
            <a href="/privacy" className="underline">隐私政策</a>。
          </p>
        </motion.div>

        {/* Dev Info */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-6 p-3 bg-blue-50 rounded-lg text-xs text-blue-600"
          >
            <p className="font-mono">
              简化版相机实现 - 基于 stable 策略<br/>
              测试权限 → 释放流 → 快速跳转
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}