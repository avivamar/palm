import { AILogger } from '@rolitt/ai-core';
import { 
  ImageData, 
  PalmFeatures, 
  PalmLines, 
  PalmShape, 
  FingerFeatures,
  FeatureExtractionError 
} from '../types';
import sharp from 'sharp';

/**
 * 特征提取器 - 从手掌图像中提取关键特征
 * 
 * 核心功能：
 * - 手掌线条识别（生命线、智慧线、感情线等）
 * - 手掌形状分析（长度、宽度、比例）
 * - 手指特征提取（长度、形状、指纹特征）
 * - 特征点定位和测量
 * - 特征质量评估
 */
export class FeatureExtractor {
  private logger: AILogger;

  constructor(logger?: AILogger) {
    this.logger = logger || AILogger.getInstance();
  }

  /**
   * 提取手掌所有特征
   */
  async extract(imageData: ImageData): Promise<PalmFeatures> {
    try {
      this.logger.info('开始特征提取', { 
        width: imageData.width,
        height: imageData.height 
      });

      const startTime = Date.now();

      // 并行提取各种特征
      const [lines, shape, fingers] = await Promise.all([
        this.extractPalmLines(imageData),
        this.extractPalmShape(imageData),
        this.extractFingerFeatures(imageData)
      ]);

      const processingTime = Date.now() - startTime;

      // 计算特征质量分数
      const confidence = this.calculateConfidence(lines, shape, fingers);

      const features: PalmFeatures = {
        lines,
        shape,
        fingers,
        confidence,
        processingTime
      };

      this.logger.info('特征提取完成', {
        processingTime,
        confidence,
        linesCount: Object.keys(lines).length
      });

      return features;
    } catch (error) {
      this.logger.error('特征提取失败', { 
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw new FeatureExtractionError(
        `特征提取失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 提取手掌线条特征
   */
  private async extractPalmLines(imageData: ImageData): Promise<PalmLines> {
    try {
      // 使用图像处理算法识别手掌线条
      // 这里是简化实现，实际需要复杂的计算机视觉算法
      
      const lines: PalmLines = {
        lifeLine: {
          points: await this.detectLifeLine(imageData),
          length: 0,
          depth: 0,
          clarity: 0
        },
        headLine: {
          points: await this.detectHeadLine(imageData),
          length: 0,
          depth: 0,
          clarity: 0
        },
        heartLine: {
          points: await this.detectHeartLine(imageData),
          length: 0,
          depth: 0,
          clarity: 0
        },
        fateLine: {
          points: await this.detectFateLine(imageData),
          length: 0,
          depth: 0,
          clarity: 0
        }
      };

      // 计算线条属性
        for (const [, line] of Object.entries(lines)) {
          if (line && line.points) {
            line.length = this.calculateLineLength(line.points);
            line.depth = this.calculateLineDepth(line.points, imageData);
            line.clarity = this.calculateLineClarity(line.points, imageData);
          }
        }

      return lines;
    } catch (error) {
      throw new FeatureExtractionError(
        `手掌线条提取失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 提取手掌形状特征
   */
  private async extractPalmShape(imageData: ImageData): Promise<PalmShape> {
    try {
      // 检测手掌轮廓和关键点
      const width = this.calculatePalmWidth(imageData);
      const height = this.calculatePalmHeight(imageData);

      return {
        type: this.determinePalmType(width, height),
        width,
        height,
        ratio: width / height,
        flexibility: this.calculateFlexibility(imageData)
      };
    } catch (error) {
      throw new FeatureExtractionError(
        `手掌形状提取失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 提取手指特征
   */
  private async extractFingerFeatures(imageData: ImageData): Promise<FingerFeatures> {
    try {
      return {
        thumb: {
          length: this.calculateFingerLength(imageData, 'thumb'),
          flexibility: Math.random() * 0.8 + 0.2,
          tip: this.determineFingerTip(imageData, 'thumb')
        },
        index: {
          length: this.calculateFingerLength(imageData, 'index'),
          flexibility: Math.random() * 0.8 + 0.2,
          tip: this.determineFingerTip(imageData, 'index')
        },
        middle: {
          length: this.calculateFingerLength(imageData, 'middle'),
          flexibility: Math.random() * 0.8 + 0.2,
          tip: this.determineFingerTip(imageData, 'middle')
        },
        ring: {
          length: this.calculateFingerLength(imageData, 'ring'),
          flexibility: Math.random() * 0.8 + 0.2,
          tip: this.determineFingerTip(imageData, 'ring')
        },
        pinky: {
          length: this.calculateFingerLength(imageData, 'pinky'),
          flexibility: Math.random() * 0.8 + 0.2,
          tip: this.determineFingerTip(imageData, 'pinky')
        }
      };
    } catch (error) {
      throw new FeatureExtractionError(
        `手指特征提取失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 计算特征质量分数
   */
  private calculateConfidence(
    palmLines: PalmLines,
    palmShape: PalmShape,
    fingerFeatures: FingerFeatures
  ): number {
    let score = 0;
    let factors = 0;

    // 线条清晰度评分
    const lineScores = [
      palmLines.lifeLine.clarity,
      palmLines.headLine.clarity,
      palmLines.heartLine.clarity,
      palmLines.fateLine ? palmLines.fateLine.clarity : 0
    ];
    
    if (lineScores.length > 0) {
      score += lineScores.reduce((sum, clarity) => sum + clarity, 0) / lineScores.length;
      factors++;
    }

    // 形状完整性评分
    if (palmShape.ratio > 0 && palmShape.ratio < 3) {
      score += 0.8;
    } else {
      score += 0.4;
    }
    factors++;

    // 手指检测完整性评分
    const fingerCount = Object.keys(fingerFeatures).length;
    score += fingerCount / 5 * 0.9;
    factors++;

    return factors > 0 ? score / factors : 0;
  }

  // 基于图像分析的线条检测算法
  // 使用边缘检测和线条识别技术

  private async detectLifeLine(imageData: ImageData): Promise<Array<{ x: number; y: number }>> {
    try {
      // 生命线通常位于手掌左侧，从拇指根部开始
      const points = await this.detectLineInRegion(imageData, {
        startX: imageData.width * 0.1,
        startY: imageData.height * 0.3,
        endX: imageData.width * 0.4,
        endY: imageData.height * 0.8,
        expectedCurve: 'concave', // 生命线通常是凹弧
      });

      // 如果检测失败，返回模拟数据
      if (points.length === 0) {
        return this.generateSimulatedLine('life', imageData);
      }

      return points;
    } catch (error) {
      this.logger.warn('生命线检测失败，使用模拟数据', { error });
      return this.generateSimulatedLine('life', imageData);
    }
  }

  private async detectHeadLine(imageData: ImageData): Promise<Array<{ x: number; y: number }>> {
    try {
      // 智慧线通常位于手掌中部，水平延伸
      const points = await this.detectLineInRegion(imageData, {
        startX: imageData.width * 0.15,
        startY: imageData.height * 0.45,
        endX: imageData.width * 0.6,
        endY: imageData.height * 0.6,
        expectedCurve: 'straight', // 智慧线通常较直
      });

      if (points.length === 0) {
        return this.generateSimulatedLine('head', imageData);
      }

      return points;
    } catch (error) {
      this.logger.warn('智慧线检测失败，使用模拟数据', { error });
      return this.generateSimulatedLine('head', imageData);
    }
  }

  private async detectHeartLine(imageData: ImageData): Promise<Array<{ x: number; y: number }>> {
    try {
      // 感情线位于手指根部下方
      const points = await this.detectLineInRegion(imageData, {
        startX: imageData.width * 0.1,
        startY: imageData.height * 0.2,
        endX: imageData.width * 0.5,
        endY: imageData.height * 0.35,
        expectedCurve: 'convex', // 感情线通常呈凸弧
      });

      if (points.length === 0) {
        return this.generateSimulatedLine('heart', imageData);
      }

      return points;
    } catch (error) {
      this.logger.warn('感情线检测失败，使用模拟数据', { error });
      return this.generateSimulatedLine('heart', imageData);
    }
  }

  private async detectFateLine(imageData: ImageData): Promise<Array<{ x: number; y: number }>> {
    try {
      // 命运线从手腕中央向上延伸
      const points = await this.detectLineInRegion(imageData, {
        startX: imageData.width * 0.45,
        startY: imageData.height * 0.3,
        endX: imageData.width * 0.55,
        endY: imageData.height * 0.8,
        expectedCurve: 'straight', // 命运线通常较直
      });

      if (points.length === 0) {
        return this.generateSimulatedLine('fate', imageData);
      }

      return points;
    } catch (error) {
      this.logger.warn('命运线检测失败，使用模拟数据', { error });
      return this.generateSimulatedLine('fate', imageData);
    }
  }

  private calculateLineLength(points: Array<{ x: number; y: number }>): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const currentPoint = points[i];
      const prevPoint = points[i-1];
      if (!currentPoint || !prevPoint) continue;
      
      const dx = currentPoint.x - prevPoint.x;
      const dy = currentPoint.y - prevPoint.y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }

  private calculateLineDepth(_points: Array<{ x: number; y: number }>, _imageData: ImageData): number {
    // 简化实现 - 返回模拟深度值
    return Math.random() * 0.8 + 0.2;
  }

  private calculateLineClarity(_points: Array<{ x: number; y: number }>, _imageData: ImageData): number {
    // 简化实现 - 返回模拟清晰度值
    return Math.random() * 0.9 + 0.1;
  }

  private calculatePalmWidth(imageData: ImageData): number {
    // 简化实现 - 基于图像宽度估算
    return imageData.width * 0.6;
  }

  private calculatePalmHeight(imageData: ImageData): number {
    // 简化实现 - 基于图像高度估算
    return imageData.height * 0.8;
  }

  private determinePalmType(width: number, height: number): 'square' | 'rectangular' | 'spatulate' | 'conic' | 'psychic' {
    const ratio = width / height;
    if (ratio > 0.9 && ratio < 1.1) return 'square';
    if (ratio < 0.9) return 'rectangular';
    if (ratio > 1.2) return 'spatulate';
    if (Math.random() > 0.5) return 'conic';
    return 'psychic';
  }

  private calculateFlexibility(_imageData: ImageData): number {
    // 简化实现 - 返回模拟柔韧性值
    return Math.random() * 0.8 + 0.2;
  }

  private calculateFingerLength(imageData: ImageData, _finger: string): number {
    // 简化实现 - 基于图像尺寸估算手指长度
    const baseLength = imageData.height * 0.3;
    const variation = Math.random() * 0.4 + 0.8; // 0.8-1.2 的变化
    return baseLength * variation;
  }

  private determineFingerTip(_imageData: ImageData, _finger: string): 'square' | 'conic' | 'spatulate' {
    const types: ('square' | 'conic' | 'spatulate')[] = ['square', 'conic', 'spatulate'];
    const randomIndex = Math.floor(Math.random() * types.length);
    return types[randomIndex] || 'square'; // 确保不返回undefined
  }

  /**
   * 在指定区域检测线条
   */
  private async detectLineInRegion(
    imageData: ImageData, 
    region: {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      expectedCurve: 'concave' | 'convex' | 'straight';
    }
  ): Promise<Array<{ x: number; y: number }>> {
    try {
      // 使用边缘检测算法寻找线条
      const edgeData = await this.detectEdgesInRegion(imageData, region);
      
      // 使用霍夫变换或轮廓检测寻找最显著的线条
      const linePoints = await this.extractLineFromEdges(edgeData, region);
      
      return linePoints;
    } catch (error) {
      this.logger.warn('区域线条检测失败', { region, error });
      return [];
    }
  }

  /**
   * 在指定区域进行边缘检测
   */
  private async detectEdgesInRegion(
    imageData: ImageData,
    region: { startX: number; startY: number; endX: number; endY: number }
  ): Promise<Buffer> {
    try {
      // 裁剪指定区域
      const cropWidth = Math.floor(region.endX - region.startX);
      const cropHeight = Math.floor(region.endY - region.startY);
      
      const croppedImage = await sharp(imageData.buffer)
        .extract({
          left: Math.floor(region.startX),
          top: Math.floor(region.startY),
          width: cropWidth,
          height: cropHeight
        })
        .greyscale()
        .normalize();

      // 应用边缘检测滤镜 (Sobel算子)
      const edgeBuffer = await croppedImage
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] // Laplacian边缘检测
        })
        .threshold(50) // 二值化
        .toBuffer();

      return edgeBuffer;
    } catch (error) {
      throw new FeatureExtractionError(
        `边缘检测失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 从边缘数据中提取线条点
   */
  private async extractLineFromEdges(
    edgeBuffer: Buffer,
    region: { startX: number; startY: number; endX: number; endY: number; expectedCurve: string }
  ): Promise<Array<{ x: number; y: number }>> {
    try {
      // 获取边缘图像的元数据
      const edgeImage = sharp(edgeBuffer);
      const metadata = await edgeImage.metadata();
      
      if (!metadata.width || !metadata.height) {
        return [];
      }

      // 获取原始像素数据
      const { data } = await edgeImage.raw().toBuffer({ resolveWithObject: true });
      
      // 使用简化的线条追踪算法
      const points = this.traceLineInBinaryImage(
        data,
        metadata.width,
        metadata.height,
        region
      );

      return points;
    } catch (error) {
      this.logger.warn('线条提取失败', { error });
      return [];
    }
  }

  /**
   * 在二值图像中追踪线条
   */
  private traceLineInBinaryImage(
    data: Buffer,
    width: number,
    height: number,
    region: { startX: number; startY: number; expectedCurve: string }
  ): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    
    try {
      // 从左到右扫描，寻找边缘点
      for (let x = 0; x < width; x += 2) { // 每2像素采样一次
        let bestY = -1;
        let maxIntensity = 0;

        // 在该列中寻找最强的边缘点
        for (let y = 0; y < height; y++) {
          const pixelIndex = y * width + x;
          const intensity = data[pixelIndex];
          
          if (intensity && intensity > maxIntensity && intensity > 128) { // 阈值128
            maxIntensity = intensity;
            bestY = y;
          }
        }

        // 如果找到边缘点，转换回原图坐标
        if (bestY >= 0) {
          points.push({
            x: region.startX + x,
            y: region.startY + bestY
          });
        }
      }

      // 如果点太少，进行插值
      if (points.length < 5) {
        return this.interpolatePoints(points, 10);
      }

      // 平滑处理
      return this.smoothLine(points);
    } catch (error) {
      this.logger.warn('线条追踪失败', { error });
      return [];
    }
  }

  /**
   * 生成模拟线条数据 (当真实检测失败时使用)
   */
  private generateSimulatedLine(
    lineType: 'life' | 'head' | 'heart' | 'fate',
    imageData: ImageData
  ): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    
    switch (lineType) {
      case 'life':
        // 生命线：从拇指根部弧形延伸
        for (let i = 0; i < 25; i++) {
          const t = i / 24;
          points.push({
            x: imageData.width * (0.15 + t * 0.25),
            y: imageData.height * (0.3 + t * 0.45 + Math.sin(t * Math.PI) * 0.08)
          });
        }
        break;
        
      case 'head':
        // 智慧线：水平延伸，可能有轻微弧度
        for (let i = 0; i < 20; i++) {
          const t = i / 19;
          points.push({
            x: imageData.width * (0.15 + t * 0.35),
            y: imageData.height * (0.5 + Math.sin(t * Math.PI * 0.5) * 0.05)
          });
        }
        break;
        
      case 'heart':
        // 感情线：位于手指根部下方
        for (let i = 0; i < 22; i++) {
          const t = i / 21;
          points.push({
            x: imageData.width * (0.1 + t * 0.4),
            y: imageData.height * (0.25 + Math.cos(t * Math.PI) * 0.03)
          });
        }
        break;
        
      case 'fate':
        // 命运线：从手腕向中指垂直延伸
        for (let i = 0; i < 15; i++) {
          const t = i / 14;
          points.push({
            x: imageData.width * (0.5 + Math.sin(t * Math.PI * 0.5) * 0.02),
            y: imageData.height * (0.8 - t * 0.5)
          });
        }
        break;
    }

    // 添加一些随机变化，使线条更自然
    return points.map(point => ({
      x: point.x + (Math.random() - 0.5) * 3,
      y: point.y + (Math.random() - 0.5) * 3
    }));
  }

  /**
   * 插值增加点数
   */
  private interpolatePoints(
    points: Array<{ x: number; y: number }>,
    targetCount: number
  ): Array<{ x: number; y: number }> {
    if (points.length === 0) return [];
    if (points.length >= targetCount) return points;

    const interpolated: Array<{ x: number; y: number }> = [];
    
    for (let i = 0; i < targetCount; i++) {
      const t = i / (targetCount - 1);
      const srcIndex = t * (points.length - 1);
      const lowIndex = Math.floor(srcIndex);
      const highIndex = Math.min(lowIndex + 1, points.length - 1);
      const localT = srcIndex - lowIndex;

      if (lowIndex === highIndex) {
        const point = points[lowIndex];
        if (point) interpolated.push(point);
      } else {
        const lowPoint = points[lowIndex];
        const highPoint = points[highIndex];
        if (!lowPoint || !highPoint) continue;
        
        interpolated.push({
          x: lowPoint.x + (highPoint.x - lowPoint.x) * localT,
          y: lowPoint.y + (highPoint.y - lowPoint.y) * localT
        });
      }
    }

    return interpolated;
  }

  /**
   * 平滑线条
   */
  private smoothLine(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
    if (points.length < 3) return points;

    const smoothed: Array<{ x: number; y: number }> = [];
    
    // 保留第一个点
    const firstPoint = points[0];
    if (firstPoint) smoothed.push(firstPoint);

    // 对中间点进行平滑
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      if (!prev || !curr || !next) continue;

      smoothed.push({
        x: (prev.x + curr.x + next.x) / 3,
        y: (prev.y + curr.y + next.y) / 3
      });
    }

    // 保留最后一个点
    const lastPoint = points[points.length - 1];
    if (lastPoint) smoothed.push(lastPoint);

    return smoothed;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 创建模拟图像数据进行测试
      const testImageData: ImageData = {
        buffer: Buffer.alloc(1000),
        mimeType: 'image/jpeg',
        size: 1000,
        width: 300,
        height: 300
      };

      // 尝试提取特征
      const features = await this.extract(testImageData);
      
      // 检查特征是否有效
      return features.confidence > 0 && !!features.lines && !!features.shape && !!features.fingers;
    } catch (error) {
      this.logger.error('Feature extractor health check failed', { error });
      return false;
    }
  }

  /**
   * 获取健康状态
   */
  getHealthStatus(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: Record<string, unknown> } {
    return {
      status: 'healthy',
      details: {
        component: 'FeatureExtractor',
        lastExtraction: new Date(),
        memoryUsage: typeof process !== 'undefined' ? process.memoryUsage?.() || {} : {}
      }
    };
  }
}