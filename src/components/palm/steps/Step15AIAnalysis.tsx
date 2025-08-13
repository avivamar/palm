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
  userData,
  trackEvent, 
  goToNextStep
}: Step15Props) {
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [imageSize, setImageSize] = useState({ width: 240, height: 240 })
  
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
  
  // 获取用户的真实图片数据，如果没有则使用演示图片
  const userImageData = userData.palmImageData || '/img/demohand.png'
  const isRealUserImage = !!userData.palmImageData
  
  // 处理图片加载以获取实际尺寸
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageSize({ width: img.clientWidth, height: img.clientHeight })
  }
  
  // 将MediaPipe关键点转换为像素坐标
  const convertLandmarksToPixels = (landmarks: any[], width: number, height: number) => {
    if (!landmarks || landmarks.length === 0) return []
    
    return landmarks.map((landmark, index) => ({
      id: index,
      x: landmark.x * width,
      y: landmark.y * height,
      z: landmark.z || 0
    }))
  }
  
  // MediaPipe手部关键点索引
  const HAND_LANDMARKS = {
    THUMB_TIP: 4,
    INDEX_FINGER_TIP: 8,
    MIDDLE_FINGER_TIP: 12,
    RING_FINGER_TIP: 16,
    PINKY_TIP: 20,
    WRIST: 0,
    // 掌纹关键点
    THUMB_MCP: 2,
    INDEX_FINGER_MCP: 5,
    MIDDLE_FINGER_MCP: 9,
    RING_FINGER_MCP: 13,
    PINKY_MCP: 17
  }
  
  // 生成手指标记点（使用真实关键点或后备坐标）
  const fingerTips = (() => {
    if (isRealUserImage && userData.palmLandmarks && userData.palmLandmarks.length > 0) {
      const pixels = convertLandmarksToPixels(userData.palmLandmarks, imageSize.width, imageSize.height)
      return [
        { x: pixels[HAND_LANDMARKS.THUMB_TIP]?.x || 90, y: pixels[HAND_LANDMARKS.THUMB_TIP]?.y || 60, color: '#8b5cf6', label: '拇指' },
        { x: pixels[HAND_LANDMARKS.INDEX_FINGER_TIP]?.x || 123, y: pixels[HAND_LANDMARKS.INDEX_FINGER_TIP]?.y || 40, color: '#4f46e5', label: '食指' },
        { x: pixels[HAND_LANDMARKS.MIDDLE_FINGER_TIP]?.x || 159, y: pixels[HAND_LANDMARKS.MIDDLE_FINGER_TIP]?.y || 45, color: '#0ea5e9', label: '中指' },
        { x: pixels[HAND_LANDMARKS.RING_FINGER_TIP]?.x || 190, y: pixels[HAND_LANDMARKS.RING_FINGER_TIP]?.y || 65, color: '#10b981', label: '无名指' },
        { x: pixels[HAND_LANDMARKS.PINKY_TIP]?.x || 215, y: pixels[HAND_LANDMARKS.PINKY_TIP]?.y || 95, color: '#f59e0b', label: '小指' }
      ]
    } else {
      // 后备静态坐标
      return [
        { x: 90, y: 60, color: '#8b5cf6', label: '拇指' },
        { x: 123, y: 40, color: '#4f46e5', label: '食指' },
        { x: 159, y: 45, color: '#0ea5e9', label: '中指' },
        { x: 190, y: 65, color: '#10b981', label: '无名指' },
        { x: 215, y: 95, color: '#f59e0b', label: '小指' }
      ]
    }
  })()
  
  // 生成掌纹线条（使用真实关键点或后备坐标）
  const palmLines = (() => {
    if (isRealUserImage && userData.palmLandmarks && userData.palmLandmarks.length > 0) {
      const pixels = convertLandmarksToPixels(userData.palmLandmarks, imageSize.width, imageSize.height)
      
      // 获取安全的坐标值
      const getCoord = (pixel: any, prop: 'x' | 'y', offset = 0, fallback = 0) => {
        return (pixel?.[prop] ?? fallback) + offset
      }
      
      // 生命线（从手腕到拇指基部的弧线）
      const lifeLine = `${getCoord(pixels[HAND_LANDMARKS.WRIST], 'x', 0, 95)},${getCoord(pixels[HAND_LANDMARKS.WRIST], 'y', 20, 215)} ${getCoord(pixels[HAND_LANDMARKS.THUMB_MCP], 'x', 30, 135)},${getCoord(pixels[HAND_LANDMARKS.THUMB_MCP], 'y', 50, 205)} ${getCoord(pixels[HAND_LANDMARKS.INDEX_FINGER_MCP], 'x', 20, 175)},${getCoord(pixels[HAND_LANDMARKS.INDEX_FINGER_MCP], 'y', 40, 195)}`
      
      // 智慧线（横穿手掌）
      const headLine = `${getCoord(pixels[HAND_LANDMARKS.INDEX_FINGER_MCP], 'x', -20, 100)},${getCoord(pixels[HAND_LANDMARKS.INDEX_FINGER_MCP], 'y', 30, 200)} ${getCoord(pixels[HAND_LANDMARKS.MIDDLE_FINGER_MCP], 'x', 10, 128)},${getCoord(pixels[HAND_LANDMARKS.MIDDLE_FINGER_MCP], 'y', 25, 170)} ${getCoord(pixels[HAND_LANDMARKS.RING_FINGER_MCP], 'x', 15, 165)},${getCoord(pixels[HAND_LANDMARKS.RING_FINGER_MCP], 'y', 20, 160)}`
      
      // 感情线（手掌上方横线）
      const heartLine = `${getCoord(pixels[HAND_LANDMARKS.INDEX_FINGER_MCP], 'x', 0, 120)},${getCoord(pixels[HAND_LANDMARKS.INDEX_FINGER_MCP], 'y', -40, 190)} ${getCoord(pixels[HAND_LANDMARKS.MIDDLE_FINGER_MCP], 'x', 25, 145)},${getCoord(pixels[HAND_LANDMARKS.MIDDLE_FINGER_MCP], 'y', -35, 150)} ${getCoord(pixels[HAND_LANDMARKS.RING_FINGER_MCP], 'x', 30, 180)},${getCoord(pixels[HAND_LANDMARKS.RING_FINGER_MCP], 'y', -30, 130)}`
      
      return [
        { points: heartLine, color: "#8b5cf6", delay: 0.1, label: "感情线" },
        { points: headLine, color: "#4f46e5", delay: 0.2, label: "智慧线" },
        { points: lifeLine, color: "#0ea5e9", delay: 0.3, label: "生命线" },
      ]
    } else {
      // 后备静态线条
      return [
        { points: "120,190 145,150 180,130", color: "#8b5cf6", delay: 0.1, label: "感情线" },
        { points: "100,200 128,170 165,160", color: "#4f46e5", delay: 0.2, label: "智慧线" },
        { points: "95,215 135,205 175,195", color: "#0ea5e9", delay: 0.3, label: "生命线" },
        { points: "110,230 150,230 185,225", color: "#10b981", delay: 0.4, label: "命运线" },
        { points: "140,245 165,255 190,260", color: "#f59e0b", delay: 0.5, label: "财富线" }
      ]
    }
  })()
  
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
          {/* 用户实际上传的手掌图片 */}
          <img 
            src={userImageData} 
            alt={isRealUserImage ? "用户手掌照片" : "演示手掌照片"} 
            className="w-full h-full object-cover" 
            onLoad={handleImageLoad}
          />
          
          {/* 实时检测状态提示 */}
          {isRealUserImage && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              ✓ 实时分析中
            </div>
          )}

          {/* 指尖标记点 */}
          {fingerTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="absolute group"
              style={{
                left: `${tip.x}px`,
                top: `${tip.y}px`,
              }}
            >
              {/* 标记点 */}
              <div
                className="w-4 h-4 rounded-full -translate-x-2 -translate-y-2 border-2 border-white shadow-lg"
                style={{ backgroundColor: tip.color }}
              />
              
              {/* 标签（悬停显示） */}
              {tip.label && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 1.0 + index * 0.05 }}
                  className="absolute -top-6 -left-4 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                  style={{ color: tip.color }}
                >
                  {tip.label}
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* SVG 掌纹动画 */}
          <svg className="absolute inset-0 w-full h-full">
            {palmLines.map((line, index) => (
              <g key={index}>
                {/* 掌纹线条 */}
                <motion.polyline
                  points={line.points}
                  stroke={line.color}
                  strokeWidth="3"
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
                
                {/* 线条标签 */}
                {line.label && (
                  <motion.text
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: line.delay + 0.5 }}
                    x={line.points.split(' ')[1]?.split(',')[0] || "120"}
                    y={line.points.split(' ')[1]?.split(',')[1] || "150"}
                    fill={line.color}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {line.label}
                  </motion.text>
                )}
              </g>
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
          🤖 {isRealUserImage ? 'AI正在解析您的专属财富密码' : 'AI演示分析过程'}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-2 text-sm text-gray-600 leading-relaxed"
        >
          {isRealUserImage ? (
            <>
              ✨ 基于您的真实手掌照片进行深度分析<br/>
              📊 检测到 {userData.palmLandmarks?.length || 0} 个关键点，正在解读财富密码<br/>
              🔮 预计发现 3-5 个个性化投资机会
            </>
          ) : (
            <>
              📊 演示如何分析掌纹投资特征和财富机会<br/>
              🔮 真实分析将基于您上传的手掌照片进行
            </>
          )}
        </motion.p>
        
        {/* 分析状态详情 */}
        {isRealUserImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-3 space-y-1"
          >
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              验证结果: {userData.palmValidationResult?.confidence ? 
                `${Math.round(userData.palmValidationResult.confidence * 100)}% 置信度` : 
                '分析中...'}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              检测的手部: {userData.palmValidationResult?.handCount || 1} 只
            </div>
          </motion.div>
        )}
        
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