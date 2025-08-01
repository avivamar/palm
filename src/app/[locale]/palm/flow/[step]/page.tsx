import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { SimplePalmStepComponent } from '@/components/palm/SimplePalmStepComponent'
import { PALM_STEPS_CONFIG } from '@/libs/palm/config'

type Props = {
  params: Promise<{ step: string; locale: string }>
}

// 动态生成metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { step, locale } = await params
  const stepNum = parseInt(step)
  const stepConfig = PALM_STEPS_CONFIG[stepNum]
  
  if (!stepConfig) {
    return { title: 'Page Not Found' }
  }

  return {
    title: `${stepConfig.seoTitle} - ThePalmistryLife`,
    description: stepConfig.seoDescription,
    openGraph: {
      title: stepConfig.seoTitle,
      description: stepConfig.seoDescription,
      url: `/${locale}/palm/flow/${stepNum}`,
    },
  }
}

// 预生成静态路径（0-20步骤）
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

export default async function PalmFlowStepPage({ params }: Props) {
  const { step, locale } = await params
  const stepNum = parseInt(step)
  
  // 验证步骤有效性
  if (isNaN(stepNum) || stepNum < 0 || stepNum > 20) {
    notFound()
  }

  const stepConfig = PALM_STEPS_CONFIG[stepNum]
  if (!stepConfig) {
    notFound()
  }

  return (
    <SimplePalmStepComponent 
      step={stepNum} 
      locale={locale}
    />
  )
}

// 启用动态渲染以避免404
export const dynamic = 'force-dynamic'