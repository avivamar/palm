'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// 导入所有步骤组件
import Step0Landing from './steps/Step0Landing'
import Step1Gender from './steps/Step1Gender'
import Step2Energy from './steps/Step2Energy'
import Step3Hand from './steps/Step3Hand'
import Step4Motivation from './steps/Step4Motivation'
import Step5Analysis from './steps/Step5Analysis'
import Step6Birth from './steps/Step6Birth'
import Step7PalmLines from './steps/Step7PalmLines'
import Step8Fingers from './steps/Step8Fingers'
import Step9Location from './steps/Step9Location'
import Step10Progress from './steps/Step10Progress'
import Step11PalmLinePriority from './steps/Step11PalmLinePriority'
import Step12Upload from './steps/Step12Upload'
import Step13Capture from './steps/Step13Capture'
import Step14ScanProgress from './steps/Step14ScanProgress'
import Step15AIAnalysis from './steps/Step15AIAnalysis'
import Step16EmailVerification from './steps/Step16EmailVerification'
import Step17Storytelling from './steps/Step17Storytelling'
import Step18PricingSelection from './steps/Step18PricingSelection'
import Step19InvestmentPlan from './steps/Step19InvestmentPlan'
import Step20FinalOffer from './steps/Step20FinalOffer'

const steps = [
  Step0Landing, Step1Gender, Step2Energy, Step3Hand, Step4Motivation,
  Step5Analysis, Step6Birth, Step7PalmLines, Step8Fingers, Step9Location,
  Step10Progress, Step11PalmLinePriority, Step12Upload, Step13Capture,
  Step14ScanProgress, Step15AIAnalysis, Step16EmailVerification,
  Step17Storytelling, Step18PricingSelection, Step19InvestmentPlan,
  Step20FinalOffer
]

interface SimplePalmStepComponentProps {
  step: number
  locale: string
}

export function SimplePalmStepComponent({ step, locale }: SimplePalmStepComponentProps) {
  const router = useRouter()
  const [userData, setUserData] = useState({})
  
  // 从localStorage读取数据
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('palm-data')
      if (saved) {
        try {
          setUserData(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to parse palm data:', e)
        }
      }
    }
  }, [])
  
  // 更新用户数据
  const updateUserData = (newData: any) => {
    const updated = { ...userData, ...newData }
    setUserData(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('palm-data', JSON.stringify(updated))
    }
  }
  
  // 进入下一步
  const goToNextStep = () => {
    if (step < 20) {
      router.push(`/${locale}/palm/flow/${step + 1}`)
    }
  }
  
  // 简单的事件追踪
  const trackEvent = (eventName: string, data?: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, data)
    }
  }
  
  const StepComponent = steps[step]
  
  if (!StepComponent) {
    return <div>步骤未找到</div>
  }
  
  // 渲染当前步骤
  return (
    <StepComponent
      userData={userData}
      updateUserData={updateUserData}
      goToNextStep={goToNextStep}
      trackEvent={trackEvent}
      experiments={{}}
      sessionId={`palm_${Date.now()}`}
    />
  )
}