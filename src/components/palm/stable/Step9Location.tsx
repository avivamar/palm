import { PalmStepConfig } from '@/libs/palm/config'
import { handlePalmFormSubmission } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step9Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step9Location({ locale }: Step9Props) {
  return (
    <div className="min-h-screen bg-white flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-20">
        <header className="py-4 text-center">
          <div className="relative w-full h-2 bg-violet-100 rounded-full mb-2">
            <div className="h-full w-[90%] bg-violet-600 rounded-full transition-all"></div>
          </div>
          <span className="text-xs text-gray-500">Step 9 / 21</span>
        </header>

        <section className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            地理位置优化分析
          </h1>
          <p className="text-gray-600 leading-relaxed">
            不同地区的能量场影响财富运势，了解你的位置优势
          </p>
        </section>

        <form 
          action={handlePalmFormSubmission.bind(null, locale, 9)}
          className="space-y-6"
        >
          <div className="bg-gray-50 rounded-2xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              你的居住城市
            </label>
            <input
              type="text"
              name="location"
              placeholder="例如：北京、上海、深圳"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              用于分析地理能量场对财富的影响
            </p>
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-violet-600 text-white text-lg font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-lg"
          >
            完成信息收集 →
          </button>
        </form>
      </main>
      <StableFormClient />
    </div>
  )
}