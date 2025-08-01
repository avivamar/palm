'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step2Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step2Energy({ 
  userData,
  updateUserData,
  trackEvent, 
  goToNextStep
}: Step2Props) {
  const [selectedEnergy, setSelectedEnergy] = useState<string>('')
  const [currentLocation, setCurrentLocation] = useState('')
  
  useEffect(() => {
    trackEvent('palm_step2_view', { 
      timestamp: Date.now(),
      previousData: { gender: userData.gender }
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
  }, [userData.gender])
  
  const handleEnergySelect = (energyType: string) => {
    setSelectedEnergy(energyType)
    
    trackEvent('palm_energy_select', { 
      energyType,
      gender: userData.gender,
      timestamp: Date.now()
    })
  }
  
  const handleContinue = () => {
    if (selectedEnergy) {
      updateUserData({ energyType: selectedEnergy as 'masculine' | 'balanced' | 'feminine' })
      trackEvent('palm_step2_complete', { 
        energyType: selectedEnergy, 
        gender: userData.gender 
      })
      goToNextStep()
    }
  }
  
  const energyOptions = [
    {
      value: 'masculine',
      label: '阳性',
      icon: '⚡',
      bgColor: 'bg-blue-100'
    },
    {
      value: 'balanced',
      label: '平衡',
      icon: '⚖️',
      bgColor: 'bg-purple-100'
    },
    {
      value: 'feminine',
      label: '阴性',
      icon: '🌙',
      bgColor: 'bg-pink-100'
    }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <main className="w-[390px] mx-auto px-6 py-8 space-y-8">
        {/* Logo */}
        <header className="py-4 flex justify-center">
          <img src="/palm/img/logo.svg" alt="ThePalmistryLife" className="h-7" />
        </header>

        {/* Progress */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full mb-8">
          <div className="h-full w-[40%] bg-violet-500 rounded-full transition-all"></div>
          <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 2 / 5</span>
        </div>

        {/* Title */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-8"
        >
          <h1 className="text-2xl font-bold text-violet-600">你的内在能量决定财富流向</h1>
          <p className="text-gray-600 leading-snug">
            🔹 <span className="font-medium text-blue-600">阳性能量</span>善于主动创造财富 <br />
            🔸 <span className="font-medium text-pink-600">阴性能量</span>擅长直觉投资获利
          </p>
          <div className="mt-3 text-sm text-orange-600 font-medium animate-pulse">
            🔔 刚刚有用户选择了阳性能量，发现了3个投资机会
          </div>
        </motion.section>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {energyOptions.map((option, index) => (
            <motion.button
              key={option.value}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEnergySelect(option.value)}
              className={`group flex flex-col items-center py-4 rounded-xl border-2 transition ${
                selectedEnergy === option.value
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-transparent bg-white shadow hover:border-violet-400'
              }`}
            >
              <div className={`w-16 h-16 ${option.bgColor} rounded-full flex items-center justify-center mb-2`}>
                <span className="text-2xl">{option.icon}</span>
              </div>
              <span className="font-medium text-gray-800">{option.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Continue CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          onClick={handleContinue}
          disabled={!selectedEnergy}
          className={`w-full h-14 rounded-xl text-white text-lg font-semibold shadow-md transition ${
            selectedEnergy
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
            {currentLocation}&nbsp;节点
          </p>
        </motion.div>
      </main>
    </div>
  )
}