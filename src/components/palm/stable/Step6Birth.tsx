import { PalmStepConfig } from '@/libs/palm/config'
import { handlePalmFormSubmission } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step6Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step6Birth({ locale }: Step6Props) {
  return (
    <div className="min-h-screen bg-white flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-20">
        {/* 顶部进度 */}
        <header className="py-4 text-center">
          <div className="relative w-full h-2 bg-violet-100 rounded-full mb-2">
            <div className="h-full w-[60%] bg-violet-600 rounded-full transition-all"></div>
          </div>
          <span className="text-xs text-gray-500">Step 6 / 21</span>
        </header>

        {/* 标题 */}
        <section className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            生辰信息增强分析精准度
          </h1>
          <p className="text-gray-600 leading-relaxed">
            结合生辰信息分析财富能量场，提升预测精准度至98.4%
          </p>
          <div className="mt-3 inline-block bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-sm font-medium">
            ⭐ 精准度提升至98.4%
          </div>
        </section>

        {/* 生日输入表单 */}
        <form 
          action={handlePalmFormSubmission.bind(null, locale, 6)}
          className="space-y-6"
        >
          <div className="bg-gray-50 rounded-2xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出生日期
            </label>
            <input
              type="date"
              name="birthDate"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <p className="mt-2 text-xs text-gray-500">
              用于分析时间能量场对财富的影响
            </p>
          </div>

          {/* 可选：时间输入 */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出生时间（可选，提升精准度）
            </label>
            <input
              type="time"
              name="birthTime"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <p className="mt-2 text-xs text-gray-500">
              时辰分析可进一步提升预测准确性
            </p>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            className="w-full h-14 bg-violet-600 text-white text-lg font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-lg"
          >
            继续分析我的财富能量场 →
          </button>
        </form>

        {/* 隐私保护提示 */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">🔒</span>
            <p className="text-sm text-green-700">
              您的生辰信息将被加密保护，仅用于财富分析，不会被第三方获取
            </p>
          </div>
        </div>

        {/* 法律条款 */}
        <p className="mt-4 text-center text-xs text-gray-500 leading-relaxed px-4">
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