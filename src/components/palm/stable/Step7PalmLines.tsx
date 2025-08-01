import { PalmStepConfig } from '@/libs/palm/config'
import { handlePalmFormSubmission } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step7Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step7PalmLines({ locale }: Step7Props) {
  const palmLineOptions = [
    { id: 'heart', name: '心线', description: '感情与财富关系' },
    { id: 'head', name: '头线', description: '智慧与投资决策' },
    { id: 'life', name: '生命线', description: '活力与财富能量' },
    { id: 'fate', name: '命运线', description: '事业与财富轨迹' },
    { id: 'sun', name: '太阳线', description: '名声与财富声望' },
    { id: 'mercury', name: '水星线', description: '商业与沟通能力' }
  ]

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-20">
        <header className="py-4 text-center">
          <div className="relative w-full h-2 bg-violet-100 rounded-full mb-2">
            <div className="h-full w-[70%] bg-violet-600 rounded-full transition-all"></div>
          </div>
          <span className="text-xs text-gray-500">Step 7 / 21</span>
        </header>

        <section className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            识别你的核心掌纹特征
          </h1>
          <p className="text-gray-600 leading-relaxed">
            选择你手掌上最清晰的纹线，AI将重点分析
          </p>
        </section>

        <form 
          action={handlePalmFormSubmission.bind(null, locale, 7)}
          className="space-y-4"
        >
          {palmLineOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center p-4 border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-violet-300 hover:bg-violet-50/50 transition-all"
            >
              <input
                type="radio"
                name="palmLines"
                value={option.id}
                className="sr-only peer"
              />
              <div className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:bg-violet-600 peer-checked:border-violet-600 transition-all"></div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-gray-900">{option.name}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </label>
          ))}

          <button
            type="submit"
            className="w-full h-14 bg-violet-600 text-white text-lg font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-lg mt-6"
          >
            继续分析 →
          </button>
        </form>
      </main>
      <StableFormClient />
    </div>
  )
}