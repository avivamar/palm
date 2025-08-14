/**
 * 基于OpenCV.js和MediaPipe的掌纹线检测
 * 结合图像预处理和机器视觉算法实现准确的掌纹识别
 */

import { getOpenCV } from './opencvLoader';

interface PalmLineDetectionResult {
  success: boolean;
  lines: DetectedLine[];
  processedImage?: string; // base64编码的处理后图片
  palmRegion?: PalmRegion;
  error?: string;
}

interface DetectedLine {
  type: 'life' | 'heart' | 'head' | 'fate' | 'unknown';
  points: Point2D[];
  confidence: number;
  startPoint: Point2D;
  endPoint: Point2D;
}

interface Point2D {
  x: number;
  y: number;
}

interface PalmRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 主函数：检测掌纹线
 */
export async function detectPalmLines(
  imageFile: File,
  landmarks?: any[]
): Promise<PalmLineDetectionResult> {
  try {
    const cv = await getOpenCV();
    
    // 1. 加载图像
    const imgElement = await fileToImage(imageFile);
    const src = cv.imread(imgElement);
    
    // 2. 提取手掌ROI区域
    const palmRegion = extractPalmROI(src, landmarks, cv);
    
    // 3. 图像预处理
    const processed = preprocessImage(palmRegion.roi, cv);
    
    // 4. 检测线条
    const lines = detectLines(processed, cv);
    
    // 5. 分类掌纹线
    const classifiedLines = classifyPalmLines(lines, palmRegion);
    
    // 6. 生成处理后的图像（用于调试）
    const processedImage = matToBase64(processed, cv);
    
    // 清理内存
    src.delete();
    palmRegion.roi.delete();
    processed.delete();
    
    return {
      success: true,
      lines: classifiedLines,
      processedImage,
      palmRegion: {
        x: palmRegion.x,
        y: palmRegion.y,
        width: palmRegion.width,
        height: palmRegion.height
      }
    };
  } catch (error) {
    console.error('Palm line detection error:', error);
    return {
      success: false,
      lines: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 提取手掌ROI区域
 */
function extractPalmROI(src: any, landmarks: any[] | undefined, cv: any): any {
  let roi;
  let x = 0, y = 0, width = src.cols, height = src.rows;
  
  if (landmarks && landmarks.length > 0) {
    // 基于MediaPipe关键点计算手掌区域
    const handLandmarks = landmarks[0];
    
    // 关键点索引
    const WRIST = 0;
    const INDEX_MCP = 5;
    const MIDDLE_MCP = 9;
    const RING_MCP = 13;
    const PINKY_MCP = 17;
    
    // 计算手掌边界框
    const mcpPoints = [
      handLandmarks[INDEX_MCP],
      handLandmarks[MIDDLE_MCP],
      handLandmarks[RING_MCP],
      handLandmarks[PINKY_MCP]
    ];
    
    const wrist = handLandmarks[WRIST];
    
    // 计算边界
    let minX = wrist.x, maxX = wrist.x;
    let minY = wrist.y, maxY = wrist.y;
    
    mcpPoints.forEach(point => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    
    // 扩展边界以包含整个手掌
    const padding = 0.2; // 20%的padding
    const widthPadding = (maxX - minX) * padding;
    const heightPadding = (maxY - minY) * padding;
    
    x = Math.max(0, (minX - widthPadding) * src.cols);
    y = Math.max(0, (minY - heightPadding * 2) * src.rows); // 向上扩展更多以包含手指根部
    width = Math.min(src.cols - x, (maxX - minX + 2 * widthPadding) * src.cols);
    height = Math.min(src.rows - y, (maxY - minY + 3 * heightPadding) * src.rows);
    
    // 创建ROI
    const rect = new cv.Rect(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
    roi = src.roi(rect);
  } else {
    // 没有landmarks时使用整个图像
    roi = src.clone();
  }
  
  return { roi, x, y, width, height };
}

/**
 * 图像预处理
 */
function preprocessImage(src: any, cv: any): any {
  // 1. 转换为灰度图
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  
  // 2. 直方图均衡化（增强对比度）
  const equalized = new cv.Mat();
  cv.equalizeHist(gray, equalized);
  
  // 3. 高斯模糊（降噪）
  const blurred = new cv.Mat();
  cv.GaussianBlur(equalized, blurred, new cv.Size(3, 3), 0);
  
  // 4. 自适应阈值处理（增强掌纹线）
  const thresholded = new cv.Mat();
  cv.adaptiveThreshold(
    blurred,
    thresholded,
    255,
    cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY_INV,
    11, // 块大小
    2   // 常数
  );
  
  // 5. 形态学操作（连接断裂的线条）
  const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(2, 2));
  const morphed = new cv.Mat();
  cv.morphologyEx(thresholded, morphed, cv.MORPH_CLOSE, kernel);
  
  // 清理临时变量
  gray.delete();
  equalized.delete();
  blurred.delete();
  thresholded.delete();
  kernel.delete();
  
  return morphed;
}

/**
 * 检测线条
 */
function detectLines(processed: any, cv: any): any[] {
  // 使用Canny边缘检测
  const edges = new cv.Mat();
  cv.Canny(processed, edges, 50, 150);
  
  // 使用概率霍夫变换检测线段
  const lines = new cv.Mat();
  cv.HoughLinesP(
    edges,
    lines,
    1,                    // rho
    Math.PI / 180,        // theta
    30,                   // threshold
    30,                   // minLineLength
    10                    // maxLineGap
  );
  
  // 转换为JavaScript数组
  const detectedLines = [];
  for (let i = 0; i < lines.rows; i++) {
    const x1 = lines.data32S[i * 4];
    const y1 = lines.data32S[i * 4 + 1];
    const x2 = lines.data32S[i * 4 + 2];
    const y2 = lines.data32S[i * 4 + 3];
    
    detectedLines.push({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      length: Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
      angle: Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
    });
  }
  
  // 清理
  edges.delete();
  lines.delete();
  
  return detectedLines;
}

/**
 * 分类掌纹线
 */
function classifyPalmLines(
  lines: any[],
  palmRegion: any
): DetectedLine[] {
  const classifiedLines: DetectedLine[] = [];
  
  // 根据线条的位置、角度和长度进行分类
  lines.forEach(line => {
    const centerY = (line.start.y + line.end.y) / 2;
    const centerX = (line.start.x + line.end.x) / 2;
    const relativeY = centerY / palmRegion.height;
    const relativeX = centerX / palmRegion.width;
    const angle = line.angle;
    
    let type: DetectedLine['type'] = 'unknown';
    let confidence = 0.5;
    
    // 基于位置和角度的简单分类规则
    if (relativeY < 0.3 && Math.abs(angle) < 30) {
      // 上部水平线 - 可能是感情线
      type = 'heart';
      confidence = 0.7;
    } else if (relativeY > 0.3 && relativeY < 0.6 && Math.abs(angle) < 45) {
      // 中部斜线 - 可能是智慧线
      type = 'head';
      confidence = 0.7;
    } else if (relativeX < 0.5 && (angle > 45 || angle < -45)) {
      // 左侧弧形线 - 可能是生命线
      type = 'life';
      confidence = 0.7;
    } else if (relativeX > 0.4 && relativeX < 0.6 && Math.abs(angle) > 60) {
      // 中部垂直线 - 可能是命运线
      type = 'fate';
      confidence = 0.6;
    }
    
    // 只保留置信度较高且长度足够的线条
    if (line.length > 20 && confidence > 0.5) {
      classifiedLines.push({
        type,
        points: [line.start, line.end],
        confidence,
        startPoint: {
          x: (palmRegion.x + line.start.x) / palmRegion.width,
          y: (palmRegion.y + line.start.y) / palmRegion.height
        },
        endPoint: {
          x: (palmRegion.x + line.end.x) / palmRegion.width,
          y: (palmRegion.y + line.end.y) / palmRegion.height
        }
      });
    }
  });
  
  // 合并相近的线条
  return mergeNearbyLines(classifiedLines);
}

/**
 * 合并相近的线条
 */
function mergeNearbyLines(lines: DetectedLine[]): DetectedLine[] {
  const merged: DetectedLine[] = [];
  const used = new Set<number>();
  
  for (let i = 0; i < lines.length; i++) {
    if (used.has(i)) continue;
    
    const currentLine = lines[i];
    if (!currentLine) continue;
    
    const group = [currentLine];
    used.add(i);
    
    // 查找相近的线条
    for (let j = i + 1; j < lines.length; j++) {
      if (used.has(j)) continue;
      
      const otherLine = lines[j];
      if (!otherLine || currentLine.type !== otherLine.type) continue;
      
      const distance = calculateLineDistance(currentLine, otherLine);
      if (distance < 0.1) { // 10%的距离阈值
        group.push(otherLine);
        used.add(j);
      }
    }
    
    // 合并组内的线条
    if (group.length > 0) {
      merged.push(mergeLinesInGroup(group));
    }
  }
  
  return merged;
}

/**
 * 计算两条线之间的距离
 */
function calculateLineDistance(line1: DetectedLine, line2: DetectedLine): number {
  const dx = (line1.startPoint.x + line1.endPoint.x) / 2 - 
             (line2.startPoint.x + line2.endPoint.x) / 2;
  const dy = (line1.startPoint.y + line1.endPoint.y) / 2 - 
             (line2.startPoint.y + line2.endPoint.y) / 2;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 合并一组线条
 */
function mergeLinesInGroup(group: DetectedLine[]): DetectedLine {
  if (group.length === 0) {
    throw new Error('Cannot merge empty group');
  }
  
  let sumStartX = 0, sumStartY = 0, sumEndX = 0, sumEndY = 0;
  let maxConfidence = 0;
  
  group.forEach(line => {
    sumStartX += line.startPoint.x;
    sumStartY += line.startPoint.y;
    sumEndX += line.endPoint.x;
    sumEndY += line.endPoint.y;
    maxConfidence = Math.max(maxConfidence, line.confidence);
  });
  
  const count = group.length;
  const firstLine = group[0]!;
  
  return {
    type: firstLine.type,
    points: firstLine.points, // 使用第一条线的点
    confidence: maxConfidence,
    startPoint: {
      x: sumStartX / count,
      y: sumStartY / count
    },
    endPoint: {
      x: sumEndX / count,
      y: sumEndY / count
    }
  };
}

/**
 * 将File转换为HTMLImageElement
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
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * 将OpenCV Mat转换为Base64字符串
 */
function matToBase64(mat: any, cv: any): string {
  const canvas = document.createElement('canvas');
  canvas.width = mat.cols;
  canvas.height = mat.rows;
  cv.imshow(canvas, mat);
  return canvas.toDataURL('image/png');
}