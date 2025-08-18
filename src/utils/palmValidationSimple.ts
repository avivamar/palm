/**
 * 简化版手掌验证工具
 * 基于竞品的成功经验，实现基础的手掌检测
 */

export interface SimplePalmValidationResult {
  isValid: boolean
  confidence: number
  message: string
  issues: string[]
}

/**
 * 简单的手掌图片验证
 * 检查基本的图片质量和手掌特征
 */
export async function validatePalmImageSimple(
  imageFile: File | Blob | string
): Promise<SimplePalmValidationResult> {
  try {
    // 如果是文件，转换为DataURL
    let imageDataUrl: string
    if (typeof imageFile === 'string') {
      imageDataUrl = imageFile
    } else {
      imageDataUrl = await fileToDataURL(imageFile)
    }
    
    // 创建图片元素进行分析
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageDataUrl
    })
    
    // 基础验证规则
    const validationChecks = {
      // 图片尺寸检查
      sizeCheck: validateImageSize(img),
      // 亮度检查
      brightnessCheck: await validateBrightness(img),
      // 对比度检查
      contrastCheck: await validateContrast(img),
      // 模糊度检查（简化版）
      blurCheck: await validateBlur(img)
    }
    
    // 计算总体置信度
    const passedChecks = Object.values(validationChecks).filter(check => check.passed).length
    const totalChecks = Object.keys(validationChecks).length
    const confidence = passedChecks / totalChecks
    
    // 收集问题
    const issues: string[] = []
    if (!validationChecks.sizeCheck.passed) issues.push('图片尺寸过小')
    if (!validationChecks.brightnessCheck.passed) issues.push('光线不足')
    if (!validationChecks.contrastCheck.passed) issues.push('对比度较低')
    if (!validationChecks.blurCheck.passed) issues.push('图片模糊')
    
    // 判断是否通过
    const isValid = confidence >= 0.5 // 至少通过一半检查
    
    return {
      isValid,
      confidence,
      message: isValid 
        ? '手掌照片质量良好' 
        : `请重新拍摄：${issues.join('、')}`,
      issues
    }
    
  } catch (error) {
    console.error('Palm validation error:', error)
    return {
      isValid: false,
      confidence: 0,
      message: '验证失败，请重试',
      issues: ['验证过程出错']
    }
  }
}

/**
 * 文件转DataURL
 */
function fileToDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 验证图片尺寸
 */
function validateImageSize(img: HTMLImageElement): { passed: boolean; score: number } {
  const minSize = 400 // 最小尺寸要求
  const passed = img.width >= minSize && img.height >= minSize
  const score = Math.min(img.width, img.height) / minSize
  return { passed, score: Math.min(score, 1) }
}

/**
 * 验证图片亮度
 */
async function validateBrightness(img: HTMLImageElement): Promise<{ passed: boolean; score: number }> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return { passed: true, score: 1 }
  
  // 缩小图片以加快处理速度
  const sampleSize = 100
  canvas.width = sampleSize
  canvas.height = sampleSize
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize)
  
  // 获取图片数据
  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize)
  const data = imageData.data
  
  // 计算平均亮度
  let totalBrightness = 0
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] || 0
    const g = data[i + 1] || 0
    const b = data[i + 2] || 0
    // 使用感知亮度公式
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b
    totalBrightness += brightness
  }
  
  const avgBrightness = totalBrightness / (data.length / 4) / 255
  const passed = avgBrightness >= 0.3 && avgBrightness <= 0.85 // 亮度在合理范围内
  
  return { 
    passed, 
    score: passed ? 1 : (avgBrightness < 0.3 ? avgBrightness / 0.3 : (1 - avgBrightness) / 0.15)
  }
}

/**
 * 验证图片对比度
 */
async function validateContrast(img: HTMLImageElement): Promise<{ passed: boolean; score: number }> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return { passed: true, score: 1 }
  
  // 缩小图片
  const sampleSize = 100
  canvas.width = sampleSize
  canvas.height = sampleSize
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize)
  
  // 获取图片数据
  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize)
  const data = imageData.data
  
  // 计算亮度值的标准差
  const brightnesses: number[] = []
  for (let i = 0; i < data.length; i += 4) {
    const brightness = 0.299 * (data[i] || 0) + 0.587 * (data[i + 1] || 0) + 0.114 * (data[i + 2] || 0)
    brightnesses.push(brightness / 255)
  }
  
  // 计算标准差
  const mean = brightnesses.reduce((a, b) => a + b, 0) / brightnesses.length
  const variance = brightnesses.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / brightnesses.length
  const stdDev = Math.sqrt(variance)
  
  // 标准差大于0.15表示有足够的对比度
  const passed = stdDev >= 0.15
  const score = Math.min(stdDev / 0.15, 1)
  
  return { passed, score }
}

/**
 * 简化版模糊度检测
 * 通过边缘检测判断图片清晰度
 */
async function validateBlur(img: HTMLImageElement): Promise<{ passed: boolean; score: number }> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return { passed: true, score: 1 }
  
  // 缩小图片
  const sampleSize = 100
  canvas.width = sampleSize
  canvas.height = sampleSize
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize)
  
  // 获取图片数据
  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize)
  const data = imageData.data
  
  // 简单的边缘检测：计算相邻像素的差异
  let edgeStrength = 0
  const width = sampleSize
  
  for (let y = 1; y < sampleSize - 1; y++) {
    for (let x = 1; x < sampleSize - 1; x++) {
      const idx = (y * width + x) * 4
      const idxLeft = (y * width + (x - 1)) * 4
      const idxTop = ((y - 1) * width + x) * 4
      
      // 计算水平和垂直方向的梯度
      const dx = Math.abs((data[idx] || 0) - (data[idxLeft] || 0))
      const dy = Math.abs((data[idx] || 0) - (data[idxTop] || 0))
      
      edgeStrength += Math.sqrt(dx * dx + dy * dy)
    }
  }
  
  // 归一化边缘强度
  const avgEdgeStrength = edgeStrength / ((sampleSize - 2) * (sampleSize - 2)) / 255
  
  // 边缘强度大于0.05表示图片较清晰
  const passed = avgEdgeStrength >= 0.05
  const score = Math.min(avgEdgeStrength / 0.05, 1)
  
  return { passed, score }
}

/**
 * 获取验证消息
 */
export function getSimpleValidationMessage(result: SimplePalmValidationResult): {
  title: string
  description: string
  type: 'success' | 'warning' | 'error'
} {
  if (result.isValid) {
    return {
      title: '✅ 照片质量良好',
      description: '手掌照片符合要求，正在进行分析...',
      type: 'success'
    }
  }
  
  if (result.confidence >= 0.3) {
    return {
      title: '⚠️ 照片质量一般',
      description: result.message,
      type: 'warning'
    }
  }
  
  return {
    title: '❌ 请重新拍摄',
    description: result.message,
    type: 'error'
  }
}