'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PalmStorage } from '@/libs/palm/stableStorage'

// 极简客户端组件 - 仅用于保存数据到localStorage
export function StableFormClient() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // 将URL参数保存到localStorage（如果有的话）
    const params = Object.fromEntries(searchParams.entries())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== 'step') {
        PalmStorage.setData(key, value)
      }
    })
    
    // 全局分析追踪 - 依赖全局GTM/GA
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'palm_step_view',
        step: window.location.pathname.split('/').pop()
      })
    }
  }, [searchParams])
  
  return null // 不渲染任何内容，避免水合问题
}