import { PalmStepConfig } from '@/libs/palm/config'
import { StableAutoRedirect } from './StableAutoRedirect'

interface Step14Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step14ScanProgress({ locale }: Step14Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-16 text-white">
        <header className="py-4 flex justify-center">
          <img src="/img/logo-white.svg" alt="ThePalmistryLife" className="h-7" />
        </header>

        <div className="relative w-full h-2 bg-white/30 rounded-full mb-8">
          <div className="h-full w-[100%] bg-white rounded-full transition-all"></div>
          <span className="absolute right-0 -top-6 text-xs text-white/70">扫描中!</span>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center relative">
            <span className="text-6xl">🔍</span>
            <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-pulse"></div>
          </div>
        </div>

        <section className="text-center space-y-3 mb-8">
          <h1 className="text-2xl font-bold text-white">
            AI正在扫描你的掌纹
          </h1>
          <p className="text-white/80 leading-snug text-lg">
            🕰️ 高精度图像识别中<br/>
            🤖 掌纹特征提取中...
          </p>
          <div className="mt-4 text-sm text-yellow-300 font-medium animate-pulse">
            ⏱️ 扫描进度：87%
          </div>
        </section>

        <div className="mb-8">
          <div className="bg-white/20 rounded-full p-4">
            <div className="text-center space-y-2">
              <div className="text-white/90 font-medium">掌纹特征识别中...</div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full w-[87%] transition-all duration-1000"></div>
              </div>
              <div className="text-white/70 text-sm">87%</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8 text-sm">
          <div className="flex items-center opacity-100">
            <span className="text-green-400 mr-2">✓</span>
            <span className="text-white/80">图像质量检测完成</span>
          </div>
          <div className="flex items-center opacity-100">
            <span className="text-green-400 mr-2">✓</span>
            <span className="text-white/80">掌纹边界识别完成</span>
          </div>
          <div className="flex items-center opacity-100">
            <span className="text-yellow-400 mr-2">⏳</span>
            <span className="text-white/80">纹理特征提取中...</span>
          </div>
          <div className="flex items-center opacity-30">
            <span className="text-gray-400 mr-2">○</span>
            <span className="text-white/40">特征匹配分析待处理</span>
          </div>
        </div>
      </main>
      
      <StableAutoRedirect 
        targetUrl={`/${locale}/palm/stable/15`}
        delay={3500}
      />
    </div>
  )
}