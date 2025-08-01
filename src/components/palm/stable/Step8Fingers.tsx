import { PalmStepConfig } from '@/libs/palm/config'
import { handlePalmFormSubmission } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step8Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step8Fingers({ locale }: Step8Props) {
  return (
    <div className="min-h-screen bg-white flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-20">
        <header className="py-4 text-center">
          <div className="relative w-full h-2 bg-violet-100 rounded-full mb-2">
            <div className="h-full w-[80%] bg-violet-600 rounded-full transition-all"></div>
          </div>
          <span className="text-xs text-gray-500">Step 8 / 21</span>
        </header>

        <section className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            手指长度决定投资风格
          </h1>
          <p className="text-gray-600 leading-relaxed">
            中指与无名指的长度比例决定你的投资风险偏好
          </p>
        </section>

        <form 
          action={handlePalmFormSubmission.bind(null, locale, 8)}
          className="space-y-6"
        >
          <div className="grid grid-cols-3 gap-4">
            <button
              type="submit"
              name="fingerLength"
              value="short"
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition hover:scale-105 bg-gradient-to-br from-red-400 to-orange-500"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <span className="text-3xl mb-2">🔥</span>
                <h3 className="font-bold text-lg">短指</h3>
                <p className="text-xs text-center">激进型</p>
              </div>
            </button>

            <button
              type="submit"
              name="fingerLength"
              value="medium"
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition hover:scale-105 bg-gradient-to-br from-blue-400 to-indigo-500"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <span className="text-3xl mb-2">⚖️</span>
                <h3 className="font-bold text-lg">中等</h3>
                <p className="text-xs text-center">均衡型</p>
              </div>
            </button>

            <button
              type="submit"
              name="fingerLength"
              value="long"
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition hover:scale-105 bg-gradient-to-br from-green-400 to-emerald-500"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <span className="text-3xl mb-2">📊</span>
                <h3 className="font-bold text-lg">长指</h3>
                <p className="text-xs text-center">稳健型</p>
              </div>
            </button>
          </div>
        </form>
      </main>
      <StableFormClient />
    </div>
  )
}