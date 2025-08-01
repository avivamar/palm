'use client'

import { useEffect } from 'react'
import { PalmStepConfig } from '@/libs/palm/config'
import { handlePalmFormSubmission } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step1Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step1Gender({ locale }: Step1Props) {
  useEffect(() => {
    // 获取用户粗略地理位置显示
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => {
        const locEl = document.getElementById("loc")
        if (locEl) {
          locEl.textContent = `${d.country_name || ""} ${d.region || ""}`
        }
      })
      .catch(() => {
        const locEl = document.getElementById("loc")
        if (locEl) {
          locEl.textContent = ""
        }
      })
  }, [])

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
          <div className="h-full w-[12%] rounded-full bg-violet-600 transition-all"></div>
        </div>
      </header>

      <main className="w-full max-w-[390px] flex flex-col items-center px-6 pt-8">
        {/* 题目 */}
        <h1 className="text-3xl font-semibold text-gray-900">你的性别能量影响财富吸引力</h1>
        <p className="mt-3 text-center text-gray-600">男性和女性的财富磁场完全不同，选择你的能量类型</p>
        <p className="mt-2 text-sm text-violet-600 font-medium">💡 研究显示：了解自己的能量类型可提升投资成功率37%</p>

        {/* 选项卡片 */}
        <form 
          action={handlePalmFormSubmission.bind(null, locale, 1)}
          className="mt-10 grid grid-cols-2 gap-6"
        >
          {/* 男性 */}
          <button
            type="submit"
            name="gender"
            value="male"
            className="group relative w-36 sm:w-40 aspect-[3/4] rounded-3xl overflow-hidden shadow hover:shadow-lg transition"
          >
            <img src="/palm/img/male.svg" alt="male" className="absolute inset-0 w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-violet-600/80 via-violet-600/50 to-transparent"></div>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center text-white font-medium text-lg">
              男性
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition"
                   fill="none" stroke="currentColor" strokeWidth="2"
                   viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </span>
          </button>

          {/* 女性 */}
          <button
            type="submit"
            name="gender"
            value="female"
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
          </button>
        </form>
      </main>

      {/* 法律/隐私&定位 */}
      <footer className="w-full max-w-md px-6 py-10 text-center text-xs text-gray-500">
        通过选择上述选项，您同意
        <a href="/privacy" className="underline">隐私政策</a>、
        <a href="/tos" className="underline">使用条款</a>
        以及我们在营销中使用 Cookie 和跟踪技术（例如 Meta Pixel）。
        <br />
        <span id="loc" className="mt-1 block">检测位置中…</span>
      </footer>

      <StableFormClient />
    </div>
  )
}