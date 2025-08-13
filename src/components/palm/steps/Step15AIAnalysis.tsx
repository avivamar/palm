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
  
  // 生成手指含义标记点（使用真实关键点或后备坐标）
  const fingerMeanings = (() => {
    if (isRealUserImage && userData.palmLandmarks && userData.palmLandmarks.length > 0) {
      const pixels = convertLandmarksToPixels(userData.palmLandmarks, imageSize.width, imageSize.height)
      // 使用实际检测到的手指位置，但添加一些偏移确保标注准确
      return [
        { 
          x: (pixels[HAND_LANDMARKS.THUMB_TIP]?.x || 90) - 10, 
          y: (pixels[HAND_LANDMARKS.THUMB_TIP]?.y || 60) - 15, 
          color: '#8b5cf6', 
          label: '外在人格',
          meaning: '行为表现' 
        },
        { 
          x: (pixels[HAND_LANDMARKS.INDEX_FINGER_TIP]?.x || 123), 
          y: (pixels[HAND_LANDMARKS.INDEX_FINGER_TIP]?.y || 40) - 15, 
          color: '#4f46e5', 
          label: '自尊心',
          meaning: '内在自己' 
        },
        { 
          x: (pixels[HAND_LANDMARKS.MIDDLE_FINGER_TIP]?.x || 159), 
          y: (pixels[HAND_LANDMARKS.MIDDLE_FINGER_TIP]?.y || 45) - 15, 
          color: '#0ea5e9', 
          label: '社会性',
          meaning: '现实能力' 
        },
        { 
          x: (pixels[HAND_LANDMARKS.RING_FINGER_TIP]?.x || 190), 
          y: (pixels[HAND_LANDMARKS.RING_FINGER_TIP]?.y || 65) - 15, 
          color: '#10b981', 
          label: '艺术天分',
          meaning: '审美感性' 
        },
        { 
          x: (pixels[HAND_LANDMARKS.PINKY_TIP]?.x || 215) + 10, 
          y: (pixels[HAND_LANDMARKS.PINKY_TIP]?.y || 95) - 15, 
          color: '#f59e0b', 
          label: '潜在个性',
          meaning: '天生特质' 
        }
      ]
    } else {
      // 更准确的静态坐标（基于手掌比例）
      const centerX = imageSize.width / 2
      const centerY = imageSize.height / 2
      return [
        { x: centerX - 60, y: centerY - 80, color: '#8b5cf6', label: '外在人格', meaning: '行为表现' },
        { x: centerX - 25, y: centerY - 100, color: '#4f46e5', label: '自尊心', meaning: '内在自己' },
        { x: centerX + 5, y: centerY - 105, color: '#0ea5e9', label: '社会性', meaning: '现实能力' },
        { x: centerX + 35, y: centerY - 85, color: '#10b981', label: '艺术天分', meaning: '审美感性' },
        { x: centerX + 65, y: centerY - 60, color: '#f59e0b', label: '潜在个性', meaning: '天生特质' }
      ]
    }
  })()
  
  // 生成掌纹线条（基于标准手相学位置）
  const palmLines = (() => {
    const centerX = imageSize.width / 2
    const centerY = imageSize.height / 2
    const handWidth = imageSize.width * 0.8  // 手掌宽度约为图片的80%
    const handHeight = imageSize.height * 0.9 // 手掌高度约为图片的90%
    
    if (isRealUserImage && userData.palmLandmarks && userData.palmLandmarks.length > 0) {
      const pixels = convertLandmarksToPixels(userData.palmLandmarks, imageSize.width, imageSize.height)
      
      // 基于MediaPipe关键点的相对位置计算标准手相线条
      const wrist = pixels[HAND_LANDMARKS.WRIST]
      const thumbBase = pixels[HAND_LANDMARKS.THUMB_MCP]
      const indexBase = pixels[HAND_LANDMARKS.INDEX_FINGER_MCP] 
      const middleBase = pixels[HAND_LANDMARKS.MIDDLE_FINGER_MCP]
      const pinkyBase = pixels[HAND_LANDMARKS.PINKY_MCP]
      
      // 计算手掌实际范围
      const palmTop = Math.min(indexBase?.y || centerY, middleBase?.y || centerY, pinkyBase?.y || centerY) + 40
      const palmBottom = wrist?.y || (centerY + handHeight/3)
      const palmLeft = thumbBase?.x || (centerX - handWidth/3)
      const palmRight = pinkyBase?.x || (centerX + handWidth/3)
      
      // 感情线：最上方横线，靠近手指基部
      const heartLine = `${palmLeft + 20},${palmTop} ${centerX + 10},${palmTop - 5} ${palmRight - 10},${palmTop + 10}`
      
      // 智慧线：中间横线，从食指侧到小指侧略向下倾斜
      const headLine = `${palmLeft + 10},${palmTop + 35} ${centerX + 15},${palmTop + 50} ${palmRight},${palmTop + 65}`
      
      // 生命线：围绕拇指的弧形线
      const lifeLine = `${palmLeft + 25},${palmTop + 15} ${palmLeft},${palmTop + 50} ${palmLeft + 15},${palmBottom - 20}`
      
      // 命运线：从手腕垂直向上的直线
      const fateLine = `${centerX + 5},${palmBottom} ${centerX},${centerY} ${centerX - 5},${palmTop + 20}`
      
      return [
        { points: heartLine, color: "#e11d48", delay: 0.5, label: "感情线", strokeWidth: "3", description: "主掌感情、人生观、品德" },
        { points: headLine, color: "#2563eb", delay: 1.0, label: "智慧线", strokeWidth: "3", description: "主掌智慧、思维、判斷力" },
        { points: lifeLine, color: "#16a34a", delay: 1.5, label: "生命線", strokeWidth: "3", description: "主掌生命健康、壽命長短" },
        { points: fateLine, color: "#7c3aed", delay: 2.0, label: "命運線", strokeWidth: "3", description: "主掌事業、運勢、態度" },
      ]
    } else {
      // 标准手相学位置的静态线条（基于手掌比例）
      const palmTop = centerY - handHeight/3
      const palmBottom = centerY + handHeight/3
      const palmLeft = centerX - handWidth/3
      const palmRight = centerX + handWidth/3
      
      return [
        { 
          points: `${palmLeft + 20},${palmTop + 10} ${centerX + 10},${palmTop + 5} ${palmRight - 10},${palmTop + 15}`, 
          color: "#e11d48", 
          delay: 0.5, 
          label: "感情線",
          strokeWidth: "3",
          description: "主掌感情、人生觀、品德"
        },
        { 
          points: `${palmLeft + 10},${palmTop + 45} ${centerX + 15},${palmTop + 60} ${palmRight},${palmTop + 75}`, 
          color: "#2563eb", 
          delay: 1.0, 
          label: "智慧線",
          strokeWidth: "3",
          description: "主掌智慧、思維、判斷力"
        },
        { 
          points: `${palmLeft + 25},${palmTop + 25} ${palmLeft - 5},${palmTop + 60} ${palmLeft + 15},${palmBottom - 10}`, 
          color: "#16a34a", 
          delay: 1.5, 
          label: "生命線",
          strokeWidth: "3",
          description: "主掌生命健康、壽命長短"
        },
        { 
          points: `${centerX + 5},${palmBottom} ${centerX},${centerY} ${centerX - 5},${palmTop + 30}`, 
          color: "#7c3aed", 
          delay: 2.0, 
          label: "命運線",
          strokeWidth: "3",
          description: "主掌事業、運勢、態度"
        },
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

          {/* 手指含义标记点 */}
          {fingerMeanings.map((finger, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 2.0 + index * 0.2 }}
              className="absolute group"
              style={{
                left: `${finger.x}px`,
                top: `${finger.y}px`,
              }}
            >
              {/* 标记点 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 2.0 + index * 0.2 }}
                className="w-3 h-3 rounded-full -translate-x-1.5 -translate-y-1.5 border-2 border-white shadow-lg"
                style={{ backgroundColor: finger.color }}
              />
              
              {/* 标签 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 2.2 + index * 0.2 }}
                className="absolute -top-8 -left-8 bg-white text-gray-800 text-xs px-2 py-1 rounded-lg shadow-md border whitespace-nowrap"
                style={{ borderColor: finger.color }}
              >
                <div className="font-semibold" style={{ color: finger.color }}>
                  {finger.label}
                </div>
                <div className="text-gray-600 text-xs">
                  {finger.meaning}
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* SVG 掌纹动画 */}
          <svg className="absolute inset-0 w-full h-full">
            {palmLines.map((line, index) => (
              <g key={index}>
                {/* 掌纹线条动画 */}
                <motion.polyline
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth || "3"}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="200"
                  initial={{ strokeDashoffset: 200, opacity: 0 }}
                  animate={{ strokeDashoffset: 0, opacity: 1 }}
                  transition={{ 
                    duration: 1.2, 
                    delay: line.delay,
                    ease: "easeInOut"
                  }}
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                  }}
                />
                
                {/* 线条标签 */}
                {line.label && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: line.delay + 0.8 }}
                  >
                    <motion.text
                      x={line.points.split(' ')[1]?.split(',')[0] || "120"}
                      y={(parseInt(line.points.split(' ')[1]?.split(',')[1] || "150") - 15).toString()}
                      fill={line.color}
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      style={{
                        filter: "drop-shadow(0 1px 2px rgba(255,255,255,0.8))"
                      }}
                    >
                      {line.label}
                    </motion.text>
                    {line.description && (
                      <motion.text
                        x={line.points.split(' ')[1]?.split(',')[0] || "120"}
                        y={(parseInt(line.points.split(' ')[1]?.split(',')[1] || "150") - 2).toString()}
                        fill={line.color}
                        fontSize="8"
                        textAnchor="middle"
                        opacity="0.8"
                        style={{
                          filter: "drop-shadow(0 1px 2px rgba(255,255,255,0.8))"
                        }}
                      >
                        {line.description}
                      </motion.text>
                    )}
                  </motion.g>
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