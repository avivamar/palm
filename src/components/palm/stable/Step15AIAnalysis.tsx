import { PalmStepConfig } from '@/libs/palm/config'
import { StableAutoRedirect } from './StableAutoRedirect'

interface Step15Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step15AIAnalysis({ locale }: Step15Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-16 text-white">
        <header className="py-4 flex justify-center">
          <img src="/img/logo-white.svg" alt="ThePalmistryLife" className="h-7" />
        </header>

        <div className="relative w-full h-2 bg-white/30 rounded-full mb-8">
          <div className="h-full w-[100%] bg-white rounded-full transition-all"></div>
          <span className="absolute right-0 -top-6 text-xs text-white/70">AI分析中!</span>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center relative">
            <span className="text-6xl">🧠</span>
            <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-spin"></div>
          </div>
        </div>

        <section className="text-center space-y-3 mb-8">
          <h1 className="text-2xl font-bold text-white">
            AI正在进行深度分析
          </h1>
          <p className="text-white/80 leading-snug text-lg">
            🤖 机器学习算法启动<br/>
            📊 财富模式识别中...
          </p>
          <div className="mt-4 text-sm text-yellow-300 font-medium animate-pulse">
            ⏱️ 预计完成时间：35秒
          </div>
        </section>

        <div className="mb-8">
          <div className="bg-white/20 rounded-2xl p-4">
            <div className="text-center space-y-3">
              <div className="text-white/90 font-medium">AI智能分析引擎</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-semibold text-green-400">638个</div>
                  <div className="text-white/70">特征点识别</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-semibold text-blue-400">97.3%</div>
                  <div className="text-white/70">匹配精度</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8 text-sm">
          <div className="flex items-center opacity-100">
            <span className="text-green-400 mr-2">✓</span>
            <span className="text-white/80">掌纹特征提取完成</span>
          </div>
          <div className="flex items-center opacity-100">
            <span className="text-green-400 mr-2">✓</span>
            <span className="text-white/80">数据库匹配完成</span>
          </div>
          <div className="flex items-center opacity-100">
            <span className="text-yellow-400 mr-2">⏳</span>
            <span className="text-white/80">财富模式分析中...</span>
          </div>
          <div className="flex items-center opacity-30">
            <span className="text-gray-400 mr-2">○</span>
            <span className="text-white/40">个性化报告生成中...</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">正在分析：</h3>
          <div className="space-y-1 text-sm text-white/80">
            <div>• 财富线深度和走向</div>
            <div>• 投资风险偏好等级</div>
            <div>• 最佳财富增长期</div>
            <div>• 个性化投资建议</div>
          </div>
        </div>
      </main>
      
      <StableAutoRedirect 
        targetUrl={`/${locale}/palm/stable/16`}
        delay={4000}
      />
    </div>
  )
}