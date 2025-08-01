'use client'

import { Suspense, lazy } from 'react'
import { PalmStepConfig } from '@/libs/palm/config'
import { usePalm } from './PalmProvider'
import { PalmLayout } from './PalmLayout'
import { PalmLoadingSpinner } from './PalmLoadingSpinner'

// 动态导入步骤组件
const stepComponents = {
  0: lazy(() => import('./steps/Step0Landing')),
  1: lazy(() => import('./steps/Step1Gender')),
  2: lazy(() => import('./steps/Step2Energy')),
  3: lazy(() => import('./steps/Step3Hand')),
  4: lazy(() => import('./steps/Step4Motivation')),
  5: lazy(() => import('./steps/Step5Analysis')),
  6: lazy(() => import('./steps/Step6Birth')),
  7: lazy(() => import('./steps/Step7PalmLines')),
  8: lazy(() => import('./steps/Step8Fingers')),
  9: lazy(() => import('./steps/Step9Location')),
  10: lazy(() => import('./steps/Step10Progress')),
  11: lazy(() => import('./steps/Step11PalmLinePriority')),
  12: lazy(() => import('./steps/Step12Upload')),
  13: lazy(() => import('./steps/Step13Capture')),
  14: lazy(() => import('./steps/Step14ScanProgress')),
  15: lazy(() => import('./steps/Step15AIAnalysis')),
  16: lazy(() => import('./steps/Step16EmailVerification')),
  17: lazy(() => import('./steps/Step17Storytelling')),
  18: lazy(() => import('./steps/Step18PricingSelection')),
  19: lazy(() => import('./steps/Step19InvestmentPlan')),
  20: lazy(() => import('./steps/Step20FinalOffer')),
}

interface PalmStepComponentProps {
  step: number
  config: PalmStepConfig
  locale: string
}

export function PalmStepComponent({ step, config, locale }: PalmStepComponentProps) {
  const { 
    userData, 
    updateUserData, 
    goToNextStep, 
    trackEvent, 
    analytics,
    canProceed 
  } = usePalm()

  // 获取步骤组件
  const StepComponent = stepComponents[step as keyof typeof stepComponents]
  
  if (!StepComponent) {
    return (
      <PalmLayout step={step} config={config}>
        <div className="text-center py-20">
          <h1 className="text-xl font-bold text-gray-800">
            步骤 {step} 正在开发中...
          </h1>
        </div>
      </PalmLayout>
    )
  }

  // 步骤通用Props
  const stepProps = {
    userData,
    updateUserData,
    goToNextStep,
    trackEvent,
    config,
    locale,
    canProceed: canProceed(),
    sessionId: analytics.sessionId,
    experiments: analytics.experiments
  }

  return (
    <PalmLayout step={step} config={config}>
      <Suspense fallback={<PalmLoadingSpinner />}>
        <StepComponent {...stepProps} />
      </Suspense>
    </PalmLayout>
  )
}