/**
 * 真实的MediaPipe手部检测算法
 * 使用Google官方MediaPipe HandLandmarker模型
 */

import { HandLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision'

let handLandmarker: HandLandmarker | null = null
let isInitializing = false

/**
 * 初始化MediaPipe HandLandmarker
 */
export async function initializeHandLandmarker(): Promise<HandLandmarker> {
  if (handLandmarker) return handLandmarker
  
  if (isInitializing) {
    // 等待初始化完成
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (handLandmarker) return handLandmarker
  }
  
  try {
    isInitializing = true
    console.log('🚀 Initializing MediaPipe HandLandmarker...')
    
    // 创建文件集解析器
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
    )
    
    // 创建手部检测器
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU" // 使用GPU加速
      },
      runningMode: "IMAGE",
      numHands: 1, // 只检测一只手
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    
    console.log('✅ MediaPipe HandLandmarker initialized successfully')
    return handLandmarker
    
  } catch (error) {
    console.error('❌ Failed to initialize HandLandmarker:', error)
    throw error
  } finally {
    isInitializing = false
  }
}

/**
 * 检测手部关键点
 */
export async function detectHandLandmarks(imageElement: HTMLImageElement): Promise<{
  landmarks: NormalizedLandmark[]
  worldLandmarks: NormalizedLandmark[]
  handedness: string
  confidence: number
}> {
  try {
    const detector = await initializeHandLandmarker()
    
    console.log('🔍 Detecting hand landmarks...')
    const startTime = performance.now()
    
    // 执行检测
    const results = detector.detect(imageElement)
    
    const endTime = performance.now()
    console.log(`⚡ Detection completed in ${(endTime - startTime).toFixed(2)}ms`)
    
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0] // 取第一只手
      const worldLandmarks = results.worldLandmarks?.[0] || landmarks
      const handedness = results.handedness?.[0]?.[0]?.categoryName || 'Unknown'
      const confidence = results.handedness?.[0]?.[0]?.score || 0
      
      if (!landmarks || landmarks.length === 0) {
        throw new Error('Empty landmarks detected')
      }
      
      console.log('✅ Hand detected:', {
        landmarks: landmarks.length,
        handedness,
        confidence: confidence.toFixed(3)
      })
      
      return {
        landmarks: landmarks as NormalizedLandmark[],
        worldLandmarks: worldLandmarks as NormalizedLandmark[],
        handedness,
        confidence
      }
    } else {
      console.warn('⚠️ No hands detected in image')
      throw new Error('No hands detected in the image')
    }
    
  } catch (error) {
    console.error('❌ Hand detection failed:', error)
    throw error
  }
}

/**
 * 从Base64图片进行手部检测
 */
export async function detectHandFromBase64(base64Image: string): Promise<{
  landmarks: NormalizedLandmark[]
  worldLandmarks: NormalizedLandmark[]
  handedness: string
  confidence: number
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = async () => {
      try {
        const result = await detectHandLandmarks(img)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.crossOrigin = 'anonymous'
    img.src = base64Image
  })
}

/**
 * 从文件进行手部检测
 */
export async function detectHandFromFile(file: File): Promise<{
  landmarks: NormalizedLandmark[]
  worldLandmarks: NormalizedLandmark[]
  handedness: string
  confidence: number
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async () => {
      try {
        const base64 = reader.result as string
        const result = await detectHandFromBase64(base64)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 清理资源
 */
export function cleanupHandLandmarker() {
  if (handLandmarker) {
    handLandmarker.close()
    handLandmarker = null
    console.log('🧹 HandLandmarker cleaned up')
  }
}

/**
 * 验证检测结果
 */
export function validateHandLandmarks(landmarks: NormalizedLandmark[]): boolean {
  if (!landmarks || landmarks.length !== 21) {
    console.warn('⚠️ Invalid landmarks: expected 21 points, got', landmarks?.length)
    return false
  }
  
  // 检查关键点的合理性
  for (let i = 0; i < landmarks.length; i++) {
    const point = landmarks[i]
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
      console.warn(`⚠️ Invalid landmark at index ${i}:`, point)
      return false
    }
    
    // 检查坐标范围 (归一化坐标应该在0-1之间)
    if (point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) {
      console.warn(`⚠️ Landmark ${i} out of bounds:`, point)
      return false
    }
  }
  
  console.log('✅ Hand landmarks validation passed')
  return true
}