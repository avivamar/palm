'use client'

import { useEffect } from 'react'
import { PalmStepConfig } from '@/libs/palm/config'
import { handleMultiSelectForm } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step4Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step4Motivation({ locale }: Step4Props) {
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

  const motivationOptions = [
    {
      id: 'love',
      title: '情感关系',
      description: '爱情财运双收的秘密',
      icon: '💖',
      bgColor: 'bg-pink-100'
    },
    {
      id: 'mind',
      title: '投资决策',
      description: '发现你的投资天赋',
      icon: '🧠',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'health',
      title: '健康财富',
      description: '身体状态影响财运',
      icon: '💪',
      bgColor: 'bg-green-100'
    },
    {
      id: 'career',
      title: '事业财运',
      description: '职场成功的关键密码',
      icon: '💼',
      bgColor: 'bg-yellow-100'
    },
    {
      id: 'curious',
      title: '全面分析',
      description: '完整的财富潜力解读',
      icon: '🤔',
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
          <div className="h-full w-[80%] bg-violet-500 rounded-full transition-all"></div>
          <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 4 / 5</span>
        </div>

        {/* Title */}
        <section className="text-center space-y-3 mb-8">
          <h1 className="text-2xl font-bold text-violet-600">定制你的财富报告内容</h1>
          <p className="text-gray-600 leading-snug">
            选择最重要的2个领域，获得专属财富指导（最多选择2项）
          </p>
          <div className="mt-3 text-sm text-green-600 font-medium">
            🎯 个性化报告将基于你的选择深度定制
          </div>
        </section>

        {/* Options */}
        <StableFormClient
          action={handleMultiSelectForm.bind(null, locale, 4, 'motivations')}
          className="space-y-3 mb-8"
        >
          {motivationOptions.map((option) => (
            <label
              key={option.id}
              className="motivation-card group w-full flex items-center py-4 px-4 rounded-xl border-2 border-transparent bg-white shadow hover:border-violet-400 transition cursor-pointer"
            >
              <input
                type="checkbox"
                name="motivations"
                value={option.id}
                className="sr-only peer"
                onChange={(e) => {
                  const card = e.target.closest('.motivation-card')
                  if (e.target.checked) {
                    card?.classList.remove('border-transparent', 'bg-white')
                    card?.classList.add('border-violet-600', 'bg-violet-50')
                  } else {
                    card?.classList.remove('border-violet-600', 'bg-violet-50')
                    card?.classList.add('border-transparent', 'bg-white')
                  }
                }}
              />
              <div className={`w-12 h-12 ${option.bgColor} rounded-full flex items-center justify-center mr-4`}>
                <span className="text-2xl">{option.icon}</span>
              </div>
              <div className="text-left">
                <span className="text-lg font-medium text-gray-800">{option.title}</span>
                <div className="text-sm text-gray-500 mt-1">{option.description}</div>
              </div>
            </label>
          ))}

          {/* Continue CTA */}
          <button
            type="submit"
            className="w-full h-14 rounded-xl bg-violet-800 text-white text-lg font-semibold shadow-md hover:bg-violet-500 transition"
          >
            继续 →
          </button>
        </StableFormClient>

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