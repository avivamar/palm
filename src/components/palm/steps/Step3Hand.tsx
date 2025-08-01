'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step3Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step3Hand({ 
  userData,
  updateUserData,
  trackEvent, 
  goToNextStep
}: Step3Props) {
  const [selectedHand, setSelectedHand] = useState<string>('')
  const [currentLocation, setCurrentLocation] = useState('检测位置中…')
  
  useEffect(() => {
    trackEvent('palm_step3_view', { 
      timestamp: Date.now(),
      previousData: { 
        gender: userData.gender,
        energyType: userData.energyType 
      }
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
  }, [userData])
  
  const handleHandSelect = (dominantHand: string) => {
    setSelectedHand(dominantHand)
    
    trackEvent('palm_hand_select', { 
      dominantHand,
      gender: userData.gender,
      energyType: userData.energyType,
      timestamp: Date.now()
    })
  }
  
  const handleContinue = () => {
    if (selectedHand) {
      updateUserData({ dominantHand: selectedHand as 'left' | 'right' | 'both' })
      trackEvent('palm_step3_complete', { 
        dominantHand: selectedHand,
        profileComplete: 60 
      })
      goToNextStep()
    }
  }
  
  const handOptions = [
    {
      value: 'right',
      label: '右手（惯用手）',
      icon: '🖐️',
      bgColor: 'bg-blue-100'
    },
    {
      value: 'left',
      label: '左手（惯用手）',
      icon: '🖐️',
      bgColor: 'bg-green-100'
    },
    {
      value: 'both',
      label: '两只都用（双利手）',
      icon: '🙌',
      bgColor: 'bg-purple-100'
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
          <div className="h-full w-[60%] bg-violet-500 rounded-full transition-all"></div>
          <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 3 / 5</span>
        </div>

        {/* Title */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-8"
        >
          <h1 className="text-2xl font-bold text-violet-600">揭秘你的财富优势手</h1>
          <p className="text-gray-600 leading-snug">
            💡 惯用手决定主要财富流向，非惯用手显示潜在机会
          </p>
          <div className="mt-3 text-sm text-orange-600 font-medium animate-pulse">
            📊 93.7%的高净值人群掌纹显示明确的财富手特征
          </div>
        </motion.section>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4 mb-8"
        >
          {handOptions.map((option, index) => (
            <motion.button
              key={option.value}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleHandSelect(option.value)}
              className={`group w-full flex items-center justify-center py-4 rounded-xl border-2 transition ${
                selectedHand === option.value
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
          disabled={!selectedHand}
          className={`w-full h-14 rounded-xl text-white text-lg font-semibold shadow-md transition ${
            selectedHand
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