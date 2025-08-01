import { PalmStepConfig } from '@/libs/palm/config'
import { handlePalmFormSubmission } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step20Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step20FinalOffer({ locale }: Step20Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-20 text-white">
        <header className="py-4 flex justify-center">
          <img src="/palm/img/logo-white.svg" alt="ThePalmistryLife" className="h-7" />
        </header>

        {/* 紧迫感倒计时 */}
        <div className="text-center mb-6">
          <div className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
            ⏰ 限时优惠还剩 09:47
          </div>
        </div>

        <section className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-5xl">🎁</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            专属财富指导报告
          </h1>
          <p className="text-white/80 leading-relaxed">
            最后机会！获得价值$294的完整财富分析报告
          </p>
        </section>

        {/* 价值包装 */}
        <div className="bg-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">🎯 您将获得：</h2>
          <div className="space-y-3 text-white/90">
            <div className="flex items-center">
              <span className="text-yellow-400 mr-3">✓</span>
              <div>
                <span className="font-semibold">完整财富潜力分析</span>
                <span className="text-white/60 text-sm ml-2">($97 价值)</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-3">✓</span>
              <div>
                <span className="font-semibold">专业投资时机指导</span>
                <span className="text-white/60 text-sm ml-2">($89 价值)</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-3">✓</span>
              <div>
                <span className="font-semibold">个性化风险管理方案</span>
                <span className="text-white/60 text-sm ml-2">($67 价值)</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-3">✓</span>
              <div>
                <span className="font-semibold">专属财富顾问咨询</span>
                <span className="text-white/60 text-sm ml-2">($41 价值)</span>
              </div>
            </div>
            <div className="border-t border-white/20 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">总价值：</span>
                <div className="text-right">
                  <span className="text-white/60 line-through text-lg">$294</span>
                  <span className="text-yellow-400 font-bold text-2xl ml-2">$19</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form 
          action={handlePalmFormSubmission.bind(null, locale, 20)}
        >
          <input type="hidden" name="finalOfferAccepted" value="true" />
          <input type="hidden" name="finalAmount" value="19" />
          
          <button
            type="submit"
            className="w-full h-16 bg-yellow-500 text-gray-900 text-xl font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg mb-4"
          >
            🚀 立即获取完整报告 - 仅$19
          </button>
        </form>

        {/* 保证和信任标识 */}
        <div className="grid grid-cols-3 gap-4 text-center text-xs text-white/80 mb-6">
          <div>
            <div className="text-lg mb-1">🔒</div>
            <div>安全支付</div>
          </div>
          <div>
            <div className="text-lg mb-1">↩️</div>
            <div>30天退款</div>
          </div>
          <div>
            <div className="text-lg mb-1">⭐</div>
            <div>98%满意度</div>
          </div>
        </div>

        {/* 社会证明 */}
        <div className="bg-white/10 rounded-xl p-4 mb-6">
          <div className="text-center">
            <p className="text-white/80 text-sm mb-2">
              "这份报告改变了我的投资思路，3个月内收益增长了43%！"
            </p>
            <div className="text-yellow-400 text-xs">⭐⭐⭐⭐⭐</div>
            <div className="text-white/60 text-xs">- 张先生，深圳</div>
          </div>
        </div>

        <p className="text-center text-xs text-white/60 leading-relaxed px-4">
          点击购买即代表您同意我们的
          <a href="/privacy" className="underline">隐私政策</a>、
          <a href="/terms" className="underline">服务条款</a>
          与追踪技术的使用。
        </p>
      </main>

      <StableFormClient />
    </div>
  )
}