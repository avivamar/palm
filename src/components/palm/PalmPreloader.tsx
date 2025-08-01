'use client'

import { useEffect } from 'react'
import { usePalm } from './PalmProvider'

interface PalmPreloaderProps {
  currentStep: number
}

export function PalmPreloader({ currentStep }: PalmPreloaderProps) {
  const { preloadStep } = usePalm()
  
  useEffect(() => {
    // 预加载策略：当前步骤+1和+2
    const preloadSteps = [currentStep + 1, currentStep + 2].filter(
      step => step <= 20
    )
    
    preloadSteps.forEach(step => {
      preloadStep(step)
    })
    
    // 预加载关键资源
    if (typeof window !== 'undefined') {
      // 预加载下一步的路由
      preloadSteps.forEach(step => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = `/palm/${step}`
        document.head.appendChild(link)
      })
      
      // 预加载关键图片资源
      if (currentStep === 0) {
        const images = [
          '/img/demohand.png',
          '/img/male.svg',
          '/img/female.svg',
          '/img/logo.svg'
        ]
        
        images.forEach(src => {
          const img = new Image()
          img.src = src
        })
      }
    }
  }, [currentStep, preloadStep])
  
  return null
}

// 智能预加载Hook
export function useSmartPreload() {
  const { preloadStep, currentStep, analytics } = usePalm()
  
  useEffect(() => {
    // 基于用户行为预测下一步
    const userBehavior = analytics.events
      .filter(e => e.type === 'step_change')
      .slice(-5) // 最近5次行为
    
    // 如果用户快速前进，预加载更多步骤
    const avgStepTime = userBehavior.length > 1 ? 
      userBehavior.reduce((acc, event, index) => {
        if (index === 0) return acc
        const prevEvent = userBehavior[index - 1]
        if (!prevEvent) return acc
        return acc + (event.timestamp - prevEvent.timestamp)
      }, 0) / (userBehavior.length - 1) : 
      60000 // 默认1分钟
    
    // 快速用户（<30秒/步）预加载更多
    const preloadDistance = avgStepTime < 30000 ? 3 : 2
    
    for (let i = 1; i <= preloadDistance; i++) {
      const nextStep = currentStep + i
      if (nextStep <= 20) {
        preloadStep(nextStep)
      }
    }
  }, [currentStep, analytics.events, preloadStep])
}