/**
 * Advanced Palm Validation using MediaPipe Hand Detection
 * This provides much more accurate hand/palm detection using ML models
 */

import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';

interface PalmLines {
  lifeLine: { start: Point2D; end: Point2D; curve: Point2D[] };
  heartLine: { start: Point2D; end: Point2D; curve: Point2D[] };
  headLine: { start: Point2D; end: Point2D; curve: Point2D[] };
  fateLine?: { start: Point2D; end: Point2D; curve: Point2D[] };
}

interface Point2D {
  x: number;
  y: number;
}

interface MLValidationResult {
  isValid: boolean;
  confidence: number;
  message: string;
  handCount: number;
  landmarks?: any[];
  palmLines?: PalmLines;
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
    palmLines: palmAnalysis.palmLines,
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
  palmLines?: PalmLines;
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
  
  // Calculate approximate palm lines based on landmarks
  const palmLines = isPalmVisible ? calculatePalmLines(landmarks) : undefined;
  
  return {
    isPalmVisible,
    fingersSpread,
    palmArea,
    palmLines
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
 * Calculate palm lines based on MediaPipe landmarks
 * 基于MediaPipe地标和掌纹学原理精确计算掌纹线位置
 * 
 * 参考掌纹学标准：
 * - 生命线：从拇指和食指间的虎口开始，围绕拇指球的弧形线
 * - 感情线：从小指下方的掌边开始，横向延伸到食指或中指下方
 * - 智慧线：从生命线起点或略高位置开始，横向延伸穿过手掌
 * - 命运线：从手腕中央垂直向上延伸到中指下方
 */
function calculatePalmLines(landmarks: any[]): PalmLines {
  // MediaPipe 21个关键点索引 - 只定义使用到的点
  const WRIST = 0;           // 手腕点
  const THUMB_CMC = 1;       // 拇指腕掌关节
  const THUMB_MCP = 2;       // 拇指掌指关节  
  const INDEX_MCP = 5;       // 食指掌指关节
  const MIDDLE_MCP = 9;      // 中指掌指关节
  const MIDDLE_PIP = 10;     // 中指近端指间关节
  const RING_MCP = 13;       // 无名指掌指关节
  const PINKY_MCP = 17;      // 小指掌指关节

  // 计算手掌几何中心和尺寸用于相对定位
  const palmCenter = calculatePalmCenter(landmarks);
  const palmHeight = calculatePalmHeight(landmarks);

  // === 生命线 (Life Line) ===
  // 起点：拇指和食指间的虎口位置（解剖学准确位置）
  const lifeLineStart = interpolatePoint(landmarks[THUMB_MCP], landmarks[INDEX_MCP], 0.4);
  
  // 中间控制点：沿着拇指球弧形路径
  const thumbBallCenter = interpolatePoint(landmarks[THUMB_CMC], landmarks[WRIST], 0.3);
  const lifeLineMid1 = createArcPoint(lifeLineStart, thumbBallCenter, landmarks[WRIST], 0.3);
  const lifeLineMid2 = createArcPoint(lifeLineStart, thumbBallCenter, landmarks[WRIST], 0.6);
  
  // 终点：手腕内侧，通常在手腕正中偏拇指侧
  const lifeLineEnd = interpolatePoint(landmarks[WRIST], landmarks[THUMB_CMC], 0.15);

  // === 感情线 (Heart Line) ===
  // 起点：小指下方掌边，基于手掌宽度的相对位置
  const heartLineStart = createPalmEdgePoint(landmarks[PINKY_MCP], landmarks[WRIST], 0.8);
  
  // 中间点：跟随手指掌指关节下方的自然弧线
  const heartLineMid1 = interpolatePoint(landmarks[RING_MCP], landmarks[PINKY_MCP], 0.3);
  heartLineMid1.y = landmarks[RING_MCP].y + palmHeight * 0.08; // 略高于掌指关节
  
  const heartLineMid2 = interpolatePoint(landmarks[MIDDLE_MCP], landmarks[INDEX_MCP], 0.5);
  heartLineMid2.y = landmarks[MIDDLE_MCP].y + palmHeight * 0.06;
  
  // 终点：通常延伸到食指下方或食指中指之间
  const heartLineEnd = interpolatePoint(landmarks[INDEX_MCP], landmarks[MIDDLE_MCP], 0.3);
  heartLineEnd.y = landmarks[INDEX_MCP].y + palmHeight * 0.05;

  // === 智慧线 (Head Line) ===
  // 起点：与生命线共同起点或略微分离
  const headLineStart = interpolatePoint(lifeLineStart, landmarks[INDEX_MCP], 0.1);
  
  // 中间点：横向穿过手掌中央，遵循自然弧度
  const headLineMid1 = interpolatePoint(landmarks[INDEX_MCP], landmarks[MIDDLE_MCP], 0.7);
  headLineMid1.y = palmCenter.y + palmHeight * 0.05; // 略低于手掌中心
  
  const headLineMid2 = interpolatePoint(landmarks[MIDDLE_MCP], landmarks[RING_MCP], 0.5);
  headLineMid2.y = palmCenter.y + palmHeight * 0.08;
  
  // 终点：延伸到手掌外侧边缘，通常在中指或无名指下方
  const headLineEnd = interpolatePoint(landmarks[RING_MCP], landmarks[PINKY_MCP], 0.2);
  headLineEnd.y = palmCenter.y + palmHeight * 0.1;

  // === 命运线 (Fate Line) ===
  // 起点：手腕中央
  const fateLineStart = landmarks[WRIST];
  
  // 中间点：垂直向上延伸，穿过手掌中心
  const fateLineMid = interpolatePoint(landmarks[WRIST], landmarks[MIDDLE_MCP], 0.6);
  fateLineMid.x = palmCenter.x; // 确保垂直对齐
  
  // 终点：中指下方
  const fateLineEnd = interpolatePoint(landmarks[MIDDLE_MCP], landmarks[MIDDLE_PIP], 0.15);
  fateLineEnd.x = palmCenter.x;

  return {
    lifeLine: {
      start: lifeLineStart,
      end: lifeLineEnd,
      curve: [lifeLineMid1, lifeLineMid2]
    },
    heartLine: {
      start: heartLineStart,
      end: heartLineEnd,
      curve: [heartLineMid1, heartLineMid2]
    },
    headLine: {
      start: headLineStart,
      end: headLineEnd,
      curve: [headLineMid1, headLineMid2]
    },
    fateLine: {
      start: fateLineStart,
      end: fateLineEnd,
      curve: [fateLineMid]
    }
  };
}

/**
 * 计算手掌几何中心
 */
function calculatePalmCenter(landmarks: any[]): Point2D {
  // 使用四个掌指关节的中心作为手掌中心
  const mcpPoints = [landmarks[5], landmarks[9], landmarks[13], landmarks[17]]; // INDEX, MIDDLE, RING, PINKY MCP
  let centerX = 0, centerY = 0;
  
  mcpPoints.forEach(point => {
    centerX += point.x;
    centerY += point.y;
  });
  
  return {
    x: centerX / mcpPoints.length,
    y: centerY / mcpPoints.length
  };
}


/**
 * 计算手掌高度
 */
function calculatePalmHeight(landmarks: any[]): number {
  // 从手腕到掌指关节的距离
  const wrist = landmarks[0];
  const palmCenter = calculatePalmCenter(landmarks);
  return Math.abs(palmCenter.y - wrist.y);
}

/**
 * 创建弧形路径点
 * 用于生成自然的弧形掌纹线
 */
function createArcPoint(start: Point2D, center: Point2D, end: Point2D, t: number): Point2D {
  // 使用二次贝塞尔曲线的控制点算法
  const p1 = interpolatePoint(start, center, t);
  const p2 = interpolatePoint(center, end, t);
  return interpolatePoint(p1, p2, t);
}

/**
 * 创建手掌边缘点
 * 用于在手掌边缘定位掌纹线起始点
 */
function createPalmEdgePoint(mcpPoint: any, wristPoint: any, ratio: number): Point2D {
  // 基于掌指关节和手腕的位置计算边缘点
  const basePoint = interpolatePoint(mcpPoint, wristPoint, 0.2);
  return {
    x: mcpPoint.x + (mcpPoint.x - wristPoint.x) * 0.1, // 略微向外延伸到掌边
    y: basePoint.y + (mcpPoint.y - wristPoint.y) * ratio
  };
}

/**
 * 线性插值计算两点间的中间点
 */
function interpolatePoint(p1: any, p2: any, t: number): Point2D {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t
  };
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