/**
 * Advanced Palm Validation using MediaPipe Hand Detection
 * This provides much more accurate hand/palm detection using ML models
 */

import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';

interface MLValidationResult {
  isValid: boolean;
  confidence: number;
  message: string;
  handCount: number;
  landmarks?: any[];
  issues?: string[];
}

let handLandmarker: HandLandmarker | null = null;
let isModelLoading = false;
let modelLoadPromise: Promise<void> | null = null;

// Performance optimization: Pre-load model on page load
if (typeof window !== 'undefined') {
  // Start preloading MediaPipe model when the module loads
  setTimeout(() => {
    initializeHandLandmarker().catch(error => {
      console.warn('MediaPipe preload failed:', error);
    });
  }, 2000); // Delay 2 seconds to not block initial page load
}

/**
 * Initialize MediaPipe Hand Landmarker
 */
async function initializeHandLandmarker(): Promise<void> {
  if (handLandmarker) return;
  if (isModelLoading && modelLoadPromise) {
    await modelLoadPromise;
    return;
  }

  isModelLoading = true;
  modelLoadPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "IMAGE",
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error);
      throw new Error('无法加载手部检测模型');
    } finally {
      isModelLoading = false;
    }
  })();

  await modelLoadPromise;
}

/**
 * Validate palm image using MediaPipe ML model with progress callback
 */
export async function validatePalmWithML(file: File, onProgress?: (step: string) => void): Promise<MLValidationResult> {
  try {
    // Initialize model if needed
    onProgress?.('正在初始化MediaPipe模型...');
    await initializeHandLandmarker();
    
    if (!handLandmarker) {
      throw new Error('手部检测模型未加载');
    }

    // Convert file to image
    onProgress?.('正在处理图片...');
    const img = await fileToImage(file);
    
    // Detect hands
    onProgress?.('正在检测手部特征...');
    const results = handLandmarker.detect(img);
    
    // Analyze results
    onProgress?.('正在分析检测结果...');
    return analyzeHandDetectionResults(results);
  } catch (error) {
    console.error('ML validation error:', error);
    
    // Fallback to basic validation
    return {
      isValid: false,
      confidence: 0,
      message: '手部检测失败，请重试',
      handCount: 0,
      issues: ['无法进行ML验证']
    };
  }
}

/**
 * Convert File to HTMLImageElement
 */
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法加载图片'));
    };
    
    img.src = url;
  });
}

/**
 * Analyze MediaPipe hand detection results
 */
function analyzeHandDetectionResults(results: HandLandmarkerResult): MLValidationResult {
  const issues: string[] = [];
  
  // Check if any hands were detected
  if (!results.landmarks || results.landmarks.length === 0) {
    return {
      isValid: false,
      confidence: 0,
      message: '未检测到手掌',
      handCount: 0,
      issues: ['图片中未检测到手部特征，请上传手掌照片']
    };
  }
  
  const handCount = results.landmarks.length;
  
  // Check for palm visibility
  const firstLandmark = results.landmarks[0];
  if (!firstLandmark) {
    return {
      isValid: false,
      confidence: 0,
      message: '未检测到手部关键点',
      handCount: 0,
      issues: ['无法识别手部结构']
    };
  }
  
  const palmAnalysis = analyzePalmVisibility(firstLandmark);
  
  if (!palmAnalysis.isPalmVisible) {
    issues.push('手掌不够清晰，请确保掌心朝向相机');
  }
  
  if (palmAnalysis.fingersSpread < 0.7) {
    issues.push('请张开手指以便更好地分析掌纹');
  }
  
  // Calculate overall confidence
  const confidence = calculateMLConfidence(results, palmAnalysis);
  
  // Determine validity
  const isValid = confidence > 0.65 && issues.length === 0;
  
  return {
    isValid,
    confidence,
    message: isValid 
      ? '✅ 检测到清晰的手掌图片' 
      : '❌ ' + (issues[0] || '手掌图片不符合要求'),
    handCount,
    landmarks: results.landmarks,
    issues
  };
}

/**
 * Analyze palm visibility from landmarks
 */
function analyzePalmVisibility(landmarks: any[]): {
  isPalmVisible: boolean;
  fingersSpread: number;
  palmArea: number;
} {
  // MediaPipe hand landmarks indices
  const WRIST = 0;
  const THUMB_TIP = 4;
  const INDEX_TIP = 8;
  const MIDDLE_TIP = 12;
  const RING_TIP = 16;
  const PINKY_TIP = 20;
  
  // Calculate distances between finger tips (spread indicator)
  const fingerTips = [
    landmarks[THUMB_TIP],
    landmarks[INDEX_TIP],
    landmarks[MIDDLE_TIP],
    landmarks[RING_TIP],
    landmarks[PINKY_TIP]
  ];
  
  let totalDistance = 0;
  let pairCount = 0;
  
  for (let i = 0; i < fingerTips.length - 1; i++) {
    const tip1 = fingerTips[i];
    const tip2 = fingerTips[i + 1];
    const distance = Math.sqrt(
      Math.pow(tip2.x - tip1.x, 2) + 
      Math.pow(tip2.y - tip1.y, 2)
    );
    totalDistance += distance;
    pairCount++;
  }
  
  const avgFingerDistance = totalDistance / pairCount;
  const fingersSpread = Math.min(avgFingerDistance * 3, 1); // Normalize to 0-1
  
  // Calculate palm area (simplified)
  const palmCenter = landmarks[9]; // Middle of palm
  const wrist = landmarks[WRIST];
  const palmHeight = Math.abs(palmCenter.y - wrist.y);
  const palmArea = palmHeight * avgFingerDistance;
  
  // Check if palm is facing camera (z-coordinate analysis)
  const isPalmVisible = palmArea > 0.05 && fingersSpread > 0.5;
  
  return {
    isPalmVisible,
    fingersSpread,
    palmArea
  };
}

/**
 * Calculate confidence score from ML results
 */
function calculateMLConfidence(
  results: HandLandmarkerResult, 
  palmAnalysis: any
): number {
  // Get hand detection confidence
  const detectionConfidence = results.handednesses?.[0]?.[0]?.score || 0;
  
  // Palm visibility score
  const visibilityScore = palmAnalysis.isPalmVisible ? 1 : 0.3;
  
  // Finger spread score
  const spreadScore = palmAnalysis.fingersSpread;
  
  // Weighted average
  const confidence = (
    detectionConfidence * 0.5 +
    visibilityScore * 0.3 +
    spreadScore * 0.2
  );
  
  return Math.min(confidence, 1);
}

/**
 * Alternative: Use TensorFlow.js with a custom hand detection model
 */
export async function validatePalmWithTensorFlow(file: File): Promise<MLValidationResult> {
  // This would use @tensorflow/tfjs and @tensorflow-models/handpose
  // Implementation would be similar but using TensorFlow's hand detection model
  
  try {
    const handpose = await import('@tensorflow-models/handpose');
    await import('@tensorflow/tfjs');
    
    // Load model
    const model = await handpose.load();
    
    // Convert file to tensor
    const img = await fileToImage(file);
    
    // Predict
    const predictions = await model.estimateHands(img);
    
    if (predictions.length === 0) {
      return {
        isValid: false,
        confidence: 0,
        message: '未检测到手掌',
        handCount: 0,
        issues: ['TensorFlow未检测到手部']
      };
    }
    
    // Analyze predictions
    const firstPrediction = predictions[0];
    if (!firstPrediction) {
      return {
        isValid: false,
        confidence: 0,
        message: '未检测到有效手掌数据',
        handCount: 0,
        issues: ['TensorFlow预测数据无效']
      };
    }
    
    const confidence = firstPrediction.handInViewConfidence || 0;
    
    return {
      isValid: confidence > 0.8,
      confidence,
      message: confidence > 0.8 ? '检测到手掌' : '手掌不够清晰',
      handCount: predictions.length,
      landmarks: firstPrediction.landmarks
    };
  } catch (error) {
    console.error('TensorFlow validation error:', error);
    return {
      isValid: false,
      confidence: 0,
      message: 'TensorFlow验证失败',
      handCount: 0,
      issues: ['无法加载TensorFlow模型']
    };
  }
}

/**
 * Server-side validation using API (most accurate)
 */
export async function validatePalmWithAPI(file: File): Promise<MLValidationResult> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/palm/validate', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('API validation failed');
    }
    
    const result = await response.json();
    
    return {
      isValid: result.isValid,
      confidence: result.confidence,
      message: result.message,
      handCount: result.handCount,
      landmarks: result.landmarks,
      issues: result.issues
    };
  } catch (error) {
    console.error('API validation error:', error);
    return {
      isValid: false,
      confidence: 0,
      message: 'API验证失败',
      handCount: 0,
      issues: ['无法连接到验证服务器']
    };
  }
}

/**
 * Combined validation approach for maximum accuracy with progress callback
 */
export async function validatePalmCombinedWithProgress(
  file: File, 
  onProgress?: (step: string) => void
): Promise<MLValidationResult> {
  const results: MLValidationResult[] = []
  
  // Try MediaPipe first (client-side, fast)
  try {
    const mediaPipeResult = await validatePalmWithML(file, onProgress)
    results.push(mediaPipeResult)
    
    // If MediaPipe is confident, no need for other checks
    if (mediaPipeResult.confidence > 0.9) {
      onProgress?.('MediaPipe验证完成！')
      return mediaPipeResult
    }
  } catch (error) {
    console.warn('MediaPipe validation failed:', error)
    onProgress?.('MediaPipe验证失败，尝试备用方案...')
  }
  
  // Try TensorFlow as backup
  try {
    onProgress?.('正在使用TensorFlow.js备用检测...')
    const tfResult = await validatePalmWithTensorFlow(file)
    results.push(tfResult)
  } catch (error) {
    console.warn('TensorFlow validation failed:', error)
    onProgress?.('TensorFlow验证失败，尝试服务器验证...')
  }
  
  // If both client-side methods are uncertain, try server API
  if (results.every(r => r.confidence < 0.7)) {
    try {
      onProgress?.('正在连接服务器进行高精度验证...')
      const apiResult = await validatePalmWithAPI(file)
      results.push(apiResult)
    } catch (error) {
      console.warn('API validation failed:', error)
      onProgress?.('所有验证方法已完成')
    }
  }
  
  // Combine results
  if (results.length === 0) {
    return {
      isValid: false,
      confidence: 0,
      message: '所有验证方法都失败了',
      handCount: 0,
      issues: ['无法验证图片']
    }
  }
  
  // Use the most confident result
  const bestResult = results.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  )
  
  onProgress?.('验证完成，正在分析结果...')
  return bestResult
}

/**
 * Combined validation approach for maximum accuracy
 */
export async function validatePalmCombined(file: File): Promise<MLValidationResult> {
  const results: MLValidationResult[] = [];
  
  // Try MediaPipe first (client-side, fast)
  try {
    const mediaPipeResult = await validatePalmWithML(file);
    results.push(mediaPipeResult);
    
    // If MediaPipe is confident, no need for other checks
    if (mediaPipeResult.confidence > 0.9) {
      return mediaPipeResult;
    }
  } catch (error) {
    console.warn('MediaPipe validation failed:', error);
  }
  
  // Try TensorFlow as backup
  try {
    const tfResult = await validatePalmWithTensorFlow(file);
    results.push(tfResult);
  } catch (error) {
    console.warn('TensorFlow validation failed:', error);
  }
  
  // If both client-side methods are uncertain, try server API
  if (results.every(r => r.confidence < 0.7)) {
    try {
      const apiResult = await validatePalmWithAPI(file);
      results.push(apiResult);
    } catch (error) {
      console.warn('API validation failed:', error);
    }
  }
  
  // Combine results
  if (results.length === 0) {
    return {
      isValid: false,
      confidence: 0,
      message: '所有验证方法都失败了',
      handCount: 0,
      issues: ['无法验证图片']
    };
  }
  
  // Use the most confident result
  const bestResult = results.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );
  
  return bestResult;
}

/**
 * Get user-friendly validation message
 */
export function getMLValidationMessage(result: MLValidationResult): {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'error';
} {
  if (result.isValid && result.confidence > 0.85) {
    return {
      title: '✅ 完美！',
      description: `检测到${result.handCount}只手，图片清晰可用于分析`,
      type: 'success'
    };
  } else if (result.isValid && result.confidence > 0.65) {
    return {
      title: '✓ 图片可用',
      description: '手掌检测成功，但建议在光线更好的环境重拍',
      type: 'warning'
    };
  } else if (result.handCount === 0) {
    return {
      title: '❌ 未检测到手掌',
      description: '请上传清晰的手掌照片，确保掌心朝向相机',
      type: 'error'
    };
  } else {
    const mainIssue = result.issues?.[0] || '手掌图片质量不足';
    return {
      title: '⚠️ 需要重新拍摄',
      description: mainIssue,
      type: 'error'
    };
  }
}