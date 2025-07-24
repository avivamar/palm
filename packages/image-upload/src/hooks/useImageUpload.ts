/**
 * React Hook for Image Upload
 * 提供简单易用的图片上传状态管理
 */

'use client';

import type {
  UploadProgress,
  UploadResult,
  UseImageUploadOptions,
  UseImageUploadReturn,
} from '../types';
import { useCallback, useState } from 'react';
import { uploadImage } from '../index';

/**
 * 图片上传 React Hook
 * 提供上传状态、进度追踪和错误处理
 */
export function useImageUpload(
  userId: string,
  options: UseImageUploadOptions = {},
): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    onSuccess,
    onError,
    onProgress,
  } = options;

  const handleUpload = useCallback(async (file: File): Promise<UploadResult> => {
    // 重置状态
    setIsUploading(true);
    setError(null);
    setProgress(null);

    try {
      const result = await uploadImage(
        file,
        userId,
        (progressData) => {
          setProgress(progressData);
          onProgress?.(progressData);
        },
      );

      if (result.success && result.data) {
        onSuccess?.(result.data);
      } else {
        const errorMessage = result.error || 'Upload failed';
        setError(errorMessage);
        onError?.(errorMessage);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsUploading(false);
    }
  }, [userId, onSuccess, onError, onProgress]);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    uploadImage: handleUpload,
    isUploading,
    progress,
    error,
    reset,
  };
}

/**
 * 简化版Hook：仅返回上传函数和状态
 */
export function useSimpleImageUpload(userId: string) {
  const { uploadImage: upload, isUploading, error } = useImageUpload(userId);

  return {
    upload,
    isUploading,
    error,
  };
}

/**
 * 批量上传Hook（为未来扩展预留）
 */
export function useBatchImageUpload(
  userId: string,
) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const uploadMultiple = useCallback(async (files: File[]) => {
    setIsUploading(true);
    setUploadedFiles([]);
    setFailedFiles([]);
    setProgress(0);

    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file) {
        continue;
      }

      try {
        const result = await uploadImage(file, userId);

        if (result.success) {
          setUploadedFiles(prev => [...prev, file.name]);
        } else {
          setFailedFiles(prev => [...prev, file.name]);
        }

        results.push(result);
      } catch (error) {
        setFailedFiles(prev => [...prev, file.name]);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }

      // 更新进度
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setIsUploading(false);
    return results;
  }, [userId]);

  const reset = useCallback(() => {
    setIsUploading(false);
    setUploadedFiles([]);
    setFailedFiles([]);
    setProgress(0);
  }, []);

  return {
    uploadMultiple,
    isUploading,
    uploadedFiles,
    failedFiles,
    progress,
    reset,
  };
}
