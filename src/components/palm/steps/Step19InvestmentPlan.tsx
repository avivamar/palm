'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'
// import { useRouter } from 'next/navigation' // Removed unused import

interface Step19Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

interface FeatureCard {
  icon: string
  title: string
  description: string
  bgColor: string
  iconColor: string
}

export default function Step19InvestmentPlan({ 
  userData,
  updateUserData,
  trackEvent, 
  goToNextStep
}: Step19Props) {
  // const router = useRouter() // Removed unused router
  const [timeLeft, setTimeLeft] = useState(30)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  
  const featureCards: FeatureCard[] = [
    {
      icon: '🏥',
      title: '健康预警系统',
      description: '提前3-6个月预测健康风险，让您抢在疾病之前采取行动',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500'
    },
    {
      icon: '💖',
      title: '情感密码解译',
      description: '揭示您在关系中的隐藏模式，修复那些反复出现的情感困扰',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-500'
    },
    {
      icon: '🚀',
      title: '事业突破密码',
      description: '发现您的天赋优势区域，找到真正适合您的成功路径',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500'
    }
  ]
  
  useEffect(() => {
    trackEvent('palm_investment_plan_view', { 
      timestamp: Date.now(),
      step: 19,
      userEmail: userData.email
    })
    
    // 倒计时定时器
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          trackEvent('palm_countdown_expired', { 
            timestamp: Date.now()
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [userData.email])
  
  const handlePayment = async () => {
    if (isPaymentProcessing) return
    
    setIsPaymentProcessing(true)
    
    trackEvent('palm_investment_payment_initiate', { 
      amount: 5,
      timestamp: Date.now(),
      timeRemaining: timeLeft
    })
    
    updateUserData({ 
      investmentPlan: true,
      investmentAmount: 5 
    })
    
    // 模拟支付处理
    setTimeout(() => {
      trackEvent('palm_investment_payment_complete', { 
        amount: 5,
        timestamp: Date.now()
      })
      
      goToNextStep()
    }, 2000)
  }
  
  return (
    <div className="w-[390px] mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center p-4 bg-white"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600">
          <span className="text-sm font-bold">🔮</span>
        </div>
        <span className="text-gray-600 text-sm">{userData.email || 'user@mail.com'}</span>
      </motion.div>

      {/* Success Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-6 mx-4 mt-4 rounded-2xl shadow-lg"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🎉</span>
          <h1 className="text-xl font-bold">您的生命密码已解锁！</h1>
        </div>
        <p className="text-indigo-100 leading-relaxed">
          恭喜！您即将成为那1%真正了解自己的人。再 
          <span className={`font-bold bg-amber-500 text-white px-2 py-1 rounded mx-1 ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
            {timeLeft}
          </span> 
          秒，改变一生的洞见将永远离开您。
        </p>
      </motion.div>

      {/* Investment Plan Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mx-4 mt-6 rounded-2xl p-6 bg-white shadow-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-800">您的专属投资方案（7天完整权限）</h2>
        </div>
        
        <div className="text-center mb-6">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-4xl font-bold mb-2 text-indigo-600"
          >
            $5
          </motion.div>
          <div className="text-gray-600 mb-4">启动投资</div>
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
            已节省 $8.67
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="text-gray-600 text-sm">低于运营成本 $13.7</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="text-gray-600 text-sm">7天内随时退款，零风险</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="text-gray-600 text-sm">限时优惠，仅此一次</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Life Transformation Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mx-4 mt-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔮</span>
          <h3 className="text-lg font-semibold text-gray-800">您即将获得的生命转变</h3>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          每一项洞察，都可能改写您的人生轨迹
        </p>

        {/* Feature Cards */}
        <div className="space-y-4">
          {featureCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              whileHover={{ 
                y: -2, 
                transition: { duration: 0.2 } 
              }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <span className={`${card.iconColor} text-lg`}>{card.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 text-gray-800">{card.title}</h4>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {card.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePayment}
          disabled={isPaymentProcessing}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
            isPaymentProcessing 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isPaymentProcessing ? '处理中...' : '立即支付 $5 · 解锁报告'}
        </motion.button>
      </motion.div>

      {/* Bottom Padding */}
      <div className="h-24"></div>
    </div>
  )
}