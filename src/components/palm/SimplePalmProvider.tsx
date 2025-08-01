'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSimplePalmStore } from '@/stores/simplePalmStore'

interface SimplePalmProviderProps {
  children: ReactNode
  locale: string
}

export function SimplePalmProvider({ children, locale }: SimplePalmProviderProps) {
  const router = useRouter()
  const store = useSimplePalmStore()
  
  // 极简的导航函数
  const goToNextStep = () => {
    const nextStep = store.currentStep + 1
    if (nextStep <= 20) {
      store.setStep(nextStep)
      router.push(`/${locale}/palm/flow/${nextStep}`)
    }
  }
  
  // 通过props传递给子组件，避免context的复杂性
  const childrenWithProps = (children as any).props.children.map((child: any) => {
    if (child && child.type && child.type.name && child.type.name.startsWith('Step')) {
      return {
        ...child,
        props: {
          ...child.props,
          userData: store.userData,
          updateUserData: store.updateData,
          goToNextStep,
          currentStep: store.currentStep
        }
      }
    }
    return child
  })
  
  return <>{childrenWithProps}</>
}