import { PalmStepConfig } from '@/libs/palm/config'
import { handlePalmFormSubmission } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step19Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step19InvestmentPlan({ locale }: Step19Props) {
  const investmentPlans = [
    {
      id: 'conservative',
      name: '稳健投资计划',
      risk: '低风险',
      return: '年化收益 6-8%',
      description: '适合风险厌恶者，注重资本保值增值',
      features: ['固定收益产品', '蓝筹股投资', '分散风险配置']
    },
    {
      id: 'balanced',
      name: '平衡投资计划',
      risk: '中等风险',
      return: '年化收益 8-12%',
      description: '平衡风险与收益，适合大多数投资者',
      features: ['股债平衡配置', '指数基金投资', '定期调仓'],
      popular: true
    },
    {
      id: 'aggressive',
      name: '进取投资计划',
      risk: '高风险',
      return: '年化收益 12-20%',
      description: '追求高收益，适合风险承受能力强的投资者',
      features: ['成长股投资', '新兴市场配置', '灵活投资策略']
    }
  ]

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-20">
        <header className="py-4 text-center">
          <div className="relative w-full h-2 bg-violet-100 rounded-full mb-2">
            <div className="h-full w-[100%] bg-violet-600 rounded-full transition-all"></div>
          </div>
          <span className="text-xs text-gray-500">Step 19 / 21</span>
        </header>

        <section className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            投资方案推荐
          </h1>
          <p className="text-gray-600 leading-relaxed">
            基于你的财富分析，为你推荐最适合的投资策略
          </p>
          <div className="mt-3 inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            🎯 个性化匹配度 94%
          </div>
        </section>

        <form 
          action={handlePalmFormSubmission.bind(null, locale, 19)}
          className="space-y-4"
        >
          {investmentPlans.map((plan) => (
            <label
              key={plan.id}
              className={`relative block p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                plan.popular 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-4 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                  AI推荐
                </div>
              )}
              
              <input
                type="radio"
                name="investmentPlan"
                value={plan.id}
                className="sr-only peer"
                defaultChecked={plan.popular}
              />
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{plan.risk}</span>
                    <span className="text-sm font-semibold text-green-600">{plan.return}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="text-blue-500 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all ml-4"></div>
              </div>
            </label>
          ))}

          <button
            type="submit"
            className="w-full h-14 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg mt-6"
          >
            确认投资方案 →
          </button>
        </form>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 投资提醒</h4>
          <p className="text-sm text-yellow-800">
            投资有风险，理财需谨慎。建议结合个人实际情况，理性投资，分散风险。
          </p>
        </div>
      </main>

      <StableFormClient />
    </div>
  )
}