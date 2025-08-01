'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step8Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step8Fingers({ 
  updateUserData,
  trackEvent, 
  goToNextStep
}: Step8Props) {
  const [selectedFingers, setSelectedFingers] = useState<string>('')
  const [currentLocation, setCurrentLocation] = useState('检测位置中…')
  
  useEffect(() => {
    trackEvent('palm_fingers_view', { 
      timestamp: Date.now(),
      step: 8
    })
    
    // 获取用户粗略地理位置显示
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => {
        setCurrentLocation(`${d.country_name || ""} ${d.region || ""}`)
      })
      .catch(() => {
        setCurrentLocation("")
      })
  }, [])
  
  const handleFingerSelect = (fingerType: string) => {
    setSelectedFingers(fingerType)
    
    trackEvent('palm_fingers_select', { 
      fingerType,
      timestamp: Date.now()
    })
  }
  
  const handleContinue = () => {
    if (selectedFingers) {
      updateUserData({ fingerLength: selectedFingers })
      trackEvent('palm_step8_complete', { 
        fingerLength: selectedFingers
      })
      goToNextStep()
    }
  }
  
  const fingerOptions = [
    {
      value: 'long',
      label: '偏长',
      icon: '📏',
      bgColor: 'bg-blue-100'
    },
    {
      value: 'medium',
      label: '中等',
      icon: '📐',
      bgColor: 'bg-green-100'
    },
    {
      value: 'short',
      label: '偏短',
      icon: '📌',
      bgColor: 'bg-orange-100'
    },
    {
      value: 'unsure',
      label: '不确定',
      icon: '❓',
      bgColor: 'bg-gray-100'
    }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-16">
        {/* Logo */}
        <header className="py-4 flex justify-center">
          <img src="/palm/img/logo.svg" alt="ThePalmistryLife" className="h-7" />
        </header>

        {/* Progress */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full mb-8">
          <div className="h-full w-[80%] bg-violet-500 rounded-full transition-all"></div>
          <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 8 / 10</span>
        </div>

        {/* Title */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-8"
        >
          <h1 className="text-2xl font-bold text-violet-600">你的手指揭示执行力强度</h1>
          <p className="text-gray-600 leading-snug">
            💡 手指长度直接关联财务执行能力和风险控制力
          </p>
          <div className="mt-3 text-sm text-orange-600 font-medium animate-pulse">
            📈 长手指者平均投资收益率高出23.4%
          </div>
        </motion.section>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4 mb-8"
        >
          {fingerOptions.map((option, index) => (
            <motion.button
              key={option.value}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFingerSelect(option.value)}
              className={`group w-full flex items-center justify-center py-4 rounded-xl border-2 transition ${
                selectedFingers === option.value
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-transparent bg-white shadow hover:border-violet-400'
              }`}
            >
              <div className={`w-12 h-12 ${option.bgColor} rounded-full flex items-center justify-center mr-4`}>
                <span className="text-2xl">{option.icon}</span>
              </div>
              <span className="text-lg font-medium text-gray-800">{option.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Continue CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          onClick={handleContinue}
          disabled={!selectedFingers}
          className={`w-full h-14 rounded-xl text-white text-lg font-semibold shadow-md transition ${
            selectedFingers
              ? 'bg-violet-600 hover:bg-violet-500'
              : 'bg-violet-400 opacity-40 cursor-not-allowed'
          }`}
        >
          继续 →
        </motion.button>

        {/* Legal & location */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <p className="mt-6 text-center text-[10px] leading-snug text-gray-400 px-4">
            继续即代表您同意我们的
            <a href="/privacy" className="underline">隐私政策</a>、
            <a href="/terms" className="underline">服务条款</a> 与追踪技术的使用。
          </p>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            <span>{currentLocation}</span>&nbsp;节点
          </p>
        </motion.div>
      </main>
    </div>
  )
}