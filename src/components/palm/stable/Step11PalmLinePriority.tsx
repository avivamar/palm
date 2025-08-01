import { PalmStepConfig } from '@/libs/palm/config'
import { handlePalmFormSubmission } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step11Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step11PalmLinePriority({ locale }: Step11Props) {
  const priorities = [
    { id: 'wealth', name: '财富线优先', description: '重点分析投资机会和财富积累' },
    { id: 'career', name: '事业线优先', description: '重点分析事业发展和成功机会' },
    { id: 'health', name: '生命线优先', description: '重点分析健康运势和长期规划' },
    { id: 'relationship', name: '感情线优先', description: '重点分析感情财运和人际关系' }
  ]

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-20">
        <header className="py-4 text-center">
          <div className="relative w-full h-2 bg-violet-100 rounded-full mb-2">
            <div className="h-full w-[100%] bg-violet-600 rounded-full transition-all"></div>
          </div>
          <span className="text-xs text-gray-500">Step 11 / 21</span>
        </header>

        <section className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            设定掌纹优先级
          </h1>
          <p className="text-gray-600 leading-relaxed">
            选择你最关心的领域，获得更精准的个性化分析
          </p>
        </section>

        <form 
          action={handlePalmFormSubmission.bind(null, locale, 11)}
          className="space-y-4"
        >
          {priorities.map((priority) => (
            <label
              key={priority.id}
              className="flex items-center p-4 border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-violet-300 hover:bg-violet-50/50 transition-all"
            >
              <input
                type="radio"
                name="palmLinePriority"
                value={priority.id}
                className="sr-only peer"
              />
              <div className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:bg-violet-600 peer-checked:border-violet-600 transition-all"></div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-gray-900">{priority.name}</h3>
                <p className="text-sm text-gray-600">{priority.description}</p>
              </div>
            </label>
          ))}

          <button
            type="submit"
            className="w-full h-14 bg-violet-600 text-white text-lg font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-lg mt-6"
          >
            开始专业分析 →
          </button>
        </form>
      </main>
      <StableFormClient />
    </div>
  )
}