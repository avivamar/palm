'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step11Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step11PalmLinePriority({ 
  updateUserData,
  trackEvent, 
  goToNextStep
}: Step11Props) {
  const [selectedPriority, setSelectedPriority] = useState<string>('')
  
  useEffect(() => {
    trackEvent('palm_line_priority_view', { 
      timestamp: Date.now(),
      step: 11
    })
  }, [])
  
  const handlePrioritySelect = (lineId: string) => {
    setSelectedPriority(lineId)
    
    trackEvent('palm_line_priority_select', { 
      priorityLine: lineId,
      timestamp: Date.now()
    })
  }
  
  const handleContinue = () => {
    if (selectedPriority) {
      updateUserData({ palmLinePriority: selectedPriority })
      trackEvent('palm_step11_complete', { 
        palmLinePriority: selectedPriority
      })
      goToNextStep()
    }
  }
  
  const lineOptions = [
    {
      id: 'heart',
      txt: '感情线（Heart Line）'
    },
    {
      id: 'head', 
      txt: '头脑线（Head Line）'
    },
    {
      id: 'life',
      txt: '生命线（Life Line）'
    },
    {
      id: 'fate',
      txt: '命运线（Fate Line）'
    },
    {
      id: 'marriage',
      txt: '婚姻线（Marriage Line）'
    }
  ]
  
  return (
    <div className="flex justify-center">
      <main className="w-full max-w-[412px] min-h-screen px-6 pt-6 pb-20 bg-white text-gray-900">
        {/* Logo */}
        <motion.img 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          src="/logo.svg"
          className="h-6 mx-auto mb-6 select-none" 
          alt="ThePalmistryLife" 
        />

        {/* Progress bar (90%) */}
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-[340px] h-1.5 mx-auto bg-violet-100 rounded-full"
        >
          <div className="h-full w-[90%] bg-violet-500 rounded-full"></div>
          <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 11 / 12</span>
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-2xl font-bold leading-snug"
        >
          你最想先深入解析<br/>哪一条掌纹？
        </motion.h1>

        {/* Options */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 w-full max-w-[360px] space-y-4"
        >
          {lineOptions.map((opt, index) => (
            <motion.button
              key={opt.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePrioritySelect(opt.id)}
              className={`w-full h-14 rounded-xl text-base font-medium text-left pl-4 pr-3 border-2 border-transparent transition ${
                selectedPriority === opt.id
                  ? 'bg-violet-50 border-violet-600 shadow'
                  : 'bg-gray-100 hover:bg-gray-50'
              }`}
            >
              {opt.txt}
            </motion.button>
          ))}
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          onClick={handleContinue}
          disabled={!selectedPriority}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[360px] h-12 rounded-xl font-semibold shadow-md transition ${
            selectedPriority
              ? 'bg-violet-600 text-white hover:bg-violet-500'
              : 'bg-violet-600 text-white opacity-40 cursor-not-allowed'
          }`}
        >
          继续 →
        </motion.button>
      </main>
    </div>
  );
}