'use client'

import { useEffect } from 'react'
import { usePalm } from './PalmProvider'

export function PalmAnalytics() {
  const { analytics, currentStep } = usePalm()
  
  useEffect(() => {
    // 初始化分析工具
    if (typeof window !== 'undefined') {
      // PostHog
      if (window.posthog) {
        window.posthog.identify(analytics.sessionId, {
          palm_session: analytics.sessionId,
          palm_start_time: analytics.startTime,
          palm_experiments: analytics.experiments
        })
      }
      
      // Google Analytics
      if (window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          custom_map: {
            'custom_parameter_1': 'palm_session_id',
            'custom_parameter_2': 'palm_step'
          }
        })
        
        window.gtag('event', 'palm_session_start', {
          palm_session_id: analytics.sessionId,
          palm_step: currentStep
        })
      }
      
      // Facebook Pixel
      if (window.fbq) {
        window.fbq('trackCustom', 'PalmSessionStart', {
          session_id: analytics.sessionId,
          step: currentStep
        })
      }
      
      // Microsoft Clarity
      if (window.clarity) {
        window.clarity('set', 'palm_session', analytics.sessionId)
        window.clarity('set', 'palm_step', currentStep.toString())
      }
    }
  }, [analytics.sessionId])
  
  // 步骤变化追踪
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stepData = {
        session_id: analytics.sessionId,
        step: currentStep,
        timestamp: Date.now()
      }
      
      // PostHog
      window.posthog?.capture('palm_step_view', stepData)
      
      // Google Analytics
      window.gtag?.('event', 'palm_step_view', {
        event_category: 'palm_flow',
        event_label: `step_${currentStep}`,
        palm_session_id: analytics.sessionId
      })
      
      // Facebook Pixel
      window.fbq?.('trackCustom', 'PalmStepView', stepData)
    }
  }, [currentStep, analytics.sessionId])
  
  // 实验变体追踪
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(analytics.experiments).length > 0) {
      Object.entries(analytics.experiments).forEach(([experiment, variant]) => {
        // PostHog
        window.posthog?.capture('palm_experiment_assigned', {
          experiment,
          variant,
          session_id: analytics.sessionId
        })
        
        // Google Analytics
        window.gtag?.('event', 'palm_experiment', {
          event_category: 'experiments',
          event_label: `${experiment}_${variant}`,
          palm_session_id: analytics.sessionId
        })
      })
    }
  }, [analytics.experiments, analytics.sessionId])
  
  return null
}

// 类型声明
declare global {
  interface Window {
    posthog?: any
    gtag?: any
    fbq?: any
    clarity?: any
  }
}