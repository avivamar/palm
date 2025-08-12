'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step5Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
}

export default function Step5Analysis({ 
  userData,
  trackEvent, 
  goToNextStep
}: Step5Props) {
  const [progress, setProgress] = useState(20)
  const [analysisText, setAnalysisText] = useState('分析掌纹特征...')
  const [isComplete, setIsComplete] = useState(false)
  
  const steps = [
    { text: "分析掌纹特征...", progress: 20 },
    { text: "识别财富纹路...", progress: 45 },
    { text: "计算投资潜力...", progress: 70 },
    { text: "生成个性化建议...", progress: 85 },
    { text: "准备您的报告...", progress: 100 }
  ]
  
  const analysisSteps = [
    { id: 1, text: "基础信息收集完成", status: "completed" },
    { id: 2, text: "掌纹模式识别中...", status: "active" },
    { id: 3, text: "财富潜力计算中...", status: "pending" },
    { id: 4, text: "个性化建议生成中...", status: "pending" }
  ]
  
  const [stepStatuses, setStepStatuses] = useState(analysisSteps)
  
  useEffect(() => {
    trackEvent('palm_analysis_start', { 
      timestamp: Date.now(),
      userData: {
        gender: userData.gender,
        energyType: userData.energyType,
        dominantHand: userData.dominantHand,
        motivations: userData.motivations
      }
    })
    
    let animationTimeout: NodeJS.Timeout
    
    const runAnimation = (step: number) => {
      if (step >= steps.length) {
        // 分析完成
        setIsComplete(true)
        trackEvent('palm_analysis_complete', { 
          duration: steps.length * 2000,
          profileComplete: 100
        })
        
        // 自动跳转到下一步（3-5秒后）
        const redirectDelay = Math.random() * 2000 + 3000 // 3-5秒随机延迟
        setTimeout(() => {
          goToNextStep()
        }, redirectDelay)
        return
      }
      
      const currentStepData = steps[step]
      
      // 更新文本和进度条
      if (currentStepData) {
        setAnalysisText(currentStepData.text)
        setProgress(currentStepData.progress)
      }
      
      // 更新步骤状态
      setStepStatuses(prev => prev.map((s, index) => {
        if (index < step) {
          return { ...s, status: 'completed' }
        } else if (index === step) {
          return { ...s, status: 'active' }
        }
        return s
      }))
      
      
      // 继续下一步
      animationTimeout = setTimeout(() => {
        runAnimation(step + 1)
      }, Math.random() * 2000 + 1500) // 1.5-3.5秒随机间隔
    }
    
    // 开始分析动画
    const startAnimation = setTimeout(() => {
      runAnimation(0)
    }, 1000)
    
    // 添加点点点动画效果
    const dotsInterval = setInterval(() => {
      setAnalysisText(prev => {
        const baseText = prev.replace(/\.+$/, '')
        const dots = prev.match(/\.+$/)
        const newDots = dots && dots[0].length >= 3 ? '.' : (dots ? dots[0] + '.' : '.')
        return baseText + newDots
      })
    }, 500)
    
    return () => {
      clearTimeout(startAnimation)
      clearTimeout(animationTimeout)
      clearInterval(dotsInterval)
    }
  }, [userData, goToNextStep, trackEvent])
  
  const handleContinue = () => {
    if (isComplete) {
      trackEvent('palm_analysis_continue', { 
        timestamp: Date.now(),
        analysisComplete: true
      })
      goToNextStep()
    }
  }
  
  const getStepIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return { icon: '✓', className: 'text-green-400' }
      case 'active':
        return { icon: '⏳', className: 'text-yellow-400' }
      default:
        return { icon: '○', className: 'text-gray-400' }
    }
  }
  
  const getStepOpacity = (status: string) => {
    switch(status) {
      case 'completed':
      case 'active':
        return 'opacity-100'
      default:
        return 'opacity-30'
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-16 text-white">
        {/* Logo */}
        <header className="py-4 flex justify-center">
          <img src="/palm/img/logo.svg" alt="ThePalmistryLife" className="h-7" />
        </header>

        {/* Progress */}
        <div className="relative w-full h-2 bg-white/30 rounded-full mb-8">
          <div className="h-full w-[100%] bg-white rounded-full transition-all"></div>
          <span className="absolute right-0 -top-6 text-xs text-white/70">分析完成!</span>
        </div>

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-5xl">✨</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center space-y-3 mb-8"
        >
          <h1 className="text-2xl font-bold text-white">
            太棒了！你的财富潜力正在解析中
          </h1>
          <p className="text-white/80 leading-snug text-lg">
            🎯 AI 已收集到关键信息<br/>
            📊 个性化报告生成中...
          </p>
          <div className="mt-4 text-sm text-yellow-300 font-medium animate-pulse">
            ⏱️ 预计完成时间：30秒
          </div>
        </motion.section>

        {/* Progress Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/20 rounded-full p-4">
            <div className="text-center space-y-2">
              <div className="text-white/90 font-medium">{analysisText}</div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-white/70 text-sm">{progress}%</div>
            </div>
          </div>
        </motion.div>

        {/* Fake Analysis Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="space-y-3 mb-8 text-sm"
        >
          {stepStatuses.map((step, _index) => {
            const { icon, className } = getStepIcon(step.status)
            const opacity = getStepOpacity(step.status)
            
            return (
              <div key={step.id} className={`flex items-center ${opacity}`}>
                <span className={`${className} mr-2`}>{icon}</span>
                <span className={step.status === 'pending' ? 'text-white/40' : 'text-white/80'}>
                  {step.text}
                </span>
              </div>
            )
          })}
        </motion.div>

        {/* Continue CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          onClick={handleContinue}
          disabled={!isComplete}
          className={`w-full h-14 rounded-xl text-lg font-semibold shadow-md transition ${
            isComplete
              ? 'bg-gradient-to-r from-yellow-400 to-green-400 text-white hover:from-yellow-300 hover:to-green-300'
              : 'bg-white text-violet-600 opacity-40 cursor-not-allowed'
          }`}
        >
          <span>
            {isComplete ? '查看我的财富报告 →' : '分析中... 请稍候'}
          </span>
        </motion.button>

        {/* Legal & location */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-6 text-center text-[10px] leading-snug text-white/50 px-4"
        >
          分析完成后，您将获得完整的财富潜力报告
        </motion.p>
      </main>
    </div>
  )
}