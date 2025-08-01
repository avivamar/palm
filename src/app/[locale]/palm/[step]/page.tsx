import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { PalmStepComponent } from '@/components/palm/PalmStepComponent'
import { PALM_STEPS_CONFIG } from '@/libs/palm/config'
import { PalmPreloader } from '@/components/palm/PalmPreloader'

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
      url: `/${locale}/palm/${stepNum}`,
    },
  }
}

// 预生成静态路径（0-20步骤）
export function generateStaticParams() {
  return Array.from({ length: 21 }, (_, i) => ({
    step: i.toString(),
  }))
}

export default async function PalmStepPage({ params }: Props) {
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
    <>
      <PalmStepComponent 
        step={stepNum} 
        config={stepConfig}
        locale={locale}
      />
      <PalmPreloader currentStep={stepNum} />
    </>
  )
}

// 启用静态生成
export const revalidate = 3600 // 1 hour