'use client'

import { useEffect } from 'react'
import { PalmStepConfig } from '@/libs/palm/config'
import { handlePalmFormSubmission } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step2Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step2Energy({ locale }: Step2Props) {
  useEffect(() => {
    // 获取用户粗略地理位置显示
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => {
        const locationEl = document.querySelector('[data-location]')
        if (locationEl) {
          locationEl.textContent = `${d.country_name || ""} ${d.region || ""} 节点`
        }
      })
      .catch(() => {
        // 静默处理错误
      })
  }, [])

  return (
    <>
      <style jsx>{`
        /* 能量卡片交互样式 */
        .energy-card.selected {
          border-color: #7C3AED !important;
          background-color: #F3F4F6 !important;
        }
      `}</style>
      
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
          <section className="text-center space-y-3 mb-8">
            <h1 className="text-2xl font-bold text-violet-600">你的内在能量决定财富流向</h1>
            <p className="text-gray-600 leading-snug">
              🔹 <span className="font-medium text-blue-600">阳性能量</span>善于主动创造财富 <br />
              🔸 <span className="font-medium text-pink-600">阴性能量</span>擅长直觉投资获利
            </p>
            <div className="mt-3 text-sm text-orange-600 font-medium animate-pulse">
              🔔 刚刚有用户选择了阳性能量，发现了3个投资机会
            </div>
          </section>

          {/* Options */}
          <form 
            action={handlePalmFormSubmission.bind(null, locale, 2)}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {/* 阳性 */}
            <button
              type="submit"
              name="energyType"
              value="masculine"
              className="energy-card group flex flex-col items-center py-4 rounded-xl border-2 border-transparent bg-white shadow hover:border-violet-400 transition"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">⚡</span>
              </div>
              <span className="font-medium text-gray-800">阳性</span>
            </button>

            {/* 平衡 */}
            <button 
              type="submit"
              name="energyType"
              value="balanced"
              className="energy-card group flex flex-col items-center py-4 rounded-xl border-2 border-transparent bg-white shadow hover:border-violet-400 transition"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">⚖️</span>
              </div>
              <span className="font-medium text-gray-800">平衡</span>
            </button>

            {/* 阴性 */}
            <button 
              type="submit"
              name="energyType"
              value="feminine"
              className="energy-card group flex flex-col items-center py-4 rounded-xl border-2 border-transparent bg-white shadow hover:border-violet-400 transition"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">🌙</span>
              </div>
              <span className="font-medium text-gray-800">阴性</span>
            </button>
          </form>

          {/* Legal & location */}
          <p className="mt-6 text-center text-[10px] leading-snug text-gray-400 px-4">
            继续即代表您同意我们的
            <a href="/privacy" className="underline">隐私政策</a>、
            <a href="/terms" className="underline">服务条款</a> 与追踪技术的使用。
          </p>
          <p className="mt-2 text-center text-[10px] text-gray-400" data-location>
            检测位置中…
          </p>
        </main>

        <StableFormClient />
      </div>
    </>
  )
}