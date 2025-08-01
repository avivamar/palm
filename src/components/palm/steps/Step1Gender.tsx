'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step1Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step1Gender({ 
  
  updateUserData,
  trackEvent, 
  goToNextStep, 
  experiments 
}: Step1Props) {
  const [currentLocation, setCurrentLocation] = useState('检测位置中…')
  
  useEffect(() => {
    trackEvent('palm_step1_view', { 
      timestamp: Date.now(),
      sessionId: experiments.sessionId
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
  }, [experiments])
  
  const handleGenderSelect = (gender: string) => {
    trackEvent('palm_gender_select', { 
      gender,
      timestamp: Date.now()
    })
    
    updateUserData({ gender: gender as 'male' | 'female' })
    
    trackEvent('palm_step1_complete', { gender })
    goToNextStep()
  }
  
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* 顶栏 Logo + 进度条 */}
      <header className="w-full max-w-[390px] pt-5 relative">
        {/* Logo */}
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-900">
            <path fill="currentColor" d="M12 0L24 24H0z"/>
          </svg>
        </div>

        {/* 进度条 */}
        <div className="mt-8 h-2 w-full rounded-full bg-gray-200">
          <div className="h-full w-[12%] rounded-full bg-brand transition-all"></div>
        </div>
      </header>

      <main className="w-full max-w-[390px] flex flex-col items-center px-6 pt-8">
        {/* 题目 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-3xl font-semibold text-gray-900">你的性别能量影响财富吸引力</h1>
          <p className="mt-3 text-center text-gray-600">男性和女性的财富磁场完全不同，选择你的能量类型</p>
          <p className="mt-2 text-sm text-violet-600 font-medium">💡 研究显示：了解自己的能量类型可提升投资成功率37%</p>
        </motion.div>

        {/* 选项卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 grid grid-cols-2 gap-6"
        >
          {/* 男性 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleGenderSelect('male')}
            className="group relative w-36 sm:w-40 aspect-[3/4] rounded-3xl overflow-hidden shadow hover:shadow-lg transition"
          >
            <img src="/palm/img/male.svg" alt="male" className="absolute inset-0 w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-brand/50 to-transparent"></div>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center text-white font-medium text-lg">
              男性
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition"
                   fill="none" stroke="currentColor" strokeWidth="2"
                   viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </span>
          </motion.button>

          {/* 女性 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleGenderSelect('female')}
            className="group relative w-36 sm:w-40 aspect-[3/4] rounded-3xl overflow-hidden shadow hover:shadow-lg transition"
          >
            <img src="/palm/img/female.svg" alt="female" className="absolute inset-0 w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/80 via-pink-500/50 to-transparent"></div>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center text-white font-medium text-lg">
              女性
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition"
                   fill="none" stroke="currentColor" strokeWidth="2"
                   viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </span>
          </motion.button>
        </motion.div>
      </main>

      {/* 法律/隐私&定位 */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full max-w-md px-6 py-10 text-center text-xs text-gray-500"
      >
        通过选择上述选项，您同意
        <a href="/privacy" className="underline">隐私政策</a>、
        <a href="/tos" className="underline">使用条款</a>
        以及我们在营销中使用 Cookie 和跟踪技术（例如 Meta Pixel）。
        <br />
        <span className="mt-1 block">{currentLocation}</span>
      </motion.footer>
    </div>
  )
}