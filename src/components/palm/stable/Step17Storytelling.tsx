import Link from 'next/link'
import { PalmStepConfig } from '@/libs/palm/config'

interface Step17Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step17Storytelling({ locale }: Step17Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-20 text-white">
        <header className="py-4 flex justify-center">
          <img src="/palm/img/logo-white.svg" alt="ThePalmistryLife" className="h-7" />
        </header>

        <section className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-5xl">✨</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            你的财富故事正在揭晓
          </h1>
          <p className="text-white/80 leading-relaxed">
            基于你的掌纹分析，我们发现了你独特的财富密码
          </p>
        </section>

        <div className="bg-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">💎 你的财富天赋</h2>
          <div className="space-y-4 text-white/90">
            <div className="flex items-start">
              <span className="text-green-400 mr-3 mt-1">●</span>
              <div>
                <h3 className="font-semibold">直觉投资能力</h3>
                <p className="text-sm text-white/70">你拥有敏锐的市场直觉，善于捕捉投资机会</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-blue-400 mr-3 mt-1">●</span>
              <div>
                <h3 className="font-semibold">长期财富积累</h3>
                <p className="text-sm text-white/70">你的掌纹显示具有稳健的财富积累能力</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-purple-400 mr-3 mt-1">●</span>
              <div>
                <h3 className="font-semibold">创新财富创造</h3>
                <p className="text-sm text-white/70">通过创新思维和新兴领域获得财富突破</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/20 rounded-2xl p-4 mb-8">
          <h3 className="font-semibold text-white mb-2">🔮 专属建议预览</h3>
          <p className="text-white/80 text-sm">
            你的最佳投资时期将在未来6-18个月内到来。建议关注科技、新能源、消费升级等领域...
          </p>
          <p className="text-white/60 text-xs mt-2">
            *完整报告包含详细的投资时机、风险管理、财富规划等专业建议
          </p>
        </div>

        <Link
          href={`/${locale}/palm/stable/18`}
          className="block w-full h-14 bg-white text-orange-600 text-lg font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center"
        >
          查看完整财富分析报告 →
        </Link>
      </main>
    </div>
  )
}