'use client'

import { useEffect, useState } from 'react'
// import { motion } from 'framer-motion' // Removed unused import
import { PalmUserData } from '@/stores/palmStore'
import { useRouter } from 'next/navigation'

interface Step20Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step20FinalOffer({ 
  updateUserData,
  trackEvent, 
  sessionId
}: Step20Props) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(2 * 60) // 2分钟
  const [isProcessing, setIsProcessing] = useState(false)
  
  useEffect(() => {
    trackEvent('palm_final_offer_view', { 
      timestamp: Date.now(),
      step: 20
    })
    
    // 倒计时功能
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    // 页面加载动画
    const elements = document.querySelectorAll('.animate-element')
    elements.forEach((el, index) => {
      const element = el as HTMLElement
      element.style.opacity = '0'
      element.style.transform = 'translateY(20px)'
      
      setTimeout(() => {
        element.style.transition = 'all 0.6s ease'
        element.style.opacity = '1'
        element.style.transform = 'translateY(0)'
      }, index * 200)
    })
    
    return () => clearInterval(timer)
  }, [])
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
  
  const handleFinalPayment = () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    
    trackEvent('palm_final_payment_initiate', { 
      amount: 19,
      timeRemaining: timeLeft,
      timestamp: Date.now()
    })
    
    updateUserData({ 
      finalOfferAccepted: true,
      finalAmount: 19 
    })
    
    // 模拟处理过程
    setTimeout(() => {
      trackEvent('palm_final_payment_redirect', { 
        timestamp: Date.now()
      })
      
      // 跳转到支付页面
      router.push(`/${sessionId}/palm/payment`)
    }, 2000)
  }
  
  const benefitItems = [
    { text: '个性化投资组合建议（价值$67）' },
    { text: '风险管理和资产配置指导（价值$49）' },
    { text: '市场时机和投资机会提醒（价值$81）' },
    { text: 'VIP财富顾问服务支持（价值$97）' }
  ]
  
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()}
          className="text-gray-600 hover:text-purple-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <div className="text-2xl">🎯</div>
        <div className="w-6"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        {/* Title Section */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">💝</div>
          <h1 className="text-2xl font-bold text-purple-600 mb-2">您的专属财富报告已准备就绪</h1>
          <p className="text-gray-600 text-lg mb-2">解锁您的投资天赋，发现财富增长机会</p>
          <p className="text-sm text-gray-500">七天无条件退款保障，零风险体验</p>
        </div>

        {/* Final Offer Card */}
        <div className="animate-element bg-white border-2 border-amber-400 rounded-2xl p-4 mb-4 relative shadow-lg">
          {/* Gift icon */}
          <div className="absolute -top-3 left-5 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white text-lg">
            🎁
          </div>
          
          <div className="text-center">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full text-base font-bold inline-block mb-3 animate-pulse shadow-lg">
              💰 限时特价：原价197美元，今日仅19美元
            </div>
            <div className="mb-3">
              <div className="text-sm text-gray-500 mb-1">专业财富顾问服务：</div>
              <div className="text-lg text-gray-700 line-through mb-1">通常价格 $197美元</div>
              <div className="text-sm text-gray-500 mb-2">为您节省 $178美元 (折扣90%)</div>
            </div>
            <div className="mb-2">
              <div className="text-sm text-gray-500 mb-1">今日特价：</div>
              <div className="text-3xl font-bold text-purple-600">$19美元</div>
              <div className="text-sm text-green-600 font-medium">仅限前100名用户</div>
            </div>
          </div>
        </div>

        {/* Price Card */}
        <div className="animate-element bg-white border-2 border-gray-200 rounded-2xl p-6 text-center mb-4 relative overflow-hidden shadow-lg">
          {/* Shimmer effect */}
          <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-purple-100 to-transparent opacity-50 animate-shimmer"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-4">
              <div className="text-lg font-semibold text-gray-800 mb-2">获取您的专属财富报告</div>
              <div className={`countdown mb-3 font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg text-lg ${timeLeft <= 0 ? 'text-green-500 bg-green-50' : ''}`}>
                {timeLeft <= 0 ? '优惠仍然有效' : formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500 mb-3">
                包含个性化投资建议和财富增长策略
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-1 mb-4">
              {benefitItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-sm">✓</span>
                  </div>
                  <span className="text-sm text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50">
          <div className="max-w-md mx-auto">
            <button 
              className={`animate-element w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all shadow-lg ${
                isProcessing 
                  ? 'bg-gray-400 opacity-70 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:-translate-y-0.5 hover:shadow-xl'
              }`}
              onClick={handleFinalPayment}
              disabled={isProcessing}
            >
              {isProcessing ? '处理中...' : '立即获取财富报告 ($19) →'}
            </button>
          </div>
        </div>

        {/* Spacer for fixed button */}
        <div className="h-20"></div>

        {/* Trust Indicators */}
        <div className="text-center text-xs text-gray-500 leading-relaxed mb-4">
          💰 总价值$294的专业财富服务，今日仅需$19。这是一个限时特价。
          <br/><br/>
          ✅ 7天无条件退款保障，如果不满意，点击一下即可退款。
          <br/><br/>
          🔥 仅限前100名用户，后续将恢复原价$197。现在就是最佳时机！
        </div>
      </div>
      
      {/* Custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}