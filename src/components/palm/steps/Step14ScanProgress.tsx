'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'
import { useRouter } from 'next/navigation'

interface Step14Props {
  userData: PalmUserData
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
}

export default function Step14ScanProgress({ 
  trackEvent, 
  goToNextStep
}: Step14Props) {
  const router = useRouter()
  const [currentProgress, setCurrentProgress] = useState(0)
  const [currentLocation, setCurrentLocation] = useState('检测位置中…')
  const [isModalOpen, setIsModalOpen] = useState(true)
  const targetProgress = 38
  const totalLength = 377 // 圆周长度 2π * 60
  
  useEffect(() => {
    trackEvent('palm_scan_progress_view', { 
      timestamp: Date.now(),
      step: 14
    })
    
    // 获取地理位置
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => {
        setCurrentLocation(`${d.country_name || ""} ${d.region || ""}`)
      })
      .catch(() => {
        setCurrentLocation("全球")
      })
    
    // 开始进度动画
    setTimeout(() => {
      animateProgress()
    }, 500)
  }, [])
  
  const animateProgress = () => {
    const increment = 2
    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        const newProgress = prev + increment
        if (newProgress >= targetProgress) {
          clearInterval(interval)
          trackEvent('palm_scan_progress_complete', { 
            finalProgress: targetProgress,
            timestamp: Date.now()
          })
          // 继续到下一步或跳转
          setTimeout(() => {
            goToNextStep()
          }, 2000)
          return targetProgress
        }
        return newProgress
      })
    }, 50)
  }
  
  const closeModal = () => {
    trackEvent('palm_scan_progress_close', { 
      progress: currentProgress,
      timestamp: Date.now()
    })
    
    setIsModalOpen(false)
    setTimeout(() => {
      router.back()
    }, 300)
  }
  
  const steps = [
    { 
      id: 1, 
      text: "分析你的掌纹", 
      completed: true 
    },
    { 
      id: 2, 
      text: "研究你的手指", 
      completed: true 
    },
    { 
      id: 3, 
      text: "突出优势和潜能", 
      completed: currentProgress > 20 
    },
    { 
      id: 4, 
      text: "识别性格特征", 
      completed: currentProgress >= targetProgress 
    }
  ]
  
  // 计算圆环偏移量
  const strokeDashoffset = totalLength - (totalLength * currentProgress / 100)
  
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/40 z-40"></div>
      
      {/* 主要内容容器 */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.main 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-50 w-full max-w-[380px] mx-4"
          >
            {/* 结果弹窗 */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 relative">
              {/* 关闭按钮 */}
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              {/* 标题 */}
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-xl font-bold text-gray-800 text-center mb-8 pr-8"
              >
                探究你手上的独特故事
              </motion.h1>

              {/* 圆形进度条 */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex justify-center mb-8"
              >
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                    {/* 背景圆环 */}
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="60" 
                      stroke="#e5e7eb" 
                      strokeWidth="12" 
                      fill="none"
                    />
                    {/* 进度圆环 */}
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="60" 
                      stroke="#7c3aed" 
                      strokeWidth="12" 
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={totalLength}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                    />
                  </svg>
                  {/* 百分比文字 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-violet-600">
                      {currentProgress}%
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* 分析步骤列表 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-3"
              >
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className={`step-item flex items-center p-3 rounded-xl border-2 transition-all duration-500 ${
                      step.completed 
                        ? 'bg-violet-100 border-violet-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 transition-all duration-500 ${
                      step.completed 
                        ? 'bg-violet-600' 
                        : 'bg-gray-300'
                    }`}>
                      {step.completed ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      ) : (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`font-medium transition-colors duration-500 ${
                      step.completed 
                        ? 'text-violet-700' 
                        : 'text-gray-500'
                    }`}>
                      {step.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* 底部提示 */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-gray-500">
                  正在深度分析您的手相特征...
                </p>
                <div className="mt-2 flex justify-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 地理位置显示 */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-4 text-center text-xs text-gray-400"
            >
              <span>{currentLocation}</span>&nbsp;节点
            </motion.p>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}