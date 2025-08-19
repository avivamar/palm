/**
 * 2025年先进的手部检测和背景消除系统
 * 集成 Florence-2 + SAM 2.1 + HandSegNet 技术
 */

import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

export interface AdvancedHandDetectionResult {
  landmarks: NormalizedLandmark[]
  worldLandmarks: NormalizedLandmark[]
  handedness: string
  confidence: number
  segmentedImage: string // 背景消除后的图片
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  processingTime: number
  detectionMethod: 'florence-2' | 'sam-2' | 'mediapipe' | 'handSegNet'
}

/**
 * Florence-2 手部检测 (零样本检测)
 */
async function detectHandWithFlorence2(imageBase64: string): Promise<AdvancedHandDetectionResult | null> {
  try {
    console.log('🔬 Starting Florence-2 zero-shot hand detection...')
    const startTime = performance.now()
    
    // Florence-2 API调用 (通过Hugging Face Inference API)
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/Florence-2-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: imageBase64,
        parameters: {
          task: 'object_detection',
          text_prompt: 'hand palm fingers'
        }
      })
    })
    
    if (!response.ok) {
      throw new Error(`Florence-2 API error: ${response.status}`)
    }
    
    const result = await response.json()
    const processingTime = performance.now() - startTime
    
    // 解析Florence-2检测结果
    if (result && result.length > 0) {
      const handDetection = result.find((item: any) => 
        item.label?.toLowerCase().includes('hand') || 
        item.label?.toLowerCase().includes('palm')
      )
      
      if (handDetection) {
        console.log(`✅ Florence-2 hand detected in ${processingTime.toFixed(2)}ms`)
        
        return {
          landmarks: await extractLandmarksFromBoundingBox(imageBase64, handDetection.box),
          worldLandmarks: [],
          handedness: 'Unknown',
          confidence: handDetection.score || 0.8,
          segmentedImage: imageBase64, // 将通过SAM 2进行分割
          boundingBox: handDetection.box,
          processingTime,
          detectionMethod: 'florence-2'
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('❌ Florence-2 detection failed:', error)
    return null
  }
}

/**
 * SAM 2.1 手部分割和背景消除
 */
async function segmentHandWithSAM2(
  imageBase64: string, 
  boundingBox?: { x: number, y: number, width: number, height: number }
): Promise<string> {
  try {
    console.log('🎯 Starting SAM 2.1 hand segmentation...')
    
    // SAM 2 通过Hugging Face Spaces API
    const response = await fetch('https://skalskip-florence-sam.hf.space/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [
          imageBase64,
          "hand palm fingers", // text prompt for grounding
          0.3, // box threshold
          0.25 // text threshold
        ]
      })
    })
    
    if (!response.ok) {
      throw new Error(`SAM 2 API error: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.data && result.data[0]) {
      console.log('✅ SAM 2.1 segmentation successful')
      return result.data[0] // 返回分割后的图片
    }
    
    return imageBase64 // 如果分割失败，返回原图
  } catch (error) {
    console.error('❌ SAM 2.1 segmentation failed:', error)
    return imageBase64
  }
}

/**
 * HandSegNet 专门手部分割 (backup方案)
 */
async function segmentHandWithHandSegNet(imageBase64: string): Promise<string> {
  try {
    console.log('🤖 Starting HandSegNet specialized segmentation...')
    
    // 这里可以集成HandSegNet模型
    // 由于HandSegNet需要特定的模型部署，先用备用方案
    
    // 使用U2-Net进行背景消除作为替代
    const response = await fetch('/api/remove-background', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        model: 'u2net_hand' // 专门的手部模型
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      return result.processedImage
    }
    
    return imageBase64
  } catch (error) {
    console.error('❌ HandSegNet segmentation failed:', error)
    return imageBase64
  }
}

/**
 * 从边界框提取手部关键点
 */
async function extractLandmarksFromBoundingBox(
  imageBase64: string, 
  boundingBox: { x: number, y: number, width: number, height: number }
): Promise<NormalizedLandmark[]> {
  try {
    // 裁剪手部区域
    const croppedImage = await cropImageToBoundingBox(imageBase64, boundingBox)
    
    // 在裁剪区域运行MediaPipe进行精确关键点检测
    const { detectHandFromBase64 } = await import('./realHandDetection')
    const result = await detectHandFromBase64(croppedImage)
    
    // 将相对坐标转换回原图坐标
    return result.landmarks.map(landmark => ({
      x: boundingBox.x + landmark.x * boundingBox.width,
      y: boundingBox.y + landmark.y * boundingBox.height,
      z: landmark.z,
      visibility: landmark.visibility
    }))
  } catch (error) {
    console.error('❌ Landmark extraction failed:', error)
    return []
  }
}

/**
 * 裁剪图片到指定边界框
 */
async function cropImageToBoundingBox(
  imageBase64: string,
  boundingBox: { x: number, y: number, width: number, height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      canvas.width = boundingBox.width
      canvas.height = boundingBox.height
      
      ctx.drawImage(
        img,
        boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height,
        0, 0, boundingBox.width, boundingBox.height
      )
      
      resolve(canvas.toDataURL())
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageBase64
  })
}

/**
 * 主要的先进手部检测函数
 */
export async function detectHandAdvanced(imageBase64: string): Promise<AdvancedHandDetectionResult> {
  console.log('🚀 Starting advanced hand detection pipeline...')
  const overallStartTime = performance.now()
  
  try {
    // 步骤1: Florence-2 零样本检测
    let result = await detectHandWithFlorence2(imageBase64)
    
    if (result) {
      // 步骤2: SAM 2.1 精确分割和背景消除
      result.segmentedImage = await segmentHandWithSAM2(imageBase64, result.boundingBox)
      
      // 步骤3: 在分割后的图片上重新检测关键点
      if (result.segmentedImage !== imageBase64) {
        try {
          const { detectHandFromBase64 } = await import('./realHandDetection')
          const refinedResult = await detectHandFromBase64(result.segmentedImage)
          result.landmarks = refinedResult.landmarks
          result.worldLandmarks = refinedResult.worldLandmarks
          result.handedness = refinedResult.handedness
          result.confidence = Math.max(result.confidence, refinedResult.confidence)
        } catch (error) {
          console.warn('⚠️ Refined landmark detection failed, using initial results')
        }
      }
      
      const totalTime = performance.now() - overallStartTime
      result.processingTime = totalTime
      
      console.log(`✅ Advanced detection completed in ${totalTime.toFixed(2)}ms`)
      return result
    }
    
    // 备用方案1: HandSegNet + MediaPipe
    console.log('⚠️ Florence-2 failed, trying HandSegNet + MediaPipe...')
    const segmentedImage = await segmentHandWithHandSegNet(imageBase64)
    
    try {
      const { detectHandFromBase64 } = await import('./realHandDetection')
      const mediaPipeResult = await detectHandFromBase64(segmentedImage)
      
      return {
        landmarks: mediaPipeResult.landmarks,
        worldLandmarks: mediaPipeResult.worldLandmarks,
        handedness: mediaPipeResult.handedness,
        confidence: mediaPipeResult.confidence,
        segmentedImage,
        boundingBox: { x: 0, y: 0, width: 1, height: 1 },
        processingTime: performance.now() - overallStartTime,
        detectionMethod: 'handSegNet'
      }
    } catch (error) {
      console.error('❌ HandSegNet + MediaPipe backup failed:', error)
    }
    
    // 备用方案2: 纯MediaPipe (原始方法)
    console.log('⚠️ All advanced methods failed, falling back to MediaPipe...')
    const { detectHandFromBase64 } = await import('./realHandDetection')
    const basicResult = await detectHandFromBase64(imageBase64)
    
    return {
      landmarks: basicResult.landmarks,
      worldLandmarks: basicResult.worldLandmarks,
      handedness: basicResult.handedness,
      confidence: basicResult.confidence,
      segmentedImage: imageBase64, // 无背景处理
      boundingBox: { x: 0, y: 0, width: 1, height: 1 },
      processingTime: performance.now() - overallStartTime,
      detectionMethod: 'mediapipe'
    }
    
  } catch (error) {
    console.error('❌ All detection methods failed:', error)
    throw new Error(`Advanced hand detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 验证检测结果质量
 */
export function validateAdvancedDetectionResult(result: AdvancedHandDetectionResult): boolean {
  // 基本验证
  if (!result.landmarks || result.landmarks.length !== 21) {
    console.warn('⚠️ Invalid landmarks count:', result.landmarks?.length)
    return false
  }
  
  // 置信度验证
  if (result.confidence < 0.5) {
    console.warn('⚠️ Low confidence:', result.confidence)
    return false
  }
  
  // 关键点合理性验证
  const validPoints = result.landmarks.filter(point => 
    point.x >= 0 && point.x <= 1 && 
    point.y >= 0 && point.y <= 1
  )
  
  if (validPoints.length < 18) { // 至少85%的点要合理
    console.warn('⚠️ Too many invalid landmarks:', validPoints.length)
    return false
  }
  
  console.log('✅ Advanced detection result validation passed')
  return true
}