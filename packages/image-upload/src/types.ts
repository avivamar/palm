/**
 * Image Upload Package Types
 * 专注图片上传的类型定义，为ChatGPT集成预留接口
 */

export type ImageUploadConfig = {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  maxFileSize: number; // bytes, default 10MB
  allowedTypes: string[];
};

export type ImageFile = {
  file: File;
  preview?: string;
};

export type UploadedImage = {
  id: string;
  url: string;
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  userId: string;
  // ChatGPT 集成预留字段
  description?: string;
  tags?: string[];
  aiAnalyzed?: boolean;
  aiDescription?: string;
};

export type ValidationResult = {
  isValid: boolean;
  error?: string;
  errorCode?: ValidationErrorCode;
};

export enum ValidationErrorCode {
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_HEADER = 'INVALID_FILE_HEADER',
  FILE_CORRUPTED = 'FILE_CORRUPTED',
}

export type UploadProgress = {
  uploaded: number;
  total: number;
  percentage: number;
};

export type PresignedUrlData = {
  url: string;
  key: string;
  fields?: Record<string, string>;
};

export type UploadResult = {
  success: boolean;
  data?: UploadedImage;
  error?: string;
  errorCode?: string;
};

export type UseImageUploadOptions = {
  maxFileSize?: number;
  allowedTypes?: string[];
  onSuccess?: (result: UploadedImage) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: UploadProgress) => void;
};

export type UseImageUploadReturn = {
  uploadImage: (file: File) => Promise<UploadResult>;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  reset: () => void;
};

// 数据库表类型定义
export type UserImage = {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  url: string;
  r2_key: string;
  created_at: Date;
  updated_at: Date;
  // ChatGPT 集成字段
  description?: string;
  tags?: string[];
  ai_analyzed: boolean;
  ai_description?: string;
};
