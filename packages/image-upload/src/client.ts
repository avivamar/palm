/**
 * Cloudflare R2 Client
 * 单一职责：管理R2连接和预签名URL生成
 */

import type { ImageUploadConfig, PresignedUrlData } from './types';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class R2Client {
  private client: S3Client;
  private config: ImageUploadConfig;

  constructor(config: ImageUploadConfig) {
    this.config = config;
    // Clean the endpoint by removing bucket name if it exists at the end
    let cleanEndpoint = config.endpoint;
    if (cleanEndpoint.endsWith(`/${config.bucket}`)) {
      cleanEndpoint = cleanEndpoint.replace(`/${config.bucket}`, '');
    }
    
    // Ensure endpoint starts with https://
    if (!cleanEndpoint.startsWith('http')) {
      cleanEndpoint = `https://${cleanEndpoint}`;
    }
    
    console.log('R2 Client Config:', {
      region: config.region,
      originalEndpoint: config.endpoint,
      cleanEndpoint,
      bucket: config.bucket,
    });
    
    this.client = new S3Client({
      region: config.region,
      endpoint: cleanEndpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * 生成预签名上传URL
   * 使用预签名URL模式减少服务器负载
   */
  async generatePresignedUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600, // 1 hour
  ): Promise<PresignedUrlData> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(this.client as any, command, { expiresIn });

      return {
        url,
        key,
      };
    } catch (error) {
      throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 生成安全的文件key
   * 防止路径遍历，使用UUID + 时间戳
   */
  generateSecureKey(fileName: string, userId: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

    return `images/${userId}/${timestamp}-${randomId}.${fileExtension}`;
  }

  /**
   * 构建公共访问URL
   */
  getPublicUrl(key: string): string {
    // Use the standard R2 public URL format
    return `https://${this.config.bucket}.r2.dev/${key}`;
  }
}

/**
 * 创建R2客户端实例
 */
export function createR2Client(): R2Client {
  console.log('Creating R2 Client with environment variables:', {
    bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME ? 'SET' : 'MISSING',
    region: process.env.CLOUDFLARE_R2_REGION ? 'SET' : 'MISSING',
    accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ? 'SET' : 'MISSING',
    secretKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT ? 'SET' : 'MISSING',
  });

  const config: ImageUploadConfig = {
    bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
    region: process.env.CLOUDFLARE_R2_REGION || 'auto',
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || '',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  };

  // 验证必需的环境变量
  const requiredEnvVars = [
    'CLOUDFLARE_R2_BUCKET_NAME',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_ENDPOINT',
  ];

  const missingVars = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error('R2 Client creation failed:', errorMsg);
    throw new Error(errorMsg);
  }

  console.log('R2 Client configuration:', {
    bucket: config.bucket,
    region: config.region,
    endpoint: config.endpoint,
    endpointHasBucket: config.endpoint.includes(config.bucket),
  });

  return new R2Client(config);
}
