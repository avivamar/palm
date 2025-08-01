import { notFound } from 'next/navigation'
import { PALM_STEPS_CONFIG } from '@/libs/palm/config'

// 服务端组件 - 避免所有客户端水合问题
type Props = {
  params: Promise<{ step: string; locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// 动态导入所有步骤组件
const stepComponents = {
  0: () => import('@/components/palm/stable/Step0Landing'),
  1: () => import('@/components/palm/stable/Step1Gender'),
  2: () => import('@/components/palm/stable/Step2Energy'),
  3: () => import('@/components/palm/stable/Step3Hand'),
  4: () => import('@/components/palm/stable/Step4Motivation'),
  5: () => import('@/components/palm/stable/Step5Analysis'),
  6: () => import('@/components/palm/stable/Step6Birth'),
  7: () => import('@/components/palm/stable/Step7PalmLines'),
  8: () => import('@/components/palm/stable/Step8Fingers'),
  9: () => import('@/components/palm/stable/Step9Location'),
  10: () => import('@/components/palm/stable/Step10Progress'),
  11: () => import('@/components/palm/stable/Step11PalmLinePriority'),
  12: () => import('@/components/palm/stable/Step12Upload'),
  13: () => import('@/components/palm/stable/Step13Capture'),
  14: () => import('@/components/palm/stable/Step14ScanProgress'),
  15: () => import('@/components/palm/stable/Step15AIAnalysis'),
  16: () => import('@/components/palm/stable/Step16EmailVerification'),
  17: () => import('@/components/palm/stable/Step17Storytelling'),
  18: () => import('@/components/palm/stable/Step18PricingSelection'),
  19: () => import('@/components/palm/stable/Step19InvestmentPlan'),
  20: () => import('@/components/palm/stable/Step20FinalOffer'),
}

export default async function StablePalmPage({ params, searchParams }: Props) {
  const { step, locale } = await params
  const query = await searchParams
  const stepNum = parseInt(step)
  
  if (isNaN(stepNum) || stepNum < 0 || stepNum > 20) {
    notFound()
  }

  const stepConfig = PALM_STEPS_CONFIG[stepNum]
  if (!stepConfig) {
    notFound()
  }

  // 动态加载组件
  const importFn = stepComponents[stepNum as keyof typeof stepComponents]
  if (!importFn) {
    notFound()
  }

  const { default: StepComponent } = await importFn()
  
  // 将URL参数传递给组件（代替复杂的状态管理）
  return (
    <StepComponent 
      locale={locale}
      searchParams={query}
      config={stepConfig}
    />
  )
}

// 生成静态路径
export function generateStaticParams() {
  const steps = Array.from({ length: 21 }, (_, i) => i.toString())
  const locales = ['en', 'es', 'ja', 'zh-HK']
  
  return locales.flatMap(locale =>
    steps.map(step => ({
      locale,
      step
    }))
  )
}

// 启用动态渲染以避免404
export const dynamic = 'force-dynamic'