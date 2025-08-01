import { PalmStepConfig } from '@/libs/palm/config'
import { StableAutoRedirect } from './StableAutoRedirect'

interface Step10Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step10Progress({ locale }: Step10Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-16 text-white">
        <header className="py-4 flex justify-center">
          <img src="/img/logo-white.svg" alt="ThePalmistryLife" className="h-7" />
        </header>

        <div className="relative w-full h-2 bg-white/30 rounded-full mb-8">
          <div className="h-full w-[100%] bg-white rounded-full transition-all"></div>
          <span className="absolute right-0 -top-6 text-xs text-white/70">深度分析中!</span>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-5xl">🧐</span>
          </div>
        </div>

        <section className="text-center space-y-3 mb-8">
          <h1 className="text-2xl font-bold text-white">
            AI正在深度分析你的财富潜力
          </h1>
          <p className="text-white/80 leading-snug text-lg">
            📊 综合所有信息数据<br/>
            🤖 AI智能分析引擎启动
          </p>
          <div className="mt-4 text-sm text-yellow-300 font-medium animate-pulse">
            ⏱️ 预计分析时间：45秒
          </div>
        </section>

        <div className="mb-8">
          <div className="bg-white/20 rounded-full p-4">
            <div className="text-center space-y-2">
              <div className="text-white/90 font-medium">深度分析进行中...</div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-400 to-green-400 h-2 rounded-full w-[95%] transition-all duration-1000"></div>
              </div>
              <div className="text-white/70 text-sm">95%</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8 text-sm">
          <div className="flex items-center opacity-100">
            <span className="text-green-400 mr-2">✓</span>
            <span className="text-white/80">基础信息分析完成</span>
          </div>
          <div className="flex items-center opacity-100">
            <span className="text-green-400 mr-2">✓</span>
            <span className="text-white/80">掌纹特征识别完成</span>
          </div>
          <div className="flex items-center opacity-100">
            <span className="text-green-400 mr-2">✓</span>
            <span className="text-white/80">地理能量场分析完成</span>
          </div>
          <div className="flex items-center opacity-100">
            <span className="text-yellow-400 mr-2">⏳</span>
            <span className="text-white/80">财富潜力综合评估中...</span>
          </div>
        </div>
      </main>
      
      <StableAutoRedirect 
        targetUrl={`/${locale}/palm/stable/11`}
        delay={4000}
      />
    </div>
  )
}