'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'
import { useRouter } from 'next/navigation'

interface Step16Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step16EmailVerification({ 
  updateUserData,
  trackEvent, 
  goToNextStep
}: Step16Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [currentLocation, setCurrentLocation] = useState('检测位置中…')
  
  useEffect(() => {
    trackEvent('palm_email_verification_view', { 
      timestamp: Date.now(),
      step: 16
    })
    
    // 获取地理位置
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => {
        setCurrentLocation(`${d.country_name || ""} ${d.region || ""}`)
      })
      .catch(() => {
        setCurrentLocation("全球")
      })
  }, [])
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    
    if (newEmail) {
      setEmailValid(validateEmail(newEmail))
    } else {
      setEmailValid(null)
    }
    
    trackEvent('palm_email_input', { 
      emailLength: newEmail.length,
      isValid: validateEmail(newEmail)
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail(email)) {
      trackEvent('palm_email_invalid', { email })
      return
    }
    
    setIsSubmitting(true)
    
    trackEvent('palm_email_submit', { 
      email,
      timestamp: Date.now()
    })
    
    // 模拟邮箱验证过程
    setTimeout(() => {
      updateUserData({ email })
      trackEvent('palm_email_verified', { 
        email,
        timestamp: Date.now()
      })
      setIsSubmitting(false)
      goToNextStep()
    }, 2000)
  }
  
  const goBack = () => {
    trackEvent('palm_email_back', { 
      timestamp: Date.now()
    })
    router.back()
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-[390px] mx-auto">
        {/* 顶部导航 */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between p-4"
        >
          {/* 返回按钮 */}
          <button 
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>

          {/* 中间的 N 标识 */}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">N</span>
          </div>

          {/* 菜单按钮 */}
          <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </motion.header>

        {/* 主要内容容器 */}
        <main className="px-6 py-8">
          {/* 标题文案 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-lg text-gray-700 leading-relaxed mb-4">
              准备好深入了解你的爱情、生活和性格了吗？
            </h1>
            <p className="text-base text-gray-600 leading-relaxed">
              只需*输入你的邮箱，这样我们就不会丢失你的信息
            </p>
          </motion.div>

          {/* 邮箱输入表单 */}
          <motion.form 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            {/* 邮箱输入框 */}
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={handleEmailChange}
                placeholder="burnmylin@gmail.com"
                className={`w-full px-4 py-4 text-base border-2 rounded-2xl focus:outline-none bg-white transition-all duration-300 focus:transform focus:-translate-y-0.5 focus:shadow-lg ${
                  emailValid === null 
                    ? 'border-gray-200 focus:border-violet-400' 
                    : emailValid 
                      ? 'border-green-400 focus:border-green-500' 
                      : 'border-red-400 focus:border-red-500'
                }`}
                required
              />
            </div>

            {/* 提交按钮 */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || !validateEmail(email)}
              className={`w-full font-medium py-4 px-6 rounded-2xl transition-all duration-200 ${
                isSubmitting || !validateEmail(email)
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-violet-600 hover:bg-violet-700 text-white'
              }`}
            >
              {isSubmitting ? '处理中...' : '继续'}
            </motion.button>
          </motion.form>

          {/* 底部说明文字 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500 leading-relaxed">
              *我们只会平台发送分析结果，我们不会向你发送任何营销邮件，也不会将你的邮箱分享给第三方。
            </p>
          </motion.div>

          {/* 法律声明 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <p className="text-xs text-gray-400">
              继续即表示您同意我们的
              <a href="/terms" className="text-violet-600 hover:underline">服务条款</a>
              和
              <a href="/privacy" className="text-violet-600 hover:underline">隐私政策</a>
            </p>
          </motion.div>
        </main>

        {/* 地理位置显示 */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="fixed bottom-4 left-0 right-0 text-center"
        >
          <p className="text-xs text-gray-400">
            <span>{currentLocation}</span>&nbsp;节点
          </p>
        </motion.footer>
      </div>
    </div>
  )
}