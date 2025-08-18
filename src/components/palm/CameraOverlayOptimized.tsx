'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CameraOverlayOptimizedProps {
  isVisible: boolean
  onClose?: () => void
  onCapture?: (imageData: string) => void
  stream?: MediaStream | null
}

export default function CameraOverlayOptimized({ 
  isVisible, 
  onClose, 
  onCapture,
  stream
}: CameraOverlayOptimizedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  
  // 设置视频流 - 极简版本
  useEffect(() => {
    if (!isVisible || !stream || !videoRef.current) return
    
    const video = videoRef.current
    
    // 直接设置流，不做复杂处理
    video.srcObject = stream
    
    // 简单的ready检测
    const handleCanPlay = () => {
      setIsReady(true)
      console.log('Camera ready')
    }
    
    video.addEventListener('canplay', handleCanPlay)
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        video.srcObject = null
      }
      setIsReady(false)
    }
  }, [isVisible, stream])
  
  // 拍照功能
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isReady) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    // 开始倒计时
    setCountdown(3)
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          
          // 执行拍照
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0)
          
          // 获取图片数据
          const imageData = canvas.toDataURL('image/jpeg', 0.9)
          
          // 回调处理
          if (onCapture) {
            onCapture(imageData)
          }
          
          // 关闭相机
          if (onClose) {
            setTimeout(onClose, 500)
          }
          
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [isReady, onCapture, onClose])
  
  if (!isVisible) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* 视频元素 - 全屏显示 */}
      <video 
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      
      {/* 隐藏的canvas用于拍照 */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* 半透明遮罩 - 让用户能看到场景 */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      
      {/* 手掌轮廓引导 - 简洁的白色线条 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          {/* 简化的手掌轮廓 */}
          <svg 
            width="280" 
            height="350" 
            viewBox="0 0 280 350" 
            fill="none"
            className="drop-shadow-lg"
          >
            {/* 手掌主体轮廓 */}
            <path
              d="M140 320 C100 320 70 290 70 250 L70 150 C70 120 75 100 85 85 L85 60 C85 40 95 30 105 30 C115 30 125 40 125 60 L125 50 C125 30 135 20 145 20 C155 20 165 30 165 50 L165 45 C165 25 175 15 185 15 C195 15 205 25 205 45 L205 55 C205 35 215 25 225 25 C235 25 245 35 245 55 L245 150 C245 150 250 180 240 220 C230 260 200 320 140 320 Z"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-90"
            />
            
            {/* 手指分隔线 */}
            <line x1="105" y1="80" x2="105" y2="140" stroke="white" strokeWidth="2" className="opacity-70" />
            <line x1="135" y1="70" x2="135" y2="140" stroke="white" strokeWidth="2" className="opacity-70" />
            <line x1="165" y1="70" x2="165" y2="140" stroke="white" strokeWidth="2" className="opacity-70" />
            <line x1="195" y1="80" x2="195" y2="140" stroke="white" strokeWidth="2" className="opacity-70" />
          </svg>
          
          {/* 提示文字 */}
          {!isReady && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-white text-center"
            >
              <p className="text-sm">正在加载相机...</p>
            </motion.div>
          )}
          
          {isReady && !countdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-white text-center whitespace-nowrap"
            >
              <p className="text-sm font-medium">将手掌放入框内</p>
              <p className="text-xs opacity-70 mt-1">保持手掌平整，光线充足</p>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* 倒计时显示 */}
      <AnimatePresence>
        {countdown && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-6xl font-bold text-white">{countdown}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 顶部控制栏 */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-white text-sm font-medium">
            拍摄手掌照片
          </div>
          
          <div className="w-10" /> {/* 占位保持居中 */}
        </div>
      </div>
      
      {/* 底部拍照按钮 - 参考竞品设计 */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="flex justify-center">
          {isReady && !countdown ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={capturePhoto}
              className="relative"
            >
              {/* 外圈 */}
              <div className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center">
                {/* 内圈 */}
                <div className="w-14 h-14 rounded-full bg-white" />
              </div>
            </motion.button>
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/30" />
            </div>
          )}
        </div>
        
        <p className="text-center text-white/60 text-xs mt-4">
          点击拍照 • 自动识别手掌
        </p>
      </div>
    </div>
  )
}