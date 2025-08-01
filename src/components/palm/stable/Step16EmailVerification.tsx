import { PalmStepConfig } from '@/libs/palm/config'
import { handlePalmFormSubmission } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step16Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step16EmailVerification({ locale }: Step16Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 to-purple-600 flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-20 text-white">
        <header className="py-4 flex justify-center">
          <img src="/img/logo-white.svg" alt="ThePalmistryLife" className="h-7" />
        </header>

        <div className="relative w-full h-2 bg-white/30 rounded-full mb-8">
          <div className="h-full w-[100%] bg-white rounded-full transition-all"></div>
          <span className="absolute right-0 -top-6 text-xs text-white/70">即将完成!</span>
        </div>

        <section className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-5xl">🎉</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            你的财富分析已经完成！
          </h1>
          <p className="text-white/80 leading-relaxed">
            输入邮箱地址，立即获取你的专属财富分析报告
          </p>
        </section>

        <form 
          action={handlePalmFormSubmission.bind(null, locale, 16)}
          className="space-y-6"
        >
          <div className="bg-white/10 rounded-2xl p-6">
            <label className="block text-sm font-medium text-white/90 mb-2">
              邮箱地址
            </label>
            <input
              type="email"
              name="email"
              placeholder="请输入你的邮箱地址"
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-transparent"
              required
            />
            <p className="mt-2 text-xs text-white/70">
              我们将立即发送你的个性化财富分析报告
            </p>
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-yellow-500 text-gray-900 text-lg font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg"
          >
            📧 立即获取我的财富报告
          </button>
        </form>

        <div className="mt-8 bg-white/10 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">🎁 你将获得：</h3>
          <div className="space-y-2 text-sm text-white/80">
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              <span>个性化财富潜力分析</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              <span>最佳投资时机指导</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              <span>风险管理建议</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              <span>专属财富增长路径</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/60 leading-relaxed px-4">
          继续即代表您同意我们的
          <a href="/privacy" className="underline">隐私政策</a>、
          <a href="/terms" className="underline">服务条款</a>
          与追踪技术的使用。
        </p>
      </main>

      <StableFormClient />
    </div>
  )
}