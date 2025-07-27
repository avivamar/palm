import sharp from 'sharp';
import crypto from 'crypto';
import { AILogger } from '@rolitt/ai-core';
import { PalmConfig } from '../config';
import { ImageData, ImageProcessingError } from '../types';

/**
 * 处理后的图像数据
 */
export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  channels: number;
  format: string;
  metadata: {
    originalSize: number;
    processedSize: number;
    compressionRatio: number;
    processingSteps: string[];
  };
}

/**
 * 图像处理器
 * 负责图像预处理、格式转换、质量优化等
 */
export class ImageProcessor {
  private logger: AILogger;

  constructor(private config: PalmConfig, logger?: AILogger) {
    this.logger = logger || AILogger.getInstance();
  }

  /**
   * 处理图像
   * 执行完整的图像预处理流程
   */
  async process(imageData: ImageData): Promise<ProcessedImage> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting image processing', {
        originalSize: imageData.size,
        mimeType: imageData.mimeType,
        dimensions: `${imageData.width}x${imageData.height}`,
      });

      // 验证图像数据
      this._validateImageData(imageData);

      // 创建 Sharp 实例
      let sharpInstance = sharp(imageData.buffer);
      const processingSteps: string[] = [];

      
      // 1. 格式标准化
      if (imageData.mimeType !== 'image/jpeg') {
        sharpInstance = sharpInstance.jpeg({ quality: 90 });
        processingSteps.push('format_conversion');
      }

      // 2. 尺寸优化
      const targetSize = this._calculateOptimalSize(imageData.width, imageData.height);
      if (targetSize.width !== imageData.width || targetSize.height !== imageData.height) {
        sharpInstance = sharpInstance.resize(targetSize.width, targetSize.height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
        processingSteps.push('resize');
      }

      // 3. 图像增强
      if (this.config.imageProcessing.preprocessingSteps.includes('normalize')) {
        sharpInstance = sharpInstance.normalize();
        processingSteps.push('normalize');
      }

      if (this.config.imageProcessing.preprocessingSteps.includes('enhance')) {
        sharpInstance = sharpInstance.sharpen();
        processingSteps.push('enhance');
      }

      if (this.config.imageProcessing.preprocessingSteps.includes('denoise')) {
        sharpInstance = sharpInstance.median(3);
        processingSteps.push('denoise');
      }

      // 4. 质量压缩
      sharpInstance = sharpInstance.jpeg({
        quality: Math.round(this.config.imageProcessing.compressionQuality * 100),
        progressive: true,
        mozjpeg: true,
      });
      processingSteps.push('compression');

      // 执行处理
      const processedBuffer = await sharpInstance.toBuffer({ resolveWithObject: true });
      
      const processingTime = Date.now() - startTime;
      const compressionRatio = imageData.size / processedBuffer.info.size;

      this.logger.info('Image processing completed', {
        processingTime,
        originalSize: imageData.size,
        processedSize: processedBuffer.info.size,
        compressionRatio,
        steps: processingSteps,
      });

      return {
        buffer: processedBuffer.data,
        width: processedBuffer.info.width,
        height: processedBuffer.info.height,
        channels: processedBuffer.info.channels,
        format: processedBuffer.info.format,
        metadata: {
          originalSize: imageData.size,
          processedSize: processedBuffer.info.size,
          compressionRatio,
          processingSteps,
        },
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error('Image processing failed', {
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new ImageProcessingError(
        `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { processingTime, originalError: error }
      );
    }
  }

  /**
   * 计算图像哈希值
   * 用于缓存键生成和重复检测
   */
  async calculateHash(buffer: Buffer): Promise<string> {
    try {
      // 使用 SHA-256 计算哈希
      const hash = crypto.createHash('sha256');
      hash.update(buffer);
      return hash.digest('hex');
    } catch (error) {
      throw new ImageProcessingError(
        `Failed to calculate image hash: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 提取图像基本信息
   */
  async extractMetadata(buffer: Buffer): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
    hasAlpha: boolean;
    colorSpace: string;
  }> {
    try {
      const metadata = await sharp(buffer).metadata();
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length,
        hasAlpha: metadata.hasAlpha || false,
        colorSpace: metadata.space || 'unknown',
      };
    } catch (error) {
      throw new ImageProcessingError(
        `Failed to extract image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 创建一个小的测试图像
      const testBuffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      }).jpeg().toBuffer();

      // 尝试处理测试图像
      await sharp(testBuffer).metadata();
      
      return true;
    } catch (error) {
      this.logger.error('Image processor health check failed', { error });
      return false;
    }
  }

  /**
   * 验证图像数据
   */
  private _validateImageData(imageData: ImageData): void {
    // 检查文件大小
    if (imageData.size > this.config.imageProcessing.maxFileSize) {
      throw new ImageProcessingError(
        `Image size ${imageData.size} exceeds maximum allowed size ${this.config.imageProcessing.maxFileSize}`,
        { size: imageData.size, maxSize: this.config.imageProcessing.maxFileSize }
      );
    }

    // 检查格式
    if (!this.config.imageProcessing.supportedFormats.includes(imageData.mimeType)) {
      throw new ImageProcessingError(
        `Unsupported image format: ${imageData.mimeType}`,
        { format: imageData.mimeType, supportedFormats: this.config.imageProcessing.supportedFormats }
      );
    }

    // 检查分辨率
    const minRes = this.config.imageProcessing.minResolution;
    const maxRes = this.config.imageProcessing.maxResolution;
    
    if (imageData.width < minRes.width || imageData.height < minRes.height) {
      throw new ImageProcessingError(
        `Image resolution ${imageData.width}x${imageData.height} is below minimum ${minRes.width}x${minRes.height}`,
        { width: imageData.width, height: imageData.height, minResolution: minRes }
      );
    }

    if (imageData.width > maxRes.width || imageData.height > maxRes.height) {
      throw new ImageProcessingError(
        `Image resolution ${imageData.width}x${imageData.height} exceeds maximum ${maxRes.width}x${maxRes.height}`,
        { width: imageData.width, height: imageData.height, maxResolution: maxRes }
      );
    }
  }

  /**
   * 计算最优尺寸
   */
  private _calculateOptimalSize(width: number, height: number): { width: number; height: number } {
    const maxRes = this.config.imageProcessing.maxResolution;
    
    // 如果图像已经在合理范围内，不需要调整
    if (width <= maxRes.width && height <= maxRes.height) {
      return { width, height };
    }

    // 计算缩放比例，保持宽高比
    const scaleX = maxRes.width / width;
    const scaleY = maxRes.height / height;
    const scale = Math.min(scaleX, scaleY);

    return {
      width: Math.round(width * scale),
      height: Math.round(height * scale),
    };
  }
}