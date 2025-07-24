/**
 * Image Security Validator
 * 三层安全验证：文件类型白名单、大小限制、文件头魔数验证
 */

import type { ValidationResult } from './types';
import { ValidationErrorCode } from './types';

// 支持的图片格式及其魔数 (文件头签名)
const MAGIC_NUMBERS = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // "RIFF"
  'image/gif': [0x47, 0x49, 0x46], // "GIF"
} as const;

const ALLOWED_MIME_TYPES = Object.keys(MAGIC_NUMBERS);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 验证文件是否为有效图片
 * 执行三层安全检查
 */
export async function validateImage(file: File): Promise<ValidationResult> {
  try {
    // 第一层：文件类型白名单验证
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${file.type}. Only JPEG, PNG, WebP, and GIF images are allowed.`,
        errorCode: ValidationErrorCode.INVALID_FILE_TYPE,
      };
    }

    // 第二层：文件大小限制
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed size is 10MB.`,
        errorCode: ValidationErrorCode.FILE_TOO_LARGE,
      };
    }

    // 第三层：文件头魔数验证 (防止文件类型伪造)
    const isValidHeader = await validateFileHeader(file);
    if (!isValidHeader) {
      return {
        isValid: false,
        error: 'Invalid file header. The file may be corrupted or not a genuine image.',
        errorCode: ValidationErrorCode.INVALID_FILE_HEADER,
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      errorCode: ValidationErrorCode.FILE_CORRUPTED,
    };
  }
}

/**
 * 验证文件头魔数
 * 通过检查文件的前几个字节来确认真实文件类型
 */
async function validateFileHeader(file: File): Promise<boolean> {
  try {
    const magicNumbers = MAGIC_NUMBERS[file.type as keyof typeof MAGIC_NUMBERS];
    if (!magicNumbers) {
      return false;
    }

    // 读取文件头部字节
    const headerSize = Math.max(...Object.values(MAGIC_NUMBERS).map(arr => arr.length));
    const arrayBuffer = await file.slice(0, headerSize).arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // 检查魔数匹配
    for (let i = 0; i < magicNumbers.length; i++) {
      if (uint8Array[i] !== magicNumbers[i]) {
        return false;
      }
    }

    // WebP 需要额外验证 "WEBP" 标识
    if (file.type === 'image/webp') {
      const webpSignature = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
      for (let i = 0; i < webpSignature.length; i++) {
        if (uint8Array[8 + i] !== webpSignature[i]) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('File header validation error:', error);
    return false;
  }
}

/**
 * 验证文件名安全性
 * 防止路径遍历攻击
 */
export function validateFileName(fileName: string): boolean {
  // 检查危险字符
  const dangerousChars = /[<>:"/\\|?*\x00-\x1F]/;
  if (dangerousChars.test(fileName)) {
    return false;
  }

  // 检查路径遍历
  if (fileName.includes('..') || fileName.includes('./') || fileName.includes('.\\')) {
    return false;
  }

  // 检查文件名长度
  if (fileName.length > 255) {
    return false;
  }

  return true;
}

/**
 * 获取用户友好的错误信息
 */
export function getValidationErrorMessage(errorCode: ValidationErrorCode): string {
  switch (errorCode) {
    case ValidationErrorCode.INVALID_FILE_TYPE:
      return 'Please select a valid image file (JPEG, PNG, WebP, or GIF).';
    case ValidationErrorCode.FILE_TOO_LARGE:
      return 'Image file is too large. Please choose a file smaller than 10MB.';
    case ValidationErrorCode.INVALID_FILE_HEADER:
      return 'The selected file appears to be corrupted or is not a valid image.';
    case ValidationErrorCode.FILE_CORRUPTED:
      return 'Unable to process the file. Please try again with a different image.';
    default:
      return 'An error occurred while validating your image. Please try again.';
  }
}
