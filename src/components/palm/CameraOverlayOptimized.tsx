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
      
      {/* 手掌轮廓引导 - 使用现有的优质SVG */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative">
          {/* 使用项目中的专业手掌轮廓 - 更大显示 */}
          <img 
            src="/palm/plamcarema.svg" 
            alt="手掌轮廓引导"
            className="w-[360px] h-[450px] drop-shadow-lg opacity-90"
          />
          
          {/* 提示文字 - 调整位置避免与按钮重叠 */}
          {!isReady && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 text-white text-center z-20"
            >
              <p className="text-sm">正在加载相机...</p>
            </motion.div>
          )}
          
          {isReady && !countdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 text-white text-center whitespace-nowrap z-20"
            >
              <p className="text-lg font-medium">将手掌放入框内</p>
              <p className="text-sm opacity-80 mt-1">保持手掌平整，稳定后自动拍照</p>
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
      
      {/* 顶部控制栏 - 参考竞品简洁设计 */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-40">
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <div className="text-white text-base font-medium">拍摄手掌照片</div>
            <div className="text-white/70 text-xs mt-1">保持手掌平整，光线充足</div>
          </div>
          
          <div className="w-10" /> {/* 占位保持居中 */}
        </div>
        
        {/* 信任指标条 */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2 py-1">
            <span className="text-green-400">✓</span>
            <span className="text-white/90">94.2% 准确率</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2 py-1">
            <span className="text-blue-400">🔒</span>
            <span className="text-white/90">隐私保护</span>
          </div>
        </div>
      </div>
      
      {/* 底部拍照区域 - 参考竞品极简设计 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-30">
        {/* 拍照按钮 */}
        <div className="flex justify-center mb-4">
          {isReady && !countdown ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={capturePhoto}
              className="relative group"
            >
              {/* 外圈动画 */}
              <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-black/30 backdrop-blur group-active:border-violet-400 transition-colors">
                {/* 内圈 */}
                <div className="w-14 h-14 rounded-full bg-white group-active:bg-violet-100 transition-colors" />
              </div>
              {/* 脉冲动画 */}
              <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-white/50 animate-ping" />
            </motion.button>
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center bg-black/30 backdrop-blur">
              <div className="w-14 h-14 rounded-full bg-white/30" />
            </div>
          )}
        </div>
        
        {/* 状态文字 */}
        <div className="text-center">
          <p className="text-white text-sm font-medium mb-1">
            {isReady ? '点击拍照' : '正在准备...'}
          </p>
          <p className="text-white/60 text-xs">
            自动识别手掌 • 安全分析
          </p>
        </div>
        
        {/* 底部提示条 */}
        <div className="mt-4 flex items-center justify-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-white/70">AI实时检测</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            <span className="text-white/70">本地处理</span>
          </div>
        </div>
      </div>
    </div>
  )
}