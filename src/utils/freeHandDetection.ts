/**
 * 免费的手部检测和背景消除方案
 * 不依赖付费API，使用本地算法和免费服务。
 */

import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

export interface FreeHandDetectionResult {
  landmarks: NormalizedLandmark[]
  worldLandmarks: NormalizedLandmark[]
  handedness: string
  confidence: number
  segmentedImage: string
  boundingBox: { x: number, y: number, width: number, height: number }
  processingTime: number
  method: 'free-mediapipe' | 'free-canvas-bg-removal'
}

/**
 * 免费的Canvas背景消除算法
 */
export async function removeBackgroundFree(imageBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('🆓 Starting free background removal...')
    
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      // 改进的皮肤检测算法
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] ?? 0
        const g = data[i + 1] ?? 0
        const b = data[i + 2] ?? 0
        
        // 更精确的肤色检测
        const isSkinTone = detectSkinTone(r, g, b)
        const isHandRegion = detectHandRegion(i, data.length, canvas.width, canvas.height)
        
        // 保留手部区域，移除背景
        if (!isSkinTone || !isHandRegion) {
          data[i + 3] = 0 // 设为透明
        } else {
          // 增强手部对比度
          data[i] = Math.min(255, r * 1.1)
          data[i + 1] = Math.min(255, g * 1.05)
          data[i + 2] = Math.min(255, b * 1.0)
        }
      }
      
      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL())
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageBase64
  })
}

/**
 * 改进的肤色检测算法
 */
function detectSkinTone(r: number, g: number, b: number): boolean {
  // YCrCb 色彩空间的肤色检测（更准确）
  const y = 0.299 * r + 0.587 * g + 0.114 * b
  const cr = (r - y) * 0.713 + 128
  const cb = (b - y) * 0.564 + 128
  
  // 肤色范围（基于大量数据统计）
  const skinCr = cr >= 133 && cr <= 173
  const skinCb = cb >= 77 && cb <= 127
  const brightness = y >= 80 && y <= 230
  
  // RGB 额外验证
  const rgbSkin = r > 95 && g > 40 && b > 20 &&
                  r > g && r > b &&
                  Math.abs(r - g) > 15 &&
                  Math.max(r, g, b) - Math.min(r, g, b) > 15
  
  return (skinCr && skinCb && brightness) || rgbSkin
}

/**
 * 手部区域检测（基于位置和连通性）
 */
function detectHandRegion(
  pixelIndex: number, 
  _totalPixels: number, 
  width: number, 
  height: number
): boolean {
  const pixelPos = Math.floor(pixelIndex / 4)
  const x = pixelPos % width
  const y = Math.floor(pixelPos / width)
  
  // 手通常在图片中心偏下的区域
  const centerX = width / 2
  const centerY = height * 0.6 // 稍微偏下
  
  const distanceFromCenter = Math.sqrt(
    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
  )
  
  // 手部区域大致占图片的60%
  const maxHandRadius = Math.min(width, height) * 0.4
  
  return distanceFromCenter <= maxHandRadius
}

/**
 * 免费的增强MediaPipe检测
 */
export async function detectHandFree(imageBase64: string): Promise<FreeHandDetectionResult> {
  console.log('🆓 Starting free hand detection...')
  const startTime = performance.now()
  
  try {
    // 步骤1: 免费背景消除
    console.log('🎨 Free background removal...')
    const cleanedImage = await removeBackgroundFree(imageBase64)
    
    // 步骤2: MediaPipe检测（在清理后的图像上）
    console.log('🤖 MediaPipe detection on cleaned image...')
    const { detectHandFromBase64 } = await import('./realHandDetection')
    const result = await detectHandFromBase64(cleanedImage)
    
    const processingTime = performance.now() - startTime
    
    console.log(`✅ Free detection completed in ${processingTime.toFixed(2)}ms`)
    
    return {
      landmarks: result.landmarks,
      worldLandmarks: result.worldLandmarks,
      handedness: result.handedness,
      confidence: result.confidence,
      segmentedImage: cleanedImage,
      boundingBox: { x: 0, y: 0, width: 1, height: 1 },
      processingTime,
      method: 'free-canvas-bg-removal'
    }
    
  } catch (error) {
    console.error('❌ Free detection failed:', error)
    
    // 最终fallback：直接MediaPipe检测
    console.log('🔄 Fallback to direct MediaPipe...')
    const { detectHandFromBase64 } = await import('./realHandDetection')
    const fallbackResult = await detectHandFromBase64(imageBase64)
    
    return {
      landmarks: fallbackResult.landmarks,
      worldLandmarks: fallbackResult.worldLandmarks,
      handedness: fallbackResult.handedness,
      confidence: fallbackResult.confidence,
      segmentedImage: imageBase64,
      boundingBox: { x: 0, y: 0, width: 1, height: 1 },
      processingTime: performance.now() - startTime,
      method: 'free-mediapipe'
    }
  }
}

/**
 * 图像预处理增强（提高检测成功率）
 */
export async function enhanceImageForDetection(imageBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height
      
      // 绘制原图
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      // 图像增强处理
      for (let i = 0; i < data.length; i += 4) {
        // 增加对比度
        data[i] = Math.min(255, ((data[i] ?? 0) - 128) * 1.2 + 128)     // R
        data[i + 1] = Math.min(255, ((data[i + 1] ?? 0) - 128) * 1.2 + 128) // G
        data[i + 2] = Math.min(255, ((data[i + 2] ?? 0) - 128) * 1.2 + 128) // B
        
        // 锐化处理
        const brightness = ((data[i] ?? 0) + (data[i + 1] ?? 0) + (data[i + 2] ?? 0)) / 3
        if (brightness > 100) {
          data[i] = Math.min(255, (data[i] ?? 0) * 1.1)
          data[i + 1] = Math.min(255, (data[i + 1] ?? 0) * 1.1)
          data[i + 2] = Math.min(255, (data[i + 2] ?? 0) * 1.1)
        }
      }
      
      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL())
    }
    
    img.onerror = () => reject(new Error('Failed to enhance image'))
    img.src = imageBase64
  })
}

/**
 * 检测结果质量评估
 */
export function assessDetectionQuality(result: FreeHandDetectionResult): {
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  score: number
  suggestions: string[]
} {
  const suggestions: string[] = []
  let score = 0
  
  // 关键点数量评估
  if (result.landmarks.length === 21) {
    score += 30
  } else {
    suggestions.push('关键点数量不足，请确保手掌完整在画面内')
  }
  
  // 置信度评估
  if (result.confidence > 0.8) {
    score += 25
  } else if (result.confidence > 0.6) {
    score += 15
    suggestions.push('检测置信度中等，建议改善光线条件')
  } else {
    suggestions.push('检测置信度较低，请重新拍摄')
  }
  
  // 处理时间评估
  if (result.processingTime < 1000) {
    score += 20
  } else if (result.processingTime < 2000) {
    score += 10
  }
  
  // 背景处理评估
  if (result.segmentedImage !== result.segmentedImage) {
    score += 15
    suggestions.push('已优化背景，检测效果更佳')
  } else {
    score += 10
  }
  
  // 关键点分布评估
  const landmarks = result.landmarks
  if (landmarks.length >= 21) {
    const handSpread = calculateHandSpread(landmarks)
    if (handSpread > 0.3) {
      score += 10
    } else {
      suggestions.push('手指展开不够，建议张开手掌')
    }
  }
  
  // 质量等级
  let quality: 'excellent' | 'good' | 'fair' | 'poor'
  if (score >= 80) quality = 'excellent'
  else if (score >= 60) quality = 'good'
  else if (score >= 40) quality = 'fair'
  else quality = 'poor'
  
  return { quality, score, suggestions }
}

/**
 * 计算手部展开程度
 */
function calculateHandSpread(landmarks: NormalizedLandmark[]): number {
  if (landmarks.length < 21) return 0
  
  // 计算拇指到小指的距离
  const thumbTip = landmarks[4]  // 拇指尖
  const pinkyTip = landmarks[20] // 小指尖
  
  if (!thumbTip || !pinkyTip) return 0
  
  const distance = Math.sqrt(
    Math.pow(thumbTip.x - pinkyTip.x, 2) + 
    Math.pow(thumbTip.y - pinkyTip.y, 2)
  )
  
  return distance
}