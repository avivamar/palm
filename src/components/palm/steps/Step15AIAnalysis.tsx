'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'
import { generateMockMediaPipeLandmarks, getRealMediaPipeLandmarks } from '@/utils/mockMediaPipeData'

interface Step15Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
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
  updateUserData,
  trackEvent, 
  goToNextStep
}: Step15Props) {
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [imageDisplayInfo, setImageDisplayInfo] = useState({
    displayWidth: DESIGN_SYSTEM.container.imageSize,
    displayHeight: DESIGN_SYSTEM.container.imageSize,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    isLoaded: false
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
          // 暂时注释掉自动跳转，用于测试MediaPipe坐标映射
          // setTimeout(() => {
          //   goToNextStep()
          // }, 2000)
          return 100
        }
        return newProgress
      })
    }, 800)
    
    return () => clearInterval(analysisTimer)
  }, [])
  
  // 获取用户的真实图片数据 - 使用测试图片
  const [testImageIndex, setTestImageIndex] = useState(0);
  const testImages = [
    { src: '/palm/test-hand-labeled.png', name: '标注图片' },
    { src: '/palm/test-hand-original.jpg', name: '原始照片' },
    { src: '/palm/img/demohand.png', name: '演示图片' }
  ];
  
  const userImageData = userData.palmImageData || testImages[testImageIndex]?.src || '/palm/img/demohand.png';
  const isRealUserImage = !!userData.palmImageData
  
  // 使用真实的MediaPipe识别数据（基于 image copy 5.png）
  const [useRealData, setUseRealData] = useState(true);
  const landmarks = userData.palmLandmarks || (useRealData ? getRealMediaPipeLandmarks() : generateMockMediaPipeLandmarks())
  
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
      scale,
      isLoaded: true
    });
    
    // 添加调试信息
    console.log('Image loaded:', {
      naturalWidth,
      naturalHeight,
      containerWidth,
      containerHeight,
      displayWidth,
      displayHeight,
      offsetX,
      offsetY,
      scale
    });
  }
  
  // 将MediaPipe关键点转换为精确像素坐标
  // MediaPipe官方实现参考: https://mediapipe-studio.webapps.google.com/demo/hand_landmarker
  const convertLandmarksToPixels = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return [];
    
    const containerSize = DESIGN_SYSTEM.container.imageSize;
    
    const convertedPoints = landmarks.map((landmark, index) => {
      // MediaPipe坐标系统:
      // - x: 0(左) -> 1(右)
      // - y: 0(上) -> 1(下)
      // - z: 深度信息，负值表示离相机近
      
      // 直接映射到显示容器坐标
      // 注意：MediaPipe的y轴和屏幕坐标系统一致（从上到下）
      let x = landmark.x * containerSize;
      let y = landmark.y * containerSize;
      
      // 如果有图片显示信息，考虑object-cover的偏移
      if (imageDisplayInfo.isLoaded) {
        // 根据图片的实际显示区域调整坐标
        const scaleX = imageDisplayInfo.displayWidth / containerSize;
        const scaleY = imageDisplayInfo.displayHeight / containerSize;
        
        if (scaleX !== 1 || scaleY !== 1) {
          // 需要考虑缩放和偏移
          x = imageDisplayInfo.offsetX + (landmark.x * imageDisplayInfo.displayWidth);
          y = imageDisplayInfo.offsetY + (landmark.y * imageDisplayInfo.displayHeight);
        }
      }
      
      // 边界限制
      const clampedX = Math.max(0, Math.min(containerSize, x));
      const clampedY = Math.max(0, Math.min(containerSize, y));
      
      return {
        id: index,
        x: clampedX,
        y: clampedY,
        z: landmark.z || 0,
        originalX: landmark.x,
        originalY: landmark.y,
        visibility: landmark.visibility || 1 // MediaPipe提供的可见性分数
      };
    });
    
    // 添加详细调试信息
    if (convertedPoints.length > 0 && typeof window !== 'undefined' && window.location.search.includes('debug')) {
      console.log('=== MediaPipe坐标转换详情 ===');
      console.log('容器尺寸:', containerSize);
      console.log('图片显示信息:', imageDisplayInfo);
      console.log('原始MediaPipe坐标示例 (手腕):', {
        x: landmarks[0].x,
        y: landmarks[0].y,
        z: landmarks[0].z
      });
      console.log('转换后像素坐标 (手腕):', {
        x: convertedPoints[0]?.x || 0,
        y: convertedPoints[0]?.y || 0
      });
      
      // 打印关键点的坐标
      const keyPoints = [
        { name: '手腕', index: 0 },
        { name: '拇指尖', index: 4 },
        { name: '食指尖', index: 8 },
        { name: '中指尖', index: 12 },
        { name: '无名指尖', index: 16 },
        { name: '小指尖', index: 20 }
      ];
      
      console.log('关键点坐标:');
      keyPoints.forEach(point => {
        if (convertedPoints[point.index]) {
          console.log(`  ${point.name}:`, {
            原始: { x: landmarks[point.index].x.toFixed(3), y: landmarks[point.index].y.toFixed(3) },
            像素: { x: convertedPoints[point.index]?.x.toFixed(1) || '0', y: convertedPoints[point.index]?.y.toFixed(1) || '0' }
          });
        }
      });
    }
    
    return convertedPoints;
  };
  
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
          
          {/* MediaPipe信任指标 */}
          <div className="mt-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-3">
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-bold">MediaPipe</span>
                <span className="text-gray-600">AI引擎</span>
              </div>
              <div className="w-px h-3 bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <span className="text-violet-600 font-bold">21点</span>
                <span className="text-gray-600">精准检测</span>
              </div>
              <div className="w-px h-3 bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <span className="text-amber-500 font-bold">99.2%</span>
                <span className="text-gray-600">识别率</span>
              </div>
            </div>
          </div>
          
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

            {/* 专业手相分析可视化 - 参考竞品效果 */}
            {landmarks && landmarks.length >= 21 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  {/* 渐变定义 */}
                  <radialGradient id="fingerTipGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
                  </radialGradient>
                  <linearGradient id="palmLineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                  <linearGradient id="palmLineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="palmLineGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                
                {/* 主要掌纹线条 - 彩色渐变 */}
                {(() => {
                  const pixels = convertLandmarksToPixels(landmarks);
                  
                  // 生命线 (Life Line) - 红橙渐变
                  const lifeLine = [
                    { x: pixels[5]?.x || 0, y: pixels[5]?.y || 0 },
                    { x: (pixels[5]?.x || 0) - 20, y: (pixels[5]?.y || 0) + 40 },
                    { x: (pixels[0]?.x || 0) + 15, y: (pixels[0]?.y || 0) - 30 },
                    { x: pixels[0]?.x || 0, y: pixels[0]?.y || 0 }
                  ];
                  
                  // 智慧线 (Head Line) - 蓝紫渐变
                  const headLine = [
                    { x: (pixels[5]?.x || 0) - 10, y: (pixels[5]?.y || 0) + 20 },
                    { x: (pixels[9]?.x || 0) - 5, y: (pixels[9]?.y || 0) + 25 },
                    { x: (pixels[13]?.x || 0) + 10, y: (pixels[13]?.y || 0) + 30 }
                  ];
                  
                  // 感情线 (Heart Line) - 绿青渐变
                  const heartLine = [
                    { x: (pixels[5]?.x || 0) - 5, y: (pixels[5]?.y || 0) + 5 },
                    { x: pixels[9]?.x || 0, y: (pixels[9]?.y || 0) + 8 },
                    { x: (pixels[13]?.x || 0) + 5, y: (pixels[13]?.y || 0) + 10 },
                    { x: (pixels[17]?.x || 0) + 8, y: (pixels[17]?.y || 0) + 15 }
                  ];
                  
                  const pathData = (points: any[]) => {
                    if (points.length === 0) return "";
                    let path = `M ${points[0].x} ${points[0].y}`;
                    for (let i = 1; i < points.length; i++) {
                      const curr = points[i];
                      const prev = points[i - 1];
                      const cpx = (prev.x + curr.x) / 2;
                      const cpy = (prev.y + curr.y) / 2;
                      path += ` Q ${cpx} ${cpy} ${curr.x} ${curr.y}`;
                    }
                    return path;
                  };
                  
                  return (
                    <>
                      {/* 生命线 */}
                      <motion.path
                        d={pathData(lifeLine)}
                        stroke="url(#palmLineGradient1)"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.8 }}
                        transition={{ duration: 1.2, delay: 0.5 }}
                      />
                      
                      {/* 智慧线 */}
                      <motion.path
                        d={pathData(headLine)}
                        stroke="url(#palmLineGradient2)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.8 }}
                        transition={{ duration: 1.0, delay: 0.8 }}
                      />
                      
                      {/* 感情线 */}
                      <motion.path
                        d={pathData(heartLine)}
                        stroke="url(#palmLineGradient3)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.8 }}
                        transition={{ duration: 1.0, delay: 1.1 }}
                      />
                    </>
                  );
                })()}
                
                {/* 手指尖检测点 - 紫色圆圈依次出现 */}
                {[4, 8, 12, 16, 20].map((fingertipIndex, arrayIndex) => {
                  const pixels = convertLandmarksToPixels(landmarks);
                  const point = pixels[fingertipIndex];
                  if (!point) return null;
                  
                  return (
                    <motion.g key={`fingertip-${fingertipIndex}`}>
                      {/* 外圈脉冲 */}
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r="12"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        strokeOpacity="0.6"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [0, 1.2, 1], 
                          opacity: [0, 0.8, 0.4] 
                        }}
                        transition={{ 
                          duration: 0.6, 
                          delay: 1.5 + arrayIndex * 0.2,
                          repeat: Infinity,
                          repeatDelay: 2
                        }}
                      />
                      
                      {/* 主要检测圆圈 */}
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r="8"
                        fill="url(#fingerTipGradient)"
                        stroke="#8b5cf6"
                        strokeWidth="2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 1.5 + arrayIndex * 0.2,
                          ease: "backOut"
                        }}
                      />
                      
                      {/* 内部光点 */}
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r="3"
                        fill="#ffffff"
                        fillOpacity="0.9"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: 1.7 + arrayIndex * 0.2 
                        }}
                      />
                    </motion.g>
                  );
                })}
                
                {/* 动态扫描框 - 参考竞品紫色框 */}
                <motion.g>
                  {/* 四个角的扫描框 */}
                  {/* 左上角 */}
                  <motion.path
                    d="M 30 30 L 30 80 M 30 30 L 80 30"
                    stroke="#a855f7"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                  
                  {/* 右上角 */}
                  <motion.path
                    d="M 320 30 L 270 30 M 320 30 L 320 80"
                    stroke="#a855f7"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                  
                  {/* 左下角 */}
                  <motion.path
                    d="M 30 320 L 30 270 M 30 320 L 80 320"
                    stroke="#a855f7"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                  
                  {/* 右下角 */}
                  <motion.path
                    d="M 320 320 L 320 270 M 320 320 L 270 320"
                    stroke="#a855f7"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                </motion.g>
              </svg>
            )}

            {/* 演示模式代码已移除 - 功能已在上面实现 */}

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

        {/* 测试控制面板 - 用于MediaPipe坐标映射测试 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-6 space-y-4"
        >
          {/* 图片切换按钮 */}
          <div className="flex justify-center gap-2">
            {testImages.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  setTestImageIndex(index);
                  // 重置图片加载状态
                  setImageDisplayInfo(prev => ({ ...prev, isLoaded: false }));
                  console.log('切换到测试图片:', img.name);
                }}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  testImageIndex === index
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {img.name}
              </button>
            ))}
          </div>
          
          {/* 坐标测试按钮 */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                console.clear();
                console.log('%c=== MediaPipe坐标映射测试 ===', 'color: #7c3aed; font-weight: bold; font-size: 16px');
                console.log('当前图片:', testImages[testImageIndex]?.name || '未知');
                console.log('图片显示信息:', imageDisplayInfo);
                console.log('原始MediaPipe landmarks (归一化坐标):', landmarks);
                const pixels = convertLandmarksToPixels(landmarks);
                console.log('转换后的像素坐标:', pixels);
                console.log('容器尺寸:', DESIGN_SYSTEM.container.imageSize, 'x', DESIGN_SYSTEM.container.imageSize);
                
                // 验证图片元素
                const img = document.querySelector('.palm-analysis-image') as HTMLImageElement;
                if (img) {
                  console.log('%c图片元素信息:', 'color: #10b981; font-weight: bold');
                  console.log('  自然尺寸:', img.naturalWidth, 'x', img.naturalHeight);
                  console.log('  显示尺寸:', img.width, 'x', img.height);
                  console.log('  complete状态:', img.complete);
                  console.log('  src:', img.src);
                  
                  // 重新计算显示信息
                  if (img.complete && img.naturalWidth > 0) {
                    handleImageLoad({ currentTarget: img } as any);
                  }
                } else {
                  console.error('未找到图片元素');
                }
                
                // 输出MediaPipe官方文档链接
                console.log('%c参考资料:', 'color: #f59e0b; font-weight: bold');
                console.log('MediaPipe官方演示: https://mediapipe-studio.webapps.google.com/demo/hand_landmarker');
                console.log('CodePen示例: https://codepen.io/mediapipe-preview/pen/gOKBGPN');
              }}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔍 测试坐标映射
            </button>
            
            <button
              onClick={() => {
                // 切换真实/模拟数据
                setUseRealData(!useRealData);
                const newLandmarks = !useRealData ? getRealMediaPipeLandmarks() : generateMockMediaPipeLandmarks();
                updateUserData({ palmLandmarks: newLandmarks });
                console.log('切换到:', !useRealData ? '真实MediaPipe数据' : '模拟数据');
              }}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {useRealData ? '🎯 真实坐标' : '🎲 模拟坐标'}
            </button>
            
            <button
              onClick={() => {
                // 继续到下一步
                goToNextStep();
              }}
              className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              继续分析 →
            </button>
          </div>
          
          {/* 调试信息显示 */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>图片加载状态: {imageDisplayInfo.isLoaded ? '✅ 已加载' : '⏳ 加载中'}</p>
            <p>关键点数量: {landmarks?.length || 0} / 21</p>
            <p>分析进度: {Math.round(analysisProgress)}%</p>
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