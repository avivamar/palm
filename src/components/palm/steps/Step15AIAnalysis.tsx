'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'
import { generateMockMediaPipeLandmarks } from '@/utils/mockMediaPipeData'

interface Step15Props {
  userData: PalmUserData
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
}

// 设计系统配置 - 匹配 flow/0-3 的风格
const DESIGN_SYSTEM = {
  colors: {
    primary: '#7c3aed', // violet-600
    primaryLight: '#8b5cf6', // violet-500
    background: '#f9fafb', // gray-50
    backgroundSecondary: '#ffffff', // white
    text: '#111827', // gray-900
    textSecondary: '#6b7280', // gray-500
    success: '#10b981', // emerald-500
    error: '#ef4444', // red-500
    warning: '#f59e0b', // amber-500
    accent: '#ea580c', // orange-600
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    title: 'text-2xl font-bold',
    subtitle: 'text-lg font-medium',
    body: 'text-base',
    caption: 'text-sm',
    label: 'text-xs font-medium',
  },
  container: {
    width: 390,
    imageSize: 350,
  }
}

export default function Step15AIAnalysis({ 
  userData,
  trackEvent, 
  goToNextStep
}: Step15Props) {
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [imageDisplayInfo, setImageDisplayInfo] = useState({
    displayWidth: DESIGN_SYSTEM.container.imageSize,
    displayHeight: DESIGN_SYSTEM.container.imageSize,
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
  }, [])
  
  // 获取用户的真实图片数据
  const userImageData = userData.palmImageData || '/palm/img/demohand.png'
  const isRealUserImage = !!userData.palmImageData
  
  // 如果没有真实的MediaPipe数据，使用模拟数据进行测试
  const landmarks = userData.palmLandmarks || generateMockMediaPipeLandmarks()
  
  // 精确处理图片加载和坐标计算
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const containerWidth = DESIGN_SYSTEM.container.imageSize
    const containerHeight = DESIGN_SYSTEM.container.imageSize
    
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
  }
  
  // 将MediaPipe关键点转换为精确像素坐标
  const convertLandmarksToPixels = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return []
    
    return landmarks.map((landmark, index) => ({
      id: index,
      x: imageDisplayInfo.offsetX + (landmark.x * imageDisplayInfo.displayWidth),
      y: imageDisplayInfo.offsetY + (landmark.y * imageDisplayInfo.displayHeight),
      z: landmark.z || 0
    }))
  }
  
  // MediaPipe手部关键点索引
  const HAND_LANDMARKS = {
    WRIST: 0,
    THUMB_TIP: 4,
    INDEX_TIP: 8,
    MIDDLE_TIP: 12,
    RING_TIP: 16,
    PINKY_TIP: 20,
    // 掌指关节
    INDEX_MCP: 5,
    MIDDLE_MCP: 9,
    RING_MCP: 13,
    PINKY_MCP: 17,
  }
  
  // 精确的手指含义标记 - 基于解剖学位置
  const generateFingerMeanings = () => {
    if (landmarks && landmarks.length >= 21) {
      const pixels = convertLandmarksToPixels(landmarks)
      
      return [
        { 
          x: (pixels[HAND_LANDMARKS.THUMB_TIP]?.x || 0) - 12, 
          y: (pixels[HAND_LANDMARKS.THUMB_TIP]?.y || 0) - 20, 
          color: DESIGN_SYSTEM.colors.warning, 
          label: '外在人格',
          meaning: '行为表现' 
        },
        { 
          x: pixels[HAND_LANDMARKS.INDEX_TIP]?.x || 0, 
          y: (pixels[HAND_LANDMARKS.INDEX_TIP]?.y || 0) - 20, 
          color: DESIGN_SYSTEM.colors.primary, 
          label: '自尊心',
          meaning: '内在自己' 
        },
        { 
          x: pixels[HAND_LANDMARKS.MIDDLE_TIP]?.x || 0, 
          y: (pixels[HAND_LANDMARKS.MIDDLE_TIP]?.y || 0) - 20, 
          color: DESIGN_SYSTEM.colors.primaryLight, 
          label: '社会性',
          meaning: '现实能力' 
        },
        { 
          x: pixels[HAND_LANDMARKS.RING_TIP]?.x || 0, 
          y: (pixels[HAND_LANDMARKS.RING_TIP]?.y || 0) - 20, 
          color: DESIGN_SYSTEM.colors.success, 
          label: '艺术天分',
          meaning: '审美感性' 
        },
        { 
          x: (pixels[HAND_LANDMARKS.PINKY_TIP]?.x || 0) + 12, 
          y: (pixels[HAND_LANDMARKS.PINKY_TIP]?.y || 0) - 20, 
          color: DESIGN_SYSTEM.colors.primaryLight, 
          label: '潜在个性',
          meaning: '天生特质' 
        }
      ]
    } else {
      // 标准比例的静态位置
      const centerX = DESIGN_SYSTEM.container.imageSize / 2
      const centerY = DESIGN_SYSTEM.container.imageSize / 2
      return [
        { x: centerX - 80, y: centerY - 120, color: DESIGN_SYSTEM.colors.warning, label: '外在人格', meaning: '行为表现' },
        { x: centerX - 40, y: centerY - 140, color: DESIGN_SYSTEM.colors.primary, label: '自尊心', meaning: '内在自己' },
        { x: centerX, y: centerY - 145, color: DESIGN_SYSTEM.colors.primaryLight, label: '社会性', meaning: '现实能力' },
        { x: centerX + 40, y: centerY - 135, color: DESIGN_SYSTEM.colors.success, label: '艺术天分', meaning: '审美感性' },
        { x: centerX + 80, y: centerY - 110, color: DESIGN_SYSTEM.colors.primaryLight, label: '潜在个性', meaning: '天生特质' }
      ]
    }
  }
  
  const fingerMeanings = generateFingerMeanings()
  
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <main className="w-[390px] mx-auto px-4 pb-16">
        {/* Logo */}
        <header className="py-4 flex justify-center">
          <img src="/palm/img/logo.svg" alt="ThePalmistryLife" className="h-7" />
        </header>

        {/* Progress */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full mb-8">
          <motion.div 
            className="h-full bg-violet-500 rounded-full transition-all"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(analysisProgress, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
          <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 15 / 20</span>
        </div>

        {/* Title */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-8"
        >
          <h1 className="text-2xl font-bold text-violet-600">AI正在解读你的财富密码</h1>
          <p className="text-gray-600 leading-snug">
            {isRealUserImage ? '🔍 正在分析您的手掌纹路特征' : '💡 演示智能分析过程'}
          </p>
          <div className="mt-3 text-sm text-orange-600 font-medium animate-pulse">
            🤖 AI已识别到 {landmarks?.length || 21} 个关键点，分析进度 {Math.round(analysisProgress)}%
          </div>
        </motion.section>

        {/* 图像分析区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8"
        >
          {/* 350px固定图像容器 */}
          <div className="relative mx-auto w-[350px] h-[350px] bg-gray-100">
            {/* 手掌图片 */}
            <img 
              src={userImageData} 
              alt={isRealUserImage ? "用户手掌照片" : "演示手掌照片"} 
              className="w-full h-full object-cover" 
              onLoad={handleImageLoad}
            />
            
            {/* AI状态指示器 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute top-3 left-3 bg-violet-600 text-white rounded-lg shadow-lg px-3 py-2"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">
                  {landmarks && landmarks.length >= 21 
                    ? 'AI识别完成' 
                    : '正在分析中'}
                </span>
              </div>
            </motion.div>

            {/* 分析扫描框 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* 四角扫描框 */}
              <div className="absolute left-2 top-2 w-6 h-6 border-l-2 border-t-2 border-violet-500"></div>
              <div className="absolute right-2 top-2 w-6 h-6 border-r-2 border-t-2 border-violet-500"></div>
              <div className="absolute left-2 bottom-2 w-6 h-6 border-l-2 border-b-2 border-violet-500"></div>
              <div className="absolute right-2 bottom-2 w-6 h-6 border-r-2 border-b-2 border-violet-500"></div>
              
              {/* 扫描线动画 */}
              <motion.div 
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent"
                animate={{ y: [0, 350, 0] }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: 'linear' 
                }}
              />
            </motion.div>

            {/* MediaPipe 21个关键点完整可视化 */}
            {landmarks && landmarks.length >= 21 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* 21个关键点标记 */}
                {convertLandmarksToPixels(landmarks).map((point, index) => {
                  // 不同部位使用不同颜色
                  const getPointColor = (index: number) => {
                    if (index === 0) return { fill: '#ef4444', stroke: '#dc2626', name: '手腕' } // 红色 - 手腕
                    if (index >= 1 && index <= 4) return { fill: '#f59e0b', stroke: '#d97706', name: '拇指' } // 橙色 - 拇指
                    if (index >= 5 && index <= 8) return { fill: '#10b981', stroke: '#059669', name: '食指' } // 绿色 - 食指
                    if (index >= 9 && index <= 12) return { fill: '#3b82f6', stroke: '#2563eb', name: '中指' } // 蓝色 - 中指
                    if (index >= 13 && index <= 16) return { fill: '#8b5cf6', stroke: '#7c3aed', name: '无名指' } // 紫色 - 无名指
                    if (index >= 17 && index <= 20) return { fill: '#ec4899', stroke: '#db2777', name: '小指' } // 粉色 - 小指
                    return { fill: '#06b6d4', stroke: '#0891b2', name: '其他' }
                  }
                  
                  const pointColor = getPointColor(index)
                  
                  return (
                    <motion.g key={`landmark-${index}`}>
                      {/* 外圈光晕 */}
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r="6"
                        fill="none"
                        stroke={pointColor.stroke}
                        strokeWidth="0.5"
                        opacity="0.3"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.3 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.03 }}
                      />
                      
                      {/* 主要关键点 */}
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r="3"
                        fill={pointColor.fill}
                        stroke="white"
                        strokeWidth="1"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.03 }}
                      />
                      
                      {/* 关键点编号 - 更清晰 */}
                      <motion.text
                        x={point.x}
                        y={point.y + 1}
                        textAnchor="middle"
                        fontSize="6"
                        fill="white"
                        fontWeight="bold"
                        fontFamily="monospace"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.8 + index * 0.03 }}
                      >
                        {index}
                      </motion.text>
                      
                      {/* 解剖学标签 - 仅显示关键点 */}
                      {(index === 0 || index === 4 || index === 8 || index === 12 || index === 16 || index === 20) && (
                        <motion.text
                          x={point.x + 12}
                          y={point.y - 8}
                          fontSize="8"
                          fill={pointColor.fill}
                          fontWeight="bold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 1.0 + index * 0.03 }}
                        >
                          {index === 0 && '手腕'}
                          {index === 4 && '拇指尖'}
                          {index === 8 && '食指尖'}
                          {index === 12 && '中指尖'}
                          {index === 16 && '无名指尖'}
                          {index === 20 && '小指尖'}
                        </motion.text>
                      )}
                    </motion.g>
                  )
                })}
                
                {/* 手指骨骼连接线 */}
                {(() => {
                  const pixels = convertLandmarksToPixels(landmarks);
                  const connections = [
                    // 拇指连接线 (橙色)
                    [0, 1], [1, 2], [2, 3], [3, 4],
                    // 食指连接线 (绿色)
                    [0, 5], [5, 6], [6, 7], [7, 8],
                    // 中指连接线 (蓝色)
                    [5, 9], [9, 10], [10, 11], [11, 12],
                    // 无名指连接线 (紫色)
                    [9, 13], [13, 14], [14, 15], [15, 16],
                    // 小指连接线 (粉色)
                    [13, 17], [17, 18], [18, 19], [19, 20],
                    // 手掌基础连接线
                    [0, 17], [5, 9], [9, 13], [13, 17]
                  ];
                  
                  return connections.map(([start, end], index) => {
                    // 类型安全检查
                    if (typeof start !== 'number' || typeof end !== 'number') return null;
                    
                    const startPoint = pixels[start];
                    const endPoint = pixels[end];
                    if (!startPoint || !endPoint) return null;
                    
                    // 根据连接线类型确定颜色
                    let strokeColor = 'rgba(6, 182, 212, 0.4)' // 默认青色
                    if (start <= 4 && end <= 4) strokeColor = 'rgba(245, 158, 11, 0.5)' // 拇指 - 橙色
                    else if ((start >= 5 && start <= 8) && (end >= 5 && end <= 8)) strokeColor = 'rgba(16, 185, 129, 0.5)' // 食指 - 绿色
                    else if ((start >= 9 && start <= 12) && (end >= 9 && end <= 12)) strokeColor = 'rgba(59, 130, 246, 0.5)' // 中指 - 蓝色
                    else if ((start >= 13 && start <= 16) && (end >= 13 && end <= 16)) strokeColor = 'rgba(139, 92, 246, 0.5)' // 无名指 - 紫色
                    else if ((start >= 17 && start <= 20) && (end >= 17 && end <= 20)) strokeColor = 'rgba(236, 72, 153, 0.5)' // 小指 - 粉色
                    
                    return (
                      <motion.line
                        key={`connection-${index}`}
                        x1={startPoint.x}
                        y1={startPoint.y}
                        x2={endPoint.x}
                        y2={endPoint.y}
                        stroke={strokeColor}
                        strokeWidth="1.5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.5 + index * 0.05 }}
                      />
                    );
                  });
                })()}
              </svg>
            )}

            {/* 演示模式 - 显示标准21个关键点 (已由上面的代码处理，这里删除重复) */}
            {false && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* 标准手掌21个关键点位置 */}
                {(() => {
                  const centerX = DESIGN_SYSTEM.container.imageSize / 2
                  const centerY = DESIGN_SYSTEM.container.imageSize / 2
                  
                  // MediaPipe 21个关键点的标准位置 (基于手掌比例)
                  const standardLandmarks = [
                    // 0: 手腕
                    { x: centerX, y: centerY + 120 },
                    // 1-4: 拇指 (从根部到指尖)
                    { x: centerX - 60, y: centerY + 80 },
                    { x: centerX - 80, y: centerY + 40 },
                    { x: centerX - 85, y: centerY + 10 },
                    { x: centerX - 85, y: centerY - 15 },
                    // 5-8: 食指
                    { x: centerX - 40, y: centerY + 20 },
                    { x: centerX - 45, y: centerY - 20 },
                    { x: centerX - 45, y: centerY - 50 },
                    { x: centerX - 45, y: centerY - 80 },
                    // 9-12: 中指
                    { x: centerX - 10, y: centerY + 15 },
                    { x: centerX - 10, y: centerY - 25 },
                    { x: centerX - 10, y: centerY - 60 },
                    { x: centerX - 10, y: centerY - 95 },
                    // 13-16: 无名指
                    { x: centerX + 25, y: centerY + 20 },
                    { x: centerX + 25, y: centerY - 15 },
                    { x: centerX + 25, y: centerY - 45 },
                    { x: centerX + 25, y: centerY - 75 },
                    // 17-20: 小指
                    { x: centerX + 55, y: centerY + 30 },
                    { x: centerX + 60, y: centerY + 5 },
                    { x: centerX + 65, y: centerY - 20 },
                    { x: centerX + 70, y: centerY - 40 }
                  ]
                  
                  return standardLandmarks.map((point, index) => {
                    const getPointColor = (index: number) => {
                      if (index === 0) return { fill: '#ef4444', stroke: '#dc2626', name: '手腕' }
                      if (index >= 1 && index <= 4) return { fill: '#f59e0b', stroke: '#d97706', name: '拇指' }
                      if (index >= 5 && index <= 8) return { fill: '#10b981', stroke: '#059669', name: '食指' }
                      if (index >= 9 && index <= 12) return { fill: '#3b82f6', stroke: '#2563eb', name: '中指' }
                      if (index >= 13 && index <= 16) return { fill: '#8b5cf6', stroke: '#7c3aed', name: '无名指' }
                      if (index >= 17 && index <= 20) return { fill: '#ec4899', stroke: '#db2777', name: '小指' }
                      return { fill: '#06b6d4', stroke: '#0891b2', name: '其他' }
                    }
                    
                    const pointColor = getPointColor(index)
                    
                    return (
                      <motion.g key={`demo-landmark-${index}`}>
                        <motion.circle
                          cx={point.x}
                          cy={point.y}
                          r="3"
                          fill={pointColor.fill}
                          stroke="white"
                          strokeWidth="1"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.03 }}
                        />
                        <motion.text
                          x={point.x}
                          y={point.y + 1}
                          textAnchor="middle"
                          fontSize="6"
                          fill="white"
                          fontWeight="bold"
                          fontFamily="monospace"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.8 + index * 0.03 }}
                        >
                          {index}
                        </motion.text>
                      </motion.g>
                    )
                  })
                })()}
              </svg>
            )}

            {/* 手指含义标记 - 精确定位和统一设计 */}
            {fingerMeanings.map((finger, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 2.0 + index * 0.15 }}
                className="absolute"
                style={{
                  left: `${finger.x}px`,
                  top: `${finger.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* 标记点 - 统一尺寸 */}
                <div
                  className="w-3 h-3 rounded-full border-2 border-white shadow-lg"
                  style={{ 
                    backgroundColor: finger.color,
                    boxShadow: `0 0 12px ${finger.color}40, 0 2px 4px rgba(0,0,0,0.3)`
                  }}
                />
                
                {/* 标签 - 统一设计和字体 */}
                <div 
                  className="absolute -top-12 -left-10 bg-white/95 backdrop-blur-sm text-gray-800 rounded-lg shadow-lg border-2 px-2 py-1 whitespace-nowrap"
                  style={{ borderColor: finger.color }}
                >
                  <div className={`${DESIGN_SYSTEM.typography.label} font-bold`} style={{ color: finger.color }}>
                    {finger.label}
                  </div>
                  <div className={`${DESIGN_SYSTEM.typography.caption} text-gray-600 mt-0.5`}>
                    {finger.meaning}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 分析详情卡片 */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="space-y-4"
            >
              {/* 分析进度 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">分析进度</span>
                </div>
                <span className="text-sm font-mono text-violet-600">
                  {Math.round(analysisProgress)}%
                </span>
              </div>
              
              {/* 分析详情 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">检测精度</span>
                    <span className="text-violet-600 font-medium">
                      {userData.palmValidationResult?.confidence ? 
                        `${Math.round(userData.palmValidationResult.confidence * 100)}%` : 
                        '93%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">关键点</span>
                    <span className="text-violet-600 font-medium">
                      {landmarks?.length || 21} / 21
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">检测手部</span>
                    <span className="text-violet-600 font-medium">1 只</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI引擎</span>
                    <span className="text-violet-600 font-medium">MediaPipe</span>
                  </div>
                </div>
              </div>
              
              {/* 关键点分析详情 */}
              {(landmarks && landmarks.length >= 21) && (
                <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                  <h4 className="text-sm font-medium text-violet-700 mb-2">
                    ✨ MediaPipe 21个关键点识别成功
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-gray-600">0: 手腕</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span className="text-gray-600">1-4: 拇指</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">5-8: 食指</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-gray-600">9-12: 中指</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-gray-600">13-16: 无名指</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                        <span className="text-gray-600">17-20: 小指</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Legal & location */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <p className="mt-6 text-center text-[10px] leading-snug text-gray-400 px-4">
            AI分析结果仅供参考，不构成投资建议。
            <a href="/privacy" className="underline">隐私政策</a>、
            <a href="/terms" className="underline">服务条款</a>
          </p>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            智能分析引擎&nbsp;v2.1
          </p>
        </motion.div>
      </main>
    </div>
  )
}