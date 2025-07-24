/**
 * @rolitt/image-upload - Main Export
 * 极简图片上传包：3个核心函数 + React Hook
 */

import type {
  PresignedUrlData,
  UploadedImage,
  UploadResult,
} from './types';
import { createR2Client } from './client';
import { validateFileName, validateImage } from './validator';

export { createR2Client } from './client';
// 导出类型
export type * from './types';
export { getValidationErrorMessage, validateFileName, validateImage } from './validator';

/**
 * 核心函数1: 生成预签名上传URL
 * 为客户端直传提供安全的上传地址
 */
export async function generateUploadUrl(
  fileName: string,
  contentType: string,
  userId: string,
): Promise<PresignedUrlData> {
  try {
    // 验证文件名安全性
    if (!validateFileName(fileName)) {
      throw new Error('Invalid file name. Please use a different name.');
    }

    const r2Client = createR2Client();
    const key = r2Client.generateSecureKey(fileName, userId);

    return await r2Client.generatePresignedUrl(key, contentType);
  } catch (error) {
    throw new Error(`Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 核心函数2: 完整的图片上传流程
 * 集成验证、上传、数据库记录
 */
export async function uploadImage(
  file: File,
  userId: string,
  onProgress?: (progress: { uploaded: number; total: number; percentage: number }) => void,
): Promise<UploadResult> {
  try {
    // 步骤1: 验证图片文件
    const validation = await validateImage(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'File validation failed',
        errorCode: validation.errorCode,
      };
    }

    // 步骤2: 生成预签名URL
    const presignedData = await generateUploadUrl(file.name, file.type, userId);

    // 步骤3: 上传到Cloudflare R2
    const uploadSuccess = await uploadToR2(file, presignedData.url, onProgress);
    if (!uploadSuccess) {
      return {
        success: false,
        error: 'Failed to upload image to cloud storage',
      };
    }

    // 步骤4: 保存到数据库 (通过API)
    const imageRecord = await saveImageRecord({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      key: presignedData.key,
      userId,
    });

    const r2Client = createR2Client();
    const publicUrl = r2Client.getPublicUrl(presignedData.key);

    const result: UploadedImage = {
      id: imageRecord.id,
      url: publicUrl,
      key: presignedData.key,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date(),
      userId,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * 核心函数3: 获取用户的图片列表
 * 为ChatGPT集成提供图片管理
 */
export async function getUserImages(userId: string): Promise<UploadedImage[]> {
  try {
    const response = await fetch(`/api/user/images?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user images');
    }

    const data = await response.json();
    return data.images || [];
  } catch (error) {
    console.error('Error fetching user images:', error);
    return [];
  }
}

/**
 * 辅助函数：上传文件到R2
 */
async function uploadToR2(
  file: File,
  presignedUrl: string,
  onProgress?: (progress: { uploaded: number; total: number; percentage: number }) => void,
): Promise<boolean> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          onProgress({
            uploaded: event.loaded,
            total: event.total,
            percentage,
          });
        }
      });
    }

    // 监听上传完成
    xhr.addEventListener('load', () => {
      resolve(xhr.status >= 200 && xhr.status < 300);
    });

    // 监听上传错误
    xhr.addEventListener('error', () => {
      resolve(false);
    });

    // 发起上传请求
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

/**
 * 辅助函数：保存图片记录到数据库
 */
async function saveImageRecord(data: {
  fileName: string;
  fileSize: number;
  mimeType: string;
  key: string;
  userId: string;
}): Promise<{ id: string }> {
  const response = await fetch('/api/user/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to save image record');
  }

  return await response.json();
}
