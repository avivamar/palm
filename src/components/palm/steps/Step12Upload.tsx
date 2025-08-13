'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step12Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step12Upload({ 
  goToNextStep,
  trackEvent
}: Step12Props) {
  useEffect(() => {
    trackEvent('palm_upload_view', { 
      timestamp: Date.now(),
      step: 12
    })
  }, [])
  
  const handleContinue = () => {
    trackEvent('palm_step12_continue', { 
      timestamp: Date.now()
    })
    
    // Simply navigate to next step (Step 13) where actual upload/camera happens
    goToNextStep()
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
          <div className="h-full w-[96%] bg-violet-500 rounded-full"></div>
          <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 12 / 12</span>
        </motion.div>

        {/* Hero Hand Image with Scan Animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mt-8 overflow-hidden rounded-2xl"
        >
          <img 
            src="/img/demohand.png" 
            alt="Palm sample" 
            className="w-full object-cover" 
          />
          {/* Scanning Animation Line */}
          <div className="absolute left-0 w-full h-1 bg-white/70 mix-blend-overlay animate-scan"></div>
        </motion.div>

        {/* Content */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-2xl font-extrabold text-violet-600"
        >
          解锁你的财富密码！
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-3 text-gray-700 leading-relaxed"
        >
          💰 只需拍一张清晰照片，AI将揭示你的投资天赋、财富机会与未来 90 天的关键财运转折。
        </motion.p>

        <motion.ul 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-5 text-sm text-gray-600 space-y-1"
        >
          <li>• 哪条线透露你的投资天赋？</li>
          <li>• 哪只手显现你的财富增长点？</li>
          <li>• 你的风险管理能力如何？</li>
        </motion.ul>

        {/* CTA Button with Glow Effect */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          onClick={handleContinue}
          className="relative mt-8 w-full h-14 rounded-xl bg-violet-600 text-white text-lg font-semibold flex items-center justify-center shadow-lg active:scale-95 transition after:content-[''] after:absolute after:inset-0 after:rounded-xl after:bg-violet-600 after:blur-lg after:opacity-40 after:animate-pulse"
        >
          立即扫描，获取财富分析 →
        </motion.button>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-2 text-center text-[11px] text-gray-500"
        >
          📈 平均发现 <b>3-5个</b> 财富机会
        </motion.p>

        {/* Privacy Notice */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
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
              d="M12 11c1.38 0 2.5-1.12 2.5-2.5S13.38 6 12 6 9.5 7.12 9.5 8.5 10.62 11 12 11z"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 11v9m-6 0h12a2 2 0 002-2v-5a7 7 0 10-14 0v5a2 2 0 002 2z"
            />
          </svg>
          <p>
            图片仅用于本次分析，经端到端加密处理。详见 
            <a href="/privacy" className="underline">隐私政策</a>。
          </p>
        </motion.div>
      </main>
      
      {/* CSS Animation */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          45% { transform: translateY(100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}