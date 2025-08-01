'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'
import { useRouter } from 'next/navigation'

interface Step18Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

interface PriceOption {
  value: number
  label: string
  icon: string
  description: string
  bgColor: string
  isRecommended?: boolean
  badgeText?: string
  badgeColor?: string
}

export default function Step18PricingSelection({ 
  updateUserData,
  trackEvent, 
  sessionId
}: Step18Props) {
  const router = useRouter()
  const [selectedPrice, setSelectedPrice] = useState(16.37)
  const [showDetails, setShowDetails] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const priceOptions: PriceOption[] = [
    {
      value: 1,
      label: '$1',
      icon: '🌱',
      description: '学生价',
      bgColor: 'bg-slate-100'
    },
    {
      value: 5,
      label: '$5',
      icon: '🔍',
      description: '标准价',
      bgColor: 'bg-slate-100'
    },
    {
      value: 9,
      label: '$9',
      icon: '✨',
      description: '支持价',
      bgColor: 'bg-emerald-100',
      badgeText: '支持',
      badgeColor: 'bg-emerald-500'
    },
    {
      value: 16.37,
      label: '$16.37',
      icon: '👑',
      description: '成本价',
      bgColor: 'bg-indigo-100',
      isRecommended: true,
      badgeText: '推荐',
      badgeColor: 'bg-indigo-600'
    }
  ]
  
  useEffect(() => {
    trackEvent('palm_pricing_view', { 
      timestamp: Date.now(),
      step: 18,
      defaultPrice: selectedPrice
    })
  }, [selectedPrice])
  
  const handlePriceSelect = (price: number) => {
    setSelectedPrice(price)
    
    trackEvent('palm_price_select', { 
      selectedPrice: price,
      timestamp: Date.now()
    })
    
    // 显示选择反馈
    const feedbacks: Record<number, string> = {
      1: "🌱 学生价选择！感谢您的参与",
      5: "🔍 标准价选择！感谢您的支持", 
      9: "✨ 支持价选择！您的支持帮助更多人获得服务",
      16.37: "👑 成本价选择！感谢您按成本价支持我们的服务！"
    }
    
    // TODO: 可以添加 toast 通知显示反馈
    console.log(feedbacks[price])
  }
  
  const handlePayment = () => {
    trackEvent('palm_payment_initiate', { 
      selectedPrice,
      timestamp: Date.now()
    })
    
    setShowConfirmModal(true)
  }
  
  const proceedToPayment = async () => {
    setShowConfirmModal(false)
    setIsProcessing(true)
    
    trackEvent('palm_payment_confirm', { 
      selectedPrice,
      timestamp: Date.now()
    })
    
    updateUserData({ 
      selectedPrice,
      paymentInitiated: true 
    })
    
    // 模拟支付处理
    setTimeout(() => {
      trackEvent('palm_payment_redirect', { 
        selectedPrice,
        paymentType: 'life-code-investment'
      })
      
      // 导航到支付页面或下一步
      router.push(`/${sessionId}/palm/payment?amount=${selectedPrice}&type=life-code-investment`)
    }, 3000)
  }
  
  const investmentMessages: Record<number, string> = {
    1: "感谢您的选择！正在为您准备专属分析报告...",
    5: "感谢您的选择！正在为您准备专属分析报告...",
    9: "感谢您的支持！您的选择帮助我们为更多人提供服务...",
    16.37: "感谢您按成本价支持我们！让我们能够持续为更多人提供优质服务！"
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-[390px] mx-auto">
        {/* 顶部导航 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between p-4 relative z-10"
        >
          <button 
            onClick={() => router.back()}
            className="text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <div className="text-2xl">
            <img src="/palm/img/logo.svg" height="50" width="50" alt="Logo" />
          </div>
          <div className="w-6"></div>
        </motion.div>

        {/* 主要内容容器 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl mx-4 shadow-lg border border-gray-100"
        >
          <div className="p-6 pb-8">
            {/* 标题区域 */}
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-block p-1 rounded-2xl mb-4"
              >
                <h1 className="text-2xl font-bold text-indigo-600 bg-white rounded-xl px-4 py-2 leading-tight">
                  生命密码解析
                </h1>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-slate-700 font-medium mb-2 leading-relaxed px-2"
              >
                🔮 <span className="font-medium text-indigo-600">生命轨迹</span> • <span className="font-medium text-emerald-600">情感密码</span> • <span className="font-medium text-amber-600">财富磁场</span><br/>
                专业掌纹分析，揭示您的人生密码
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-amber-50 border border-amber-200 rounded-lg p-3 mx-4 mb-3"
              >
                <p className="text-sm text-amber-700 font-medium">
                  ⚠️ 限时分析，错过需要重新排队
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="inline-block bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium"
              >
                🔔 已有 1,247 人获得分析报告
              </motion.div>
            </div>

            {/* 价格选择器 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6"
            >
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 mb-2">选择适合您的价格</h2>
                <p className="text-sm text-slate-600">所有选项获得相同的完整生命密码报告</p>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-6">
                {priceOptions.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePriceSelect(option.value)}
                    className={`relative flex flex-col items-center py-3 rounded-xl border-2 transition ${
                      selectedPrice === option.value
                        ? option.isRecommended
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                          : 'border-indigo-400 bg-indigo-50 text-indigo-800'
                        : 'border-transparent bg-white shadow hover:border-indigo-400'
                    }`}
                  >
                    {option.badgeText && (
                      <div className={`absolute -top-1 -right-1 ${option.badgeColor} text-white text-xs px-1 rounded-full`}>
                        {option.badgeText}
                      </div>
                    )}
                    <div className={`w-12 h-12 ${option.bgColor} rounded-full flex items-center justify-center mb-1`}>
                      <span className="text-lg">{option.icon}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-800">{option.label}</div>
                    <div className={`text-xs ${selectedPrice === option.value && option.isRecommended ? 'text-indigo-600' : 'text-slate-600'}`}>
                      {option.description}
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {/* 推荐指示器 */}
              {selectedPrice === 16.37 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative -mt-2 mb-4"
                >
                  <div className="absolute left-[87.5%] transform -translate-x-1/2 flex flex-col items-center">
                    <svg className="w-4 h-4 text-indigo-600 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    <p className="text-xs text-indigo-600 font-medium mt-1 whitespace-nowrap">推荐</p>
                  </div>
                </motion.div>
              )}
              
              {/* 按能力付费说明 */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6"
              >
                <div className="text-center">
                  <p className="text-sm text-slate-700 mb-2">
                    💝 <span className="font-semibold text-indigo-600">按能力付费</span> 的理念
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    我们相信每个人都应该有机会获得生命指引。<br/>
                    选择 <span className="font-medium text-emerald-600">支持价</span> 或 <span className="font-medium text-indigo-600">成本价</span> 的朋友，让我们能够为更多人提供这项服务 🌟
                  </p>
                </div>
              </motion.div>
              
              {/* 推荐说明 */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200"
              >
                <div className="flex items-center justify-center text-sm text-slate-700 mb-2">
                  <span className="mr-2">🌟</span>
                  <span className="font-medium">成本价 $16.37 是我们的实际运营成本</span>
                </div>
              </motion.div>
            </motion.div>

            {/* CTA按钮 */}
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              className="w-full py-5 rounded-2xl text-white font-bold text-lg mb-6 bg-indigo-600 hover:bg-indigo-700 transition-all"
            >
              解锁生命密码
            </motion.button>

            {/* 价值说明 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="text-center text-sm text-slate-600 mb-6"
            >
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-indigo-500">🎁</span>
                  <span className="font-medium text-slate-700">获取专属生命密码报告</span>
                </div>
                <div className="text-xs text-slate-500">
                  + 免费试用 <span className="font-bold text-indigo-600">AI助手 7天</span> 完整功能
                </div>
              </div>
            </motion.div>

            {/* 折叠式详细说明 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"
            >
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="font-medium text-slate-800 flex items-center gap-2">
                  <span className="text-indigo-500">🔮</span>
                  <span>了解更多详情</span>
                </span>
                <motion.svg 
                  animate={{ rotate: showDetails ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-5 h-5 text-slate-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </motion.svg>
              </button>
              
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        我们已经帮助数百万人发现他们的内在智慧和生命密码，现在轮到您开启这段觉醒之旅。
                      </p>
                      
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                          <span>💰</span>
                          <span>透明定价</span>
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          虽然我们的实际运营成本为 <span className="text-indigo-600 font-bold">$16.37</span>，但我们提供多种价格选择。选择您认为合适的投资金额。
                        </p>
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <span>🌟</span>
                          <span>服务特色</span>
                        </h4>
                        <div className="space-y-2 text-sm text-slate-700">
                          <div className="flex items-start gap-3">
                            <span className="text-indigo-500 mt-0.5">•</span>
                            <span>AI智能算法深度分析</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="text-indigo-500 mt-0.5">•</span>
                            <span>24小时内生成详细报告</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="text-indigo-500 mt-0.5">•</span>
                            <span>终身免费报告查看</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* 确认支付模态框 */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <div className="text-4xl mb-4">
                {selectedPrice === 16.37 ? '👑' : selectedPrice === 9 ? '✨' : selectedPrice === 5 ? '🔍' : '🌱'}
              </div>
              <h3 className="text-lg font-bold text-indigo-600 mb-3">支付确认</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {investmentMessages[selectedPrice]}
              </p>
              <div className="text-2xl font-bold text-indigo-600 mb-4">${selectedPrice}</div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  重新选择
                </button>
                <button 
                  onClick={proceedToPayment}
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  确认支付
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 支付处理中 */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-indigo-900 bg-opacity-90 flex items-center justify-center z-50"
          >
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🔮</div>
              <div className="text-xl font-bold mb-2">正在处理您的支付...</div>
              <div className="text-sm opacity-80">请稍候，即将跳转到支付页面</div>
              <div className="mt-4">
                <div className="w-48 h-2 bg-indigo-800 rounded-full mx-auto overflow-hidden">
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: 'easeInOut' }}
                    className="h-full bg-indigo-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}