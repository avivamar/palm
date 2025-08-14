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
  const [imageSize, setImageSize] = useState({ width: 360, height: 360 })
  const [imageDisplayInfo, setImageDisplayInfo] = useState({
    displayWidth: 360,
    displayHeight: 360,
    offsetX: 0,
    offsetY: 0,
    scale: 1
  })
  
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
  
  // 精确处理图片加载，计算object-cover后的实际显示区域
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const containerWidth = 360 // 固定360px宽度
    const containerHeight = 360 // 固定360px高度
    
    // 获取图片的自然尺寸
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight
    
    // 计算object-cover的实际显示尺寸和偏移
    const containerAspect = containerWidth / containerHeight
    const imageAspect = naturalWidth / naturalHeight
    
    let displayWidth, displayHeight, offsetX, offsetY, scale
    
    if (imageAspect > containerAspect) {
      // 图片更宽，以高度为准
      displayHeight = containerHeight
      displayWidth = naturalWidth * (containerHeight / naturalHeight)
      offsetX = (containerWidth - displayWidth) / 2
      offsetY = 0
      scale = containerHeight / naturalHeight
    } else {
      // 图片更高，以宽度为准
      displayWidth = containerWidth
      displayHeight = naturalHeight * (containerWidth / naturalWidth)
      offsetX = 0
      offsetY = (containerHeight - displayHeight) / 2
      scale = containerWidth / naturalWidth
    }
    
    setImageDisplayInfo({
      displayWidth,
      displayHeight,
      offsetX,
      offsetY,
      scale
    })
    
    // 更新用于坐标计算的尺寸
    setImageSize({ 
      width: displayWidth, 
      height: displayHeight 
    })
  }
  
  // 将MediaPipe关键点转换为容器内的精确像素坐标
  const convertLandmarksToPixels = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return []
    
    return landmarks.map((landmark, index) => ({
      id: index,
      // 关键：使用实际显示区域的尺寸和偏移
      x: imageDisplayInfo.offsetX + (landmark.x * imageDisplayInfo.displayWidth),
      y: imageDisplayInfo.offsetY + (landmark.y * imageDisplayInfo.displayHeight),
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
      const pixels = convertLandmarksToPixels(userData.palmLandmarks)
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
      const pixels = convertLandmarksToPixels(userData.palmLandmarks)
      
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      {/* 科技感主容器 - 390px固定宽度 */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-[390px] rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-cyan-500/20 p-6 relative overflow-hidden shadow-2xl shadow-cyan-500/10"
      >
        {/* 科技感背景装饰 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[conic-gradient(from_0deg,transparent,rgba(6,182,212,0.1),transparent)] opacity-30"></div>
        
        {/* 内容区域 */}
        <div className="relative z-10">
          {/* 科技感标题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AI 手相分析系统
              </h1>
            </div>
            <p className="text-slate-300 text-sm">
              {isRealUserImage ? '正在解析您的专属财富密码' : '演示智能分析过程'}
            </p>
          </motion.div>

          {/* 360px固定图像区域 */}
          <div className="relative mx-auto w-[360px] h-[360px] overflow-hidden rounded-xl bg-slate-800/50 border border-cyan-500/30 shadow-inner shadow-cyan-500/10">
            {/* 用户实际上传的手掌图片 */}
            <img 
              src={userImageData} 
              alt={isRealUserImage ? "用户手掌照片" : "演示手掌照片"} 
              className="w-full h-full object-cover" 
              onLoad={handleImageLoad}
            />
            
            {/* 科技感AI状态指示器 */}
            {isRealUserImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="absolute top-3 left-3 bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm border border-cyan-400/30"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>
                    {userData.palmLandmarks && userData.palmLandmarks.length >= 21 
                      ? 'AI定位成功' 
                      : '实时分析中'}
                  </span>
                </div>
              </motion.div>
            )}

            {/* MediaPipe手部关键点精确可视化 */}
            {isRealUserImage && userData.palmLandmarks && userData.palmLandmarks.length >= 21 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* 绘制所有21个MediaPipe关键点 */}
                {convertLandmarksToPixels(userData.palmLandmarks).map((point, index) => (
                  <motion.g key={`landmark-${index}`}>
                    {/* 科技感关键点 */}
                    <motion.circle
                      cx={point.x}
                      cy={point.y}
                      r="3"
                      fill="rgba(6, 182, 212, 0.8)"
                      stroke="rgba(34, 211, 238, 1)"
                      strokeWidth="1.5"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    />
                    {/* 光晕效果 */}
                    <motion.circle
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill="none"
                      stroke="rgba(6, 182, 212, 0.3)"
                      strokeWidth="1"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                    />
                    {/* 科技感编号 */}
                    <motion.text
                      x={point.x}
                      y={point.y - 10}
                      textAnchor="middle"
                      fontSize="7"
                      fill="rgba(34, 211, 238, 1)"
                      fontWeight="bold"
                      fontFamily="monospace"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
                    >
                      {index}
                    </motion.text>
                  </motion.g>
                ))}
                
                {/* 绘制手部连接线 */}
                {(() => {
                  const pixels = convertLandmarksToPixels(userData.palmLandmarks);
                  const connections = [
                    // 拇指连接线
                    [0, 1], [1, 2], [2, 3], [3, 4],
                    // 食指连接线
                    [0, 5], [5, 6], [6, 7], [7, 8],
                    // 中指连接线
                    [5, 9], [9, 10], [10, 11], [11, 12],
                    // 无名指连接线
                    [9, 13], [13, 14], [14, 15], [15, 16],
                    // 小指连接线
                    [13, 17], [17, 18], [18, 19], [19, 20],
                    // 手掌连接线
                    [0, 17]
                  ];
                  
                  return connections.map(([start, end], index) => {
                    const startPoint = pixels[start as number];
                    const endPoint = pixels[end as number];
                    if (!startPoint || !endPoint) return null;
                    
                    return (
                      <motion.line
                        key={`connection-${index}`}
                        x1={startPoint.x}
                        y1={startPoint.y}
                        x2={endPoint.x}
                        y2={endPoint.y}
                        stroke="rgba(6, 182, 212, 0.6)"
                        strokeWidth="1.5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.5 + index * 0.1 }}
                      />
                    );
                  });
                })()}
              </svg>
            )}

            {/* 手指含义标记点 - 改进样式 */}
            {fingerMeanings.map((finger, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 2.5 + index * 0.2 }}
                className="absolute group"
                style={{
                  left: `${finger.x}px`,
                  top: `${finger.y}px`,
                }}
              >
                {/* 标记点 - 增大并添加光晕效果 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 2.5 + index * 0.2 }}
                  className="w-4 h-4 rounded-full -translate-x-2 -translate-y-2 border-2 border-white shadow-lg"
                  style={{ 
                    backgroundColor: finger.color,
                    boxShadow: `0 0 15px ${finger.color}40, 0 4px 8px rgba(0,0,0,0.3)`
                  }}
                />
                
                {/* 标签 - 改进样式 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 2.7 + index * 0.2 }}
                  className="absolute -top-12 -left-12 bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-3 py-2 rounded-xl shadow-lg border border-white/50 whitespace-nowrap"
                  style={{ borderColor: finger.color }}
                >
                  <div className="font-bold text-sm" style={{ color: finger.color }}>
                    {finger.label}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {finger.meaning}
                  </div>
                </motion.div>
              </motion.div>
            ))}

            {/* 科技感扫描框 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute left-0 top-0 w-8 h-8 border-l-2 border-t-2 border-cyan-400 rounded-tl"></div>
              <div className="absolute right-0 top-0 w-8 h-8 border-r-2 border-t-2 border-cyan-400 rounded-tr"></div>
              <div className="absolute left-0 bottom-0 w-8 h-8 border-l-2 border-b-2 border-cyan-400 rounded-bl"></div>
              <div className="absolute right-0 bottom-0 w-8 h-8 border-r-2 border-b-2 border-cyan-400 rounded-br"></div>
              
              {/* 角落闪烁效果 */}
              <div className="absolute left-1 top-1 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="absolute right-1 top-1 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-75"></div>
              <div className="absolute left-1 bottom-1 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-150"></div>
              <div className="absolute right-1 bottom-1 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
            </motion.div>
            
            {/* 科技感扫描线 */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.8 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan shadow-lg shadow-cyan-400/50"
            ></motion.div>

            {/* SVG 掌纹动画 - 改进效果 */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {palmLines.map((line, index) => (
                <g key={index}>
                  {/* 掌纹线条动画 - 改进样式 */}
                  <motion.polyline
                    points={line.points}
                    stroke={line.color}
                    strokeWidth={line.strokeWidth || "4"}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="300"
                    initial={{ strokeDashoffset: 300, opacity: 0 }}
                    animate={{ strokeDashoffset: 0, opacity: 0.9 }}
                    transition={{ 
                      duration: 1.5, 
                      delay: line.delay,
                      ease: "easeInOut"
                    }}
                    style={{
                      filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4))"
                    }}
                  />
                  
                  {/* 线条标签 - 改进位置和样式 */}
                  {line.label && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: line.delay + 1.0 }}
                    >
                      {/* 背景圆形 */}
                      <motion.circle
                        cx={line.points.split(' ')[1]?.split(',')[0] || "120"}
                        cy={(parseInt(line.points.split(' ')[1]?.split(',')[1] || "150") - 10).toString()}
                        r="18"
                        fill="rgba(255, 255, 255, 0.9)"
                        stroke={line.color}
                        strokeWidth="2"
                      />
                      {/* 标签文字 */}
                      <motion.text
                        x={line.points.split(' ')[1]?.split(',')[0] || "120"}
                        y={(parseInt(line.points.split(' ')[1]?.split(',')[1] || "150") - 6).toString()}
                        fill={line.color}
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {line.label}
                      </motion.text>
                    </motion.g>
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* 科技感信息显示区域 */}
          <div className="mt-6 space-y-4">
            {/* 分析状态指示器 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <h3 className="text-sm font-bold text-cyan-400">系统状态</h3>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {Math.round(analysisProgress)}%
                </div>
              </div>
              
              {isRealUserImage ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">检测精度</span>
                    <span className="text-cyan-400 font-mono">
                      {userData.palmValidationResult?.confidence ? 
                        `${Math.round(userData.palmValidationResult.confidence * 100)}%` : 
                        '分析中...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">关键点</span>
                    <span className="text-cyan-400 font-mono">
                      {userData.palmLandmarks?.length || 0} / 21
                    </span>
                  </div>
                  {userData.palmLandmarks && userData.palmLandmarks.length >= 21 && (
                    <div className="mt-2 p-2 bg-cyan-500/10 rounded border border-cyan-500/20">
                      <p className="text-xs text-cyan-300">
                        ✓ 所有关键点已精确识别
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 space-y-1">
                  <p>• 当前为演示模式</p>
                  <p>• 展示AI分析能力</p>
                  <p>• 上传真实照片获得专属分析</p>
                </div>
              )}
            </motion.div>

            {/* 科技感进度条 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-cyan-400 font-mono">分析进度</span>
                <span className="text-xs text-cyan-400 font-mono">{Math.round(analysisProgress)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-400 h-full rounded-full shadow-lg shadow-cyan-400/50"
                  style={{ width: `${analysisProgress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
                {/* 进度条光效 */}
                <motion.div
                  className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{ left: `${Math.max(0, analysisProgress - 8)}%` }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
        </div>

      </motion.div>
      
      {/* CSS动画样式 */}
      <style jsx>{`
        @keyframes scan {
          0% { 
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% { 
            transform: translateX(100%);
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}