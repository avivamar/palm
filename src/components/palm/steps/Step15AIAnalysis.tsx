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
  
  // MediaPipe手部关键点完整索引（21个点）
  const HAND_LANDMARKS = {
    // 手腕
    WRIST: 0,
    // 拇指 (1-4)
    THUMB_CMC: 1,    // 拇指根部
    THUMB_MCP: 2,    // 拇指掌指关节
    THUMB_IP: 3,     // 拇指指间关节
    THUMB_TIP: 4,    // 拇指指尖
    // 食指 (5-8)
    INDEX_FINGER_MCP: 5,  // 食指掌指关节
    INDEX_FINGER_PIP: 6,  // 食指近端指间关节
    INDEX_FINGER_DIP: 7,  // 食指远端指间关节
    INDEX_FINGER_TIP: 8,  // 食指指尖
    // 中指 (9-12)
    MIDDLE_FINGER_MCP: 9,   // 中指掌指关节
    MIDDLE_FINGER_PIP: 10,  // 中指近端指间关节
    MIDDLE_FINGER_DIP: 11,  // 中指远端指间关节
    MIDDLE_FINGER_TIP: 12,  // 中指指尖
    // 无名指 (13-16)
    RING_FINGER_MCP: 13,    // 无名指掌指关节
    RING_FINGER_PIP: 14,    // 无名指近端指间关节
    RING_FINGER_DIP: 15,    // 无名指远端指间关节
    RING_FINGER_TIP: 16,    // 无名指指尖
    // 小指 (17-20)
    PINKY_MCP: 17,          // 小指掌指关节
    PINKY_PIP: 18,          // 小指近端指间关节
    PINKY_DIP: 19,          // 小指远端指间关节
    PINKY_TIP: 20,          // 小指指尖
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
  
  // 基于MediaPipe精确关键点的掌纹线条算法
  const palmLines = (() => {
    const centerX = imageSize.width / 2
    const centerY = imageSize.height / 2
    
    if (isRealUserImage && userData.palmLandmarks && userData.palmLandmarks.length >= 21) {
      const pixels = convertLandmarksToPixels(userData.palmLandmarks, imageSize.width, imageSize.height)
      
      // 获取关键解剖点（带默认值）
      const wrist = pixels[HAND_LANDMARKS.WRIST] || { x: centerX, y: centerY + 100 }
      const thumbCmc = pixels[HAND_LANDMARKS.THUMB_CMC] || { x: centerX - 60, y: centerY + 40 }
      const thumbMcp = pixels[HAND_LANDMARKS.THUMB_MCP] || { x: centerX - 50, y: centerY + 20 }
      const indexMcp = pixels[HAND_LANDMARKS.INDEX_FINGER_MCP] || { x: centerX - 30, y: centerY - 20 }
      const middleMcp = pixels[HAND_LANDMARKS.MIDDLE_FINGER_MCP] || { x: centerX, y: centerY - 25 }
      const ringMcp = pixels[HAND_LANDMARKS.RING_FINGER_MCP] || { x: centerX + 30, y: centerY - 20 }
      const pinkyMcp = pixels[HAND_LANDMARKS.PINKY_MCP] || { x: centerX + 50, y: centerY - 10 }
      
      // 计算手掌几何中心（基于掌指关节）
      const palmCenterX = (indexMcp.x + middleMcp.x + ringMcp.x + pinkyMcp.x) / 4
      const palmCenterY = (indexMcp.y + middleMcp.y + ringMcp.y + pinkyMcp.y) / 4
      
      // 1. 感情线（Heart Line）- 连接食指基部到小指基部的弧线
      // 在手相学中，感情线位于掌指关节上方约15-20像素处
      const heartLineStart = { x: indexMcp.x - 10, y: indexMcp.y - 15 }
      const heartLineMiddle = { x: palmCenterX, y: Math.min(indexMcp.y, middleMcp.y, ringMcp.y) - 10 }
      const heartLineEnd = { x: pinkyMcp.x + 5, y: pinkyMcp.y - 5 }
      const heartLine = `${heartLineStart.x},${heartLineStart.y} ${heartLineMiddle.x},${heartLineMiddle.y} ${heartLineEnd.x},${heartLineEnd.y}`
      
      // 2. 智慧线（Head Line）- 从食指和拇指之间向小指方向的斜线
      // 智慧线起点在食指MCP和拇指MCP之间，向小指侧倾斜下降
      const headLineStartX = (indexMcp.x + thumbMcp.x) / 2 - 5
      const headLineStartY = (indexMcp.y + thumbMcp.y) / 2 + 20
      const headLineEndX = pinkyMcp.x - 15
      const headLineEndY = pinkyMcp.y + 25
      const headLine = `${headLineStartX},${headLineStartY} ${palmCenterX + 10},${palmCenterY + 15} ${headLineEndX},${headLineEndY}`
      
      // 3. 生命线（Life Line）- 围绕拇指的弧形曲线
      // 生命线从食指和拇指之间开始，弧形环绕拇指山丘到手腕
      const lifeLineStartX = headLineStartX - 5  // 与智慧线起点接近
      const lifeLineStartY = headLineStartY - 15
      const lifeLineMiddleX = thumbCmc.x - 15  // 拇指根部左侧
      const lifeLineMiddleY = (thumbCmc.y + wrist.y) / 2
      const lifeLineEndX = wrist.x - 10
      const lifeLineEndY = wrist.y - 15
      const lifeLine = `${lifeLineStartX},${lifeLineStartY} ${lifeLineMiddleX},${lifeLineMiddleY} ${lifeLineEndX},${lifeLineEndY}`
      
      // 4. 命运线（Fate Line）- 从手腕中央垂直向上到中指的直线
      // 命运线沿手掌中央垂直方向，从手腕到中指基部
      const fateLineStartX = wrist.x
      const fateLineStartY = wrist.y
      const fateLineEndX = middleMcp.x - 5
      const fateLineEndY = middleMcp.y + 10
      const fateLine = `${fateLineStartX},${fateLineStartY} ${palmCenterX},${palmCenterY + 20} ${fateLineEndX},${fateLineEndY}`
      
      return [
        { 
          points: heartLine, 
          color: "#e11d48", 
          delay: 0.5, 
          label: "感情線", 
          strokeWidth: "3", 
          description: "主掌感情、人生觀、品德",
          anatomyBased: true
        },
        { 
          points: headLine, 
          color: "#2563eb", 
          delay: 1.0, 
          label: "智慧線", 
          strokeWidth: "3", 
          description: "主掌智慧、思維、判斷力",
          anatomyBased: true
        },
        { 
          points: lifeLine, 
          color: "#16a34a", 
          delay: 1.5, 
          label: "生命線", 
          strokeWidth: "3", 
          description: "主掌生命健康、壽命長短",
          anatomyBased: true
        },
        { 
          points: fateLine, 
          color: "#7c3aed", 
          delay: 2.0, 
          label: "命運線", 
          strokeWidth: "3", 
          description: "主掌事業、運勢、態度",
          anatomyBased: true
        },
      ]
    } else {
      // 回退到标准比例的静态线条
      const handWidth = imageSize.width * 0.7
      const handHeight = imageSize.height * 0.8
      const palmTop = centerY - handHeight/3
      const palmBottom = centerY + handHeight/2.5
      const palmLeft = centerX - handWidth/2.5
      const palmRight = centerX + handWidth/2.5
      
      return [
        { 
          points: `${palmLeft + 15},${palmTop + 20} ${centerX},${palmTop + 15} ${palmRight - 15},${palmTop + 25}`, 
          color: "#e11d48", 
          delay: 0.5, 
          label: "感情線",
          strokeWidth: "3",
          description: "主掌感情、人生觀、品德",
          anatomyBased: false
        },
        { 
          points: `${palmLeft + 5},${palmTop + 55} ${centerX + 10},${palmTop + 65} ${palmRight - 5},${palmTop + 85}`, 
          color: "#2563eb", 
          delay: 1.0, 
          label: "智慧線",
          strokeWidth: "3",
          description: "主掌智慧、思維、判斷力",
          anatomyBased: false
        },
        { 
          points: `${palmLeft + 10},${palmTop + 40} ${palmLeft - 10},${palmTop + 85} ${palmLeft + 5},${palmBottom - 15}`, 
          color: "#16a34a", 
          delay: 1.5, 
          label: "生命線",
          strokeWidth: "3",
          description: "主掌生命健康、壽命長短",
          anatomyBased: false
        },
        { 
          points: `${centerX},${palmBottom} ${centerX - 2},${centerY + 10} ${centerX - 5},${palmTop + 45}`, 
          color: "#7c3aed", 
          delay: 2.0, 
          label: "命運線",
          strokeWidth: "3",
          description: "主掌事業、運勢、態度",
          anatomyBased: false
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
          
          {/* AI检测状态提示 */}
          {isRealUserImage && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              {userData.palmLandmarks && userData.palmLandmarks.length >= 21 
                ? '🎯 AI精确定位' 
                : '✓ 实时分析中'}
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
              📊 MediaPipe AI精确定位 {userData.palmLandmarks?.length || 0} 个解剖关键点<br/>
              {userData.palmLandmarks && userData.palmLandmarks.length >= 21 
                ? '🎯 掌纹线条已根据真实手部结构绘制' 
                : '🔮 正在解读财富密码和投资机会'}
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