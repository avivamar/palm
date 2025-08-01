'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface StableAutoRedirectProps {
  targetUrl: string
  delay: number // 毫秒
}

export function StableAutoRedirect({ targetUrl, delay }: StableAutoRedirectProps) {
  const router = useRouter()
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(targetUrl)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [targetUrl, delay, router])
  
  return null // 不渲染任何内容，避免水合问题
}