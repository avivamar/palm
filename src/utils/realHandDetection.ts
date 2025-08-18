/**
 * 真实的MediaPipe手部检测算法
 * 使用Google官方MediaPipe HandLandmarker模型
 */

// 仅导入类型，运行时通过动态 import 以避免 SSR/构建期问题
import type { HandLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision'

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

    // 仅在浏览器环境初始化
    if (typeof window === 'undefined') {
      throw new Error('HandLandmarker must be initialized in the browser environment')
    }

    // 运行时动态导入，避免在服务端或构建阶段加载 WASM 依赖
    const visionTasks = await import('@mediapipe/tasks-vision')
    const { HandLandmarker: HandLandmarkerCtor, FilesetResolver: FilesetResolverCtor } = visionTasks as unknown as {
      HandLandmarker: any
      FilesetResolver: any
    }

    // 创建文件集解析器
    const wasmBase = process.env.NEXT_PUBLIC_MEDIAPIPE_WASM_BASE ||
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
    const vision = await FilesetResolverCtor.forVisionTasks(wasmBase)

    const modelAssetPath = process.env.NEXT_PUBLIC_HAND_LANDMARKER_MODEL ||
      'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

    // 优先尝试 GPU，加速失败则自动回退到 CPU，提升兼容性（如 iOS Safari 等）
    const commonOptions = {
      runningMode: 'IMAGE' as const,
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    }

    try {
      handLandmarker = await HandLandmarkerCtor.createFromOptions(vision, {
        baseOptions: { modelAssetPath, delegate: 'GPU' },
        ...commonOptions,
      })
      console.log('✅ MediaPipe HandLandmarker initialized successfully with GPU delegate')
    } catch (gpuError) {
      console.warn('⚠️ GPU delegate initialization failed, falling back to CPU:', gpuError)
      handLandmarker = await HandLandmarkerCtor.createFromOptions(vision, {
        baseOptions: { modelAssetPath, delegate: 'CPU' },
        ...commonOptions,
      })
      console.log('✅ MediaPipe HandLandmarker initialized successfully with CPU delegate')
    }

    return handLandmarker
    
  } catch (error) {
    console.error('❌ Failed to initialize HandLandmarker:', error, {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    })
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
    
    // base64 数据无需跨域，但为了统一处理保留
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
    // @ts-expect-error close may exist at runtime on the concrete instance
    handLandmarker.close && handLandmarker.close()
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