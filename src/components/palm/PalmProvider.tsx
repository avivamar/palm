'use client'

import { createContext, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { usePalmStore } from '@/stores/palmStore'
import { PalmState } from '@/stores/palmStore'

interface PalmContextType extends PalmState {
  // 扩展方法
  goToStep: (step: number) => void
  goToNextStep: () => void
  resetFlow: () => void
  getProgress: () => number
  trackEvent: (type: string, data?: any) => void
}

const PalmContext = createContext<PalmContextType | null>(null)

export function PalmProvider({ 
  children, 
  locale = 'zh' 
}: { 
  children: ReactNode
  locale?: string 
}) {
  const store = usePalmStore()
  const router = useRouter()
  
  // Ensure analytics is properly initialized (only on client-side)
  useEffect(() => {
    if (typeof window !== 'undefined' && (!store.analytics || !Array.isArray(store.analytics.events))) {
      console.warn('Palm Store: Reinitializing corrupted analytics state')
      // Force reinitialization
      localStorage.removeItem('palm-store')
      window.location.reload()
    }
  }, [store.analytics])
  
  const goToStep = useCallback((step: number) => {
    store.setCurrentStep(step)
    // 预加载下一步
    if (step < 20) {
      store.preloadStep(step + 1)
    }
    // 分析事件
    store.trackEvent('palm_step_navigate', { 
      from: store.currentStep, 
      to: step,
      locale,
      timestamp: Date.now()
    })
    // 实际页面导航
    router.push(`/${locale}/palm/${step}`)
  }, [store, locale, router])

  const goToNextStep = useCallback(() => {
    const nextStep = store.currentStep + 1
    if (nextStep <= 20) {
      store.setCurrentStep(nextStep)
      store.preloadStep(nextStep + 1)
      store.trackEvent('palm_step_next', { 
        step: nextStep,
        locale,
        timestamp: Date.now()
      })
      // 实际页面导航
      router.push(`/${locale}/palm/flow/${nextStep}`)
    }
  }, [store, locale, router])

  const resetFlow = useCallback(() => {
    store.resetFlow()
    store.trackEvent('palm_flow_reset', { timestamp: Date.now() })
  }, [store])

  const getProgress = useCallback(() => {
    return Math.round((store.currentStep / 20) * 100)
  }, [store.currentStep])

  const trackEvent = useCallback((type: string, data?: any) => {
    store.trackEvent(type, data)
  }, [store])

  const contextValue: PalmContextType = useMemo(() => ({
    ...store,
    goToStep,
    goToNextStep,
    resetFlow,
    getProgress,
    trackEvent
  }), [store, goToStep, goToNextStep, resetFlow, getProgress, trackEvent])

  return (
    <PalmContext.Provider value={contextValue}>
      {children}
    </PalmContext.Provider>
  )
}

export function usePalm() {
  const context = useContext(PalmContext)
  if (!context) {
    throw new Error('usePalm must be used within a PalmProvider')
  }
  return context
}