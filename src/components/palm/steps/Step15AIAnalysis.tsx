'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step15Props {
  userData: PalmUserData
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
}

export default function Step15AIAnalysis({ 
  trackEvent, 
  goToNextStep
}: Step15Props) {
  const [analysisProgress, setAnalysisProgress] = useState(0)
  
  useEffect(() => {
    trackEvent('palm_ai_analysis_view', { 
      timestamp: Date.now(),
      step: 15
    })
    
    // 模拟AI分析进度
    const analysisTimer = setInterval(() => {
      setAnalysisProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5
        if (newProgress >= 100) {
          clearInterval(analysisTimer)
          trackEvent('palm_ai_analysis_complete', { 
            duration: Date.now() - performance.now()
          })
          setTimeout(() => {
            goToNextStep()
          }, 2000)
          return 100
        }
        return newProgress
      })
    }, 800)
    
    return () => clearInterval(analysisTimer)
  }, []) // 移除依赖，避免无限循环
  
  // 手指标记点坐标和颜色
  const fingerTips = [
    { x: 90, y: 60, color: '#8b5cf6' },
    { x: 123, y: 40, color: '#4f46e5' },
    { x: 159, y: 45, color: '#0ea5e9' },
    { x: 190, y: 65, color: '#10b981' },
    { x: 215, y: 95, color: '#f59e0b' }
  ]
  
  // 掌纹线条数据
  const palmLines = [
    { points: "120,190 145,150 180,130", color: "#8b5cf6", delay: 0.1 },
    { points: "100,200 128,170 165,160", color: "#4f46e5", delay: 0.2 },
    { points: "95,215 135,205 175,195", color: "#0ea5e9", delay: 0.3 },
    { points: "110,230 150,230 185,225", color: "#10b981", delay: 0.4 },
    { points: "140,245 165,255 190,260", color: "#f59e0b", delay: 0.5 }
  ]
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800">
      {/* 预览卡片 */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-[320px] rounded-3xl shadow-xl p-6 relative"
      >
        {/* 扫描框包裹层 */}
        <div className="relative mx-auto w-60 h-60 overflow-hidden rounded-xl">
          {/* 用户手掌示例图 */}
          <img 
            src="/img/demohand.png" 
            alt="hand" 
            className="w-full h-full object-cover" 
          />

          {/* 指尖标记点 */}
          {fingerTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="absolute -translate-x-2 -translate-y-2 w-4 h-4 rounded-full"
              style={{
                left: `${tip.x}px`,
                top: `${tip.y}px`,
                backgroundColor: tip.color
              }}
            />
          ))}

          {/* SVG 掌纹动画 */}
          <svg className="absolute inset-0 w-full h-full">
            {palmLines.map((line, index) => (
              <motion.polyline
                key={index}
                points={line.points}
                stroke={line.color}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="400"
                initial={{ strokeDashoffset: 400 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: line.delay,
                  ease: "easeInOut"
                }}
              />
            ))}
          </svg>

          {/* 四角扫描框 */}
          <div className="absolute left-0 top-0 w-8 h-8 border-l-4 border-t-4 border-violet-600"></div>
          <div className="absolute right-0 top-0 w-8 h-8 border-r-4 border-t-4 border-violet-600"></div>
          <div className="absolute left-0 bottom-0 w-8 h-8 border-l-4 border-b-4 border-violet-600"></div>
          <div className="absolute right-0 bottom-0 w-8 h-8 border-r-4 border-b-4 border-violet-600"></div>
          
          {/* 横向扫描线 */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-violet-400 opacity-70 animate-scan"></div>
        </div>

        {/* 文案 */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6 text-lg font-bold text-violet-600"
        >
          🤖 AI正在解析您的财富潜力密码
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-2 text-sm text-gray-600 leading-relaxed"
        >
          📊 正在分析您的掌纹投资特征、财富增长机会和风险承受能力...<br/>
          🔮 预计发现 3-5 个高收益投资机会和 2-3 个财富增长策略
        </motion.p>
        
        {/* 进度指示 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-4 text-center"
        >
          <div className="text-sm text-violet-600 font-medium">
            分析进度: {Math.round(analysisProgress)}%
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-violet-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysisProgress}%` }}
            ></div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* CSS动画样式 */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scan {
          animation: scan 2.5s linear infinite;
        }
      `}</style>
    </div>
  )
}