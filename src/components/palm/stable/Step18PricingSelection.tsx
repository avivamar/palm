import { PalmStepConfig } from '@/libs/palm/config'
import { handlePalmFormSubmission } from '@/app/[locale]/palm/stable/actions'
import { StableFormClient } from './StableFormClient'

interface Step18Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step18PricingSelection({ locale }: Step18Props) {
  const pricingOptions = [
    {
      id: 'premium',
      name: '专业版报告',
      price: '$29',
      originalPrice: '$99',
      features: ['完整财富分析', '投资时机指导', '风险管理建议', '个性化策略'],
      popular: true
    },
    {
      id: 'basic',
      name: '基础版报告',
      price: '$9',
      originalPrice: '$29',
      features: ['基础财富分析', '简单投资建议'],
      popular: false
    },
    {
      id: 'payasyoucan',
      name: '随心支付',
      price: '自定义',
      originalPrice: '',
      features: ['完整报告内容', '按能力支付', '最低$1起'],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-20">
        <header className="py-4 text-center">
          <div className="relative w-full h-2 bg-violet-100 rounded-full mb-2">
            <div className="h-full w-[100%] bg-violet-600 rounded-full transition-all"></div>
          </div>
          <span className="text-xs text-gray-500">Step 18 / 21</span>
        </header>

        <section className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            选择您的财富分析方案
          </h1>
          <p className="text-gray-600 leading-relaxed">
            获取专业的财富指导，开启你的投资成功之路
          </p>
          <div className="mt-3 inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            💰 限时特价 70% OFF
          </div>
        </section>

        <form 
          action={handlePalmFormSubmission.bind(null, locale, 18)}
          className="space-y-4"
        >
          {pricingOptions.map((option) => (
            <label
              key={option.id}
              className={`relative block p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                option.popular 
                  ? 'border-violet-500 bg-violet-50' 
                  : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
              }`}
            >
              {option.popular && (
                <div className="absolute -top-2 left-4 px-3 py-1 bg-violet-600 text-white text-xs font-bold rounded-full">
                  最受欢迎
                </div>
              )}
              
              <input
                type="radio"
                name="selectedPrice"
                value={option.id}
                className="sr-only peer"
                defaultChecked={option.popular}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{option.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-bold text-violet-600">{option.price}</span>
                    {option.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">{option.originalPrice}</span>
                    )}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {option.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:bg-violet-600 peer-checked:border-violet-600 transition-all ml-4"></div>
              </div>
            </label>
          ))}

          <button
            type="submit"
            className="w-full h-14 bg-violet-600 text-white text-lg font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-lg mt-6"
          >
            继续获取我的财富报告 →
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <span>🔒</span>
            <span>安全支付</span>
            <span>•</span>
            <span>30天退款保证</span>
          </div>
        </div>
      </main>

      <StableFormClient />
    </div>
  )
}