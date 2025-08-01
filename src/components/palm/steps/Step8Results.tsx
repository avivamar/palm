'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step8Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step8Results({ 
  userData,
  trackEvent, 
  goToNextStep
}: Step8Props) {
  const [showResults, setShowResults] = useState(false)
  const [currentResult, setCurrentResult] = useState(0)
  
  const results = [
    {
      category: '财富天赋',
      score: 87,
      level: '优秀',
      description: '你具有强烈的财富吸引力和投资直觉',
      icon: '💰',
      color: 'from-yellow-500 to-amber-600',
      details: [
        '财富线清晰深邃，表示收入稳定增长',
        '智慧线与财富线交汇，投资决策准确',
        '拇指根部丰满，理财能力出众'
      ]
    },
    {
      category: '投资能力',
      score: 92,
      level: '卓越',
      description: '你天生具备敏锐的市场洞察力',
      icon: '📈',
      color: 'from-green-500 to-emerald-600',
      details: [
        '事业线笔直上升，事业运势旺盛',
        '感情线稳定，心态平和适合长期投资',
        '木星丘发达，领导力和决策力强'
      ]
    },
    {
      category: '风险控制',
      score: 78,
      level: '良好',
      description: '你具备平衡风险与收益的能力',
      icon: '🛡️',
      color: 'from-blue-500 to-indigo-600',
      details: [
        '生命线环绕拇指，生命力旺盛抗压强',
        '理智线清晰，理性分析能力出色',
        '小指长度适中，沟通协调能力佳'
      ]
    },
    {
      category: '财富潜力',
      score: 95,
      level: '极优',
      description: '你拥有巨大的财富增长潜力',
      icon: '💎',
      color: 'from-purple-500 to-pink-600',
      details: [
        '太阳线明显，名利双收的象征',
        '手掌厚实有弹性，财库丰厚',
        '贵人线清晰，容易获得他人帮助'
      ]
    }
  ]
  
  useEffect(() => {
    trackEvent('palm_results_view', { 
      timestamp: Date.now(),
      personalInfoComplete: true
    })
    
    // 延迟显示结果增加期待感
    setTimeout(() => {
      setShowResults(true)
    }, 1000)
    
    // 逐个显示结果
    const resultInterval = setInterval(() => {
      setCurrentResult(prev => {
        const next = prev + 1
        if (next >= results.length) {
          clearInterval(resultInterval)
          return prev
        }
        return next
      })
    }, 2000)
    
    return () => clearInterval(resultInterval)
  }, [results.length])
  
  const handleContinue = () => {
    trackEvent('palm_results_continue', { 
      timestamp: Date.now(),
      viewedAllResults: currentResult >= results.length - 1
    })
    goToNextStep()
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-amber-600'
    return 'text-gray-600'
  }
  
  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 80) return 'bg-blue-100'
    if (score >= 70) return 'bg-amber-100'
    return 'bg-gray-100'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Progress Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>步骤 8/20</span>
        <div className="flex-1 mx-3 bg-gray-200 rounded-full h-1">
          <div className="bg-violet-600 h-1 rounded-full" style={{ width: '40%' }}></div>
        </div>
        <span>40%</span>
      </div>
      
      {/* Personal Analysis Complete */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎉</div>
          <div>
            <div className="text-sm font-semibold text-violet-800">
              你的个人分析已完成！
            </div>
            <div className="text-xs text-violet-700">
              基于AI分析和{userData.palmPhoto === 'captured' ? '手掌照片' : '个人信息'}，生成专属财富报告
            </div>
          </div>
        </div>
      </motion.div>
      
      {!showResults ? (
        /* Loading Results */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-6"
        >
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">
              正在生成你的财富分析报告...
            </h1>
            <p className="text-gray-600 text-sm">
              AI正在整合所有数据，为你生成专属的财富指导
            </p>
          </div>
          
          <div className="relative">
            <div className="w-24 h-24 border-4 border-violet-200 rounded-full mx-auto"></div>
            <div className="w-24 h-24 border-4 border-violet-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🔮</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <div>分析个人特质...</div>
            <div>匹配投资策略...</div>
            <div>生成财富建议...</div>
          </div>
        </motion.div>
      ) : (
        /* Results Display */
        <>
          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center space-y-2"
          >
            <h1 className="text-2xl font-bold text-gray-800">
              财富分析报告
            </h1>
            <p className="text-gray-600 text-sm">
              基于AI算法分析你的个人特质，生成专属财富指导
            </p>
          </motion.div>
          
          {/* Overall Score */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-6 text-white text-center"
          >
            <div className="space-y-2">
              <div className="text-lg font-semibold">综合财富指数</div>
              <div className="text-4xl font-bold">88</div>
              <div className="text-sm opacity-90">超越了94%的用户</div>
            </div>
          </motion.div>
          
          {/* Detailed Results */}
          <div className="space-y-4">
            {results.map((result, index) => (
              <motion.div
                key={result.category}
                initial={{ x: -20, opacity: 0 }}
                animate={{ 
                  x: index <= currentResult ? 0 : -20, 
                  opacity: index <= currentResult ? 1 : 0.3 
                }}
                transition={{ delay: 1.0 + index * 0.3 }}
                className={`bg-white border-2 rounded-xl p-5 ${
                  index <= currentResult ? 'border-gray-200' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${result.color} flex items-center justify-center text-white text-2xl shadow-md`}>
                    {result.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-lg text-gray-800">{result.category}</div>
                      <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                        {index <= currentResult ? result.score : '...'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBackground(result.score)} ${getScoreColor(result.score)}`}>
                        {result.level}
                      </div>
                      <div className="text-sm text-gray-600">{result.description}</div>
                    </div>
                  </div>
                </div>
                
                {index <= currentResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <div className="text-sm font-medium text-gray-700">详细分析：</div>
                    <div className="space-y-1">
                      {result.details.map((detail, i) => (
                        <div key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-violet-500 mt-1">•</span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Continue Button */}
          {currentResult >= results.length - 1 && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 bg-violet-600 text-white rounded-xl font-semibold text-lg hover:bg-violet-500 transition shadow-md"
              onClick={handleContinue}
            >
              查看详细投资建议 →
            </motion.button>
          )}
          
          {/* Teaser */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.0 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4"
          >
            <div className="text-center space-y-2">
              <div className="text-sm font-semibold text-amber-800">
                🎁 接下来你将获得
              </div>
              <div className="text-xs text-amber-700 leading-relaxed">
                • 专属投资策略方案 • 最佳入市时机分析 • 个性化资产配置
                <br />• 风险管理建议 • 财富增长路径规划
              </div>
            </div>
          </motion.div>
        </>
      )}
      
      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: showResults ? 3.2 : 1.6 }}
        className="text-center text-xs text-gray-400 space-y-1"
      >
        <p>🤖 分析结果基于AI算法和{userData.palmPhoto === 'captured' ? '掌纹识别' : '个人特质分析'}</p>
        <p>📊 准确率{userData.palmPhoto === 'captured' ? '99.1%' : '97.3%'}，已帮助1,847,329人实现财富增长</p>
      </motion.div>
    </motion.div>
  )
}