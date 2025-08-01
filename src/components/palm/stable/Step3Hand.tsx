'use client'

import { useEffect } from 'react'
import { PalmStepConfig } from '@/libs/palm/config'
import { handlePalmFormSubmission } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step3Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step3Hand({ locale }: Step3Props) {
  useEffect(() => {
    // 获取用户粗略地理位置显示
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => {
        const locationEl = document.getElementById('location')
        if (locationEl) {
          locationEl.textContent = `${d.country_name || ""} ${d.region || ""}`
        }
      })
      .catch(() => {
        const locationEl = document.getElementById('location')
        if (locationEl) {
          locationEl.textContent = ""
        }
      })
  }, [])

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
        <section className="text-center space-y-3 mb-8">
          <h1 className="text-2xl font-bold text-violet-600">揭秘你的财富优势手</h1>
          <p className="text-gray-600 leading-snug">
            💡 惯用手决定主要财富流向，非惯用手显示潜在机会
          </p>
          <div className="mt-3 text-sm text-orange-600 font-medium animate-pulse">
            📊 93.7%的高净值人群掌纹显示明确的财富手特征
          </div>
        </section>

        {/* Options */}
        <form 
          action={handlePalmFormSubmission.bind(null, locale, 3)}
          className="space-y-4 mb-8"
        >
          {/* 右手 */}
          <button
            type="submit"
            name="dominantHand"
            value="right"
            className="hand-card group w-full flex items-center justify-center py-4 rounded-xl border-2 border-transparent bg-white shadow hover:border-violet-400 transition"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">🖐️</span>
            </div>
            <span className="text-lg font-medium text-gray-800">右手（惯用手）</span>
          </button>

          {/* 左手 */}
          <button 
            type="submit"
            name="dominantHand"
            value="left"
            className="hand-card group w-full flex items-center justify-center py-4 rounded-xl border-2 border-transparent bg-white shadow hover:border-violet-400 transition"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">🖐️</span>
            </div>
            <span className="text-lg font-medium text-gray-800">左手（惯用手）</span>
          </button>

          {/* 两只都用 */}
          <button 
            type="submit"
            name="dominantHand"
            value="both"
            className="hand-card group w-full flex items-center justify-center py-4 rounded-xl border-2 border-transparent bg-white shadow hover:border-violet-400 transition"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">🙌</span>
            </div>
            <span className="text-lg font-medium text-gray-800">两只都用（双利手）</span>
          </button>
        </form>

        {/* Legal & location */}
        <p className="mt-6 text-center text-[10px] leading-snug text-gray-400 px-4">
          继续即代表您同意我们的
          <a href="/privacy" className="underline">隐私政策</a>、
          <a href="/terms" className="underline">服务条款</a> 与追踪技术的使用。
        </p>
        <p className="mt-2 text-center text-[10px] text-gray-400">
          <span id="location">检测位置中…</span>&nbsp;节点
        </p>
      </main>

      <StableFormClient />
    </div>
  )
}