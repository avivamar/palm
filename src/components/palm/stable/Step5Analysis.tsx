'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PalmStepConfig } from '@/libs/palm/config'

interface Step5Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step5Analysis({ locale, searchParams: _searchParams }: Step5Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [analysisText, setAnalysisText] = useState('分析掌纹特征...')
  const [progress, setProgress] = useState(20)
  const [isComplete, setIsComplete] = useState(false)
  
  const steps = [
    { text: "分析掌纹特征...", progress: 20 },
    { text: "识别财富纹路...", progress: 45 },
    { text: "计算投资潜力...", progress: 70 },
    { text: "生成个性化建议...", progress: 85 },
    { text: "准备您的报告...", progress: 100 }
  ]
  
  const [stepStatuses, setStepStatuses] = useState([
    { id: 1, status: 'completed' }, // 基础信息收集完成
    { id: 2, status: 'active' },    // 掌纹模式识别中
    { id: 3, status: 'pending' },   // 财富潜力计算中
    { id: 4, status: 'pending' }    // 个性化建议生成中
  ])

  // 从URL参数中获取之前收集的数据（暂时保留以备后续使用）
  // const userData = {
  //   gender: searchParams.gender,
  //   energyType: searchParams.energyType,
  //   dominantHand: searchParams.dominantHand,
  //   motivations: searchParams.motivations
  // }

  useEffect(() => {
    let animationTimeout: NodeJS.Timeout
    
    const runAnimation = (step: number) => {
      if (step >= steps.length) {
        // 分析完成
        setIsComplete(true)
        // 3-5秒后自动跳转到下一步
        const redirectDelay = Math.random() * 2000 + 3000 // 3-5秒随机延迟
        setTimeout(() => {
          window.location.href = `/${locale}/palm/stable/6`
        }, redirectDelay)
        return
      }
      
      const currentStepData = steps[step]
      if (!currentStepData) {
        return
      }
      
      // 更新文本和进度条
      setAnalysisText(currentStepData.text)
      setProgress(currentStepData.progress)
      
      // 更新步骤状态
      if (step > 0) {
        updateStepStatus(step - 1, 'completed')
      }
      updateStepStatus(step, 'active')
      
      setCurrentStep(step + 1)
      
      // 继续下一步
      animationTimeout = setTimeout(() => {
        runAnimation(step + 1)
      }, Math.random() * 2000 + 1500) // 1.5-3.5秒随机间隔
    }
    
    // 开始动画
    const timer = setTimeout(() => {
      runAnimation(0)
    }, 1000)
    
    // 添加随机的"正在处理"效果
    const dotsInterval = setInterval(() => {
      setAnalysisText(prev => {
        const baseText = prev.replace(/\.+$/, '')
        const dots = prev.match(/\.+$/)
        const newDots = dots && dots[0].length >= 3 ? '.' : (dots ? dots[0] + '.' : '.')
        return baseText + newDots
      })
    }, 500)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(animationTimeout)
      clearInterval(dotsInterval)
    }
  }, [locale])
  
  const updateStepStatus = (stepIndex: number, status: 'active' | 'completed') => {
    setStepStatuses(prev => prev.map((step, index) => {
      if (index === stepIndex) {
        return { ...step, status }
      }
      return step
    }))
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
    <>
      <style jsx>{`
        /* 成功动画 */
        @keyframes success {
          0%   { transform: scale(0.8); opacity: 0; }
          50%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .success-icon {
          animation: success 0.6s ease-out;
        }
      `}</style>
      
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
          <div className="flex justify-center mb-6">
            <div className="success-icon w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-5xl">✨</span>
            </div>
          </div>

          {/* Title */}
          <section className="text-center space-y-3 mb-8">
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
          </section>

          {/* Progress Animation */}
          <div className="mb-8">
            <div className="bg-white/20 rounded-full p-4">
              <div className="text-center space-y-2">
                <div className="text-white/90 font-medium">{analysisText}</div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-white/70 text-sm">{progress}%</div>
              </div>
            </div>
          </div>

          {/* Fake Analysis Steps */}
          <div className="space-y-3 mb-8 text-sm">
            {[
              { text: "基础信息收集完成" },
              { text: "掌纹模式识别中..." },
              { text: "财富潜力计算中..." },
              { text: "个性化建议生成中..." }
            ].map((step, index) => {
              const stepStatus = stepStatuses[index]?.status || 'pending'
              const { icon, className } = getStepIcon(stepStatus)
              const opacity = getStepOpacity(stepStatus)
              
              return (
                <div key={index} className={`flex items-center ${opacity}`}>
                  <span className={`${className} mr-2`}>{icon}</span>
                  <span className={stepStatus === 'pending' ? 'text-white/40' : 'text-white/80'}>
                    {step.text}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Continue CTA */}
          {isComplete ? (
            <Link
              href={`/${locale}/palm/stable/6`}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-yellow-400 to-green-400 text-white text-lg font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center"
            >
              查看我的财富报告 →
            </Link>
          ) : (
            <button
              className="w-full h-14 rounded-xl bg-white text-violet-600 text-lg font-semibold shadow-md opacity-40 cursor-not-allowed"
              disabled
            >
              分析中... 请稍候
            </button>
          )}

          {/* Legal & location */}
          <p className="mt-6 text-center text-[10px] leading-snug text-white/50 px-4">
            分析完成后，您将获得完整的财富潜力报告
          </p>
        </main>
      </div>
    </>
  )
}