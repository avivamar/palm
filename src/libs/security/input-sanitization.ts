import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// 输入清理结果接口
export type SanitizationResult = {
  sanitized: string;
  wasModified: boolean;
  removedElements?: string[];
  warnings?: string[];
};

// 危险模式列表
const DANGEROUS_PATTERNS = [
  // XSS 攻击模式
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>.*?<\/embed>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi,

  // SQL 注入模式
  /('|(--)|(;)|(\|)|(\*))/g,
  /(exec(\s|\+)+(s|x)p\w+)/gi,
  /union[\s\w]*select/gi,
  /select[\s\w]*from/gi,
  /insert[\s\w]*into/gi,
  /delete[\s\w]*from/gi,
  /update[\s\w]*set/gi,
  /drop[\s\w]*table/gi,

  // 路径遍历攻击
  /\.\.\/|\.\.\\/g,

  // 命令注入
  /[;&|`$(){}[\]]/g,
];

// SQL 关键词列表
const SQL_KEYWORDS = [
  'SELECT',
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'CREATE',
  'ALTER',
  'UNION',
  'WHERE',
  'FROM',
  'INTO',
  'VALUES',
  'SET',
  'TABLE',
  'DATABASE',
  'SCHEMA',
  'INDEX',
  'VIEW',
  'PROCEDURE',
  'FUNCTION',
  'TRIGGER',
  'EXEC',
  'EXECUTE',
  'DECLARE',
  'CAST',
  'CONVERT',
];

/**
 * 检测潜在的恶意输入
 * @param input 输入字符串
 * @returns 检测结果
 */
export function detectMaliciousInput(input: string): {
  isMalicious: boolean;
  threats: string[];
  riskLevel: 'low' | 'medium' | 'high';
} {
  const threats: string[] = [];
  let riskLevel = 'low' as 'low' | 'medium' | 'high';

  // 检测危险模式
  DANGEROUS_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(input)) {
      switch (index) {
        case 0:
        case 1:
        case 2:
          threats.push('XSS attempt detected');
          riskLevel = 'high';
          break;
        case 3:
        case 4:
        case 5:
          threats.push('Iframe/Object injection detected');
          riskLevel = 'high';
          break;
        case 6:
        case 7:
          threats.push('Meta/Link injection detected');
          riskLevel = 'medium';
          break;
        default:
          if (index <= 15) {
            threats.push('SQL injection attempt detected');
            riskLevel = 'high';
          } else if (index <= 16) {
            threats.push('Path traversal attempt detected');
            riskLevel = 'high';
          } else {
            threats.push('Command injection attempt detected');
            riskLevel = 'high';
          }
      }
    }
  });

  // 检测 SQL 关键词
  const upperInput = input.toUpperCase();
  const foundKeywords = SQL_KEYWORDS.filter(keyword =>
    upperInput.includes(keyword),
  );

  if (foundKeywords.length > 2) {
    threats.push('Multiple SQL keywords detected');
    if (riskLevel !== 'high') {
      riskLevel = 'medium';
    }
  }

  return {
    isMalicious: threats.length > 0,
    threats,
    riskLevel,
  };
}

/**
 * 清理 HTML 内容
 * @param html HTML 字符串
 * @param allowedTags 允许的标签
 * @returns 清理结果
 */
export function sanitizeHTML(html: string, allowedTags?: string[]): SanitizationResult {
  const original = html;

  // 配置 DOMPurify
  const config: any = {
    ALLOWED_TAGS: allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: ['class'],
    REMOVE_DATA_ATTRIBUTES: true,
    REMOVE_UNKNOWN_PROTOCOLS: true,
    USE_PROFILES: { html: true },
  };

  const sanitized = DOMPurify.sanitize(html, config).toString();

  return {
    sanitized,
    wasModified: original !== sanitized,
    warnings: original !== sanitized ? ['HTML content was modified for security'] : undefined,
  };
}

/**
 * 清理用户输入文本
 * @param input 输入文本
 * @param options 清理选项
 * @returns 清理结果
 */
export function sanitizeUserInput(
  input: string,
  options: {
    allowHTML?: boolean;
    maxLength?: number;
    allowedChars?: RegExp;
    trimWhitespace?: boolean;
  } = {},
): SanitizationResult {
  const {
    allowHTML = false,
    maxLength = 1000,
    allowedChars,
    trimWhitespace = true,
  } = options;

  let sanitized = input;
  const warnings: string[] = [];
  const removedElements: string[] = [];

  // 检测恶意输入
  const maliciousCheck = detectMaliciousInput(sanitized);
  if (maliciousCheck.isMalicious) {
    warnings.push(...maliciousCheck.threats);
    if (maliciousCheck.riskLevel === 'high') {
      // 对于高风险输入，进行严格清理
      sanitized = sanitized.replace(/[<>"'&]/g, '');
      removedElements.push('Dangerous characters removed');
    }
  }

  // 清理 HTML
  if (!allowHTML) {
    const htmlRegex = /<[^>]*>/g;
    if (htmlRegex.test(sanitized)) {
      sanitized = sanitized.replace(htmlRegex, '');
      removedElements.push('HTML tags removed');
    }
  } else {
    const htmlResult = sanitizeHTML(sanitized);
    sanitized = htmlResult.sanitized;
    if (htmlResult.wasModified) {
      removedElements.push('Unsafe HTML elements removed');
    }
  }

  // 移除控制字符
  const controlCharsRegex = /[\x00-\x1F\x7F-\x9F]/g;
  if (controlCharsRegex.test(sanitized)) {
    sanitized = sanitized.replace(controlCharsRegex, '');
    removedElements.push('Control characters removed');
  }

  // 应用字符白名单
  if (allowedChars && !allowedChars.test(sanitized)) {
    sanitized = sanitized.replace(new RegExp(`[^${allowedChars.source}]`, 'g'), '');
    removedElements.push('Invalid characters removed');
  }

  // 长度限制
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
    warnings.push(`Input truncated to ${maxLength} characters`);
  }

  // 清理空白字符
  if (trimWhitespace) {
    const beforeTrim = sanitized;
    sanitized = sanitized.trim().replace(/\s+/g, ' ');
    if (beforeTrim !== sanitized) {
      removedElements.push('Extra whitespace removed');
    }
  }

  return {
    sanitized,
    wasModified: input !== sanitized,
    removedElements: removedElements.length > 0 ? removedElements : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * 清理文件名
 * @param filename 文件名
 * @returns 清理后的文件名
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^\w.-]/g, '_') // 只允许字母、数字、点、下划线、连字符
    .replace(/\.{2,}/g, '.') // 防止多个连续的点
    .replace(/^[._-]+|[._-]+$/g, '') // 移除开头和结尾的特殊字符
    .substring(0, 255); // 限制长度
}

/**
 * 清理 URL
 * @param url URL 字符串
 * @returns 清理后的 URL
 */
export function sanitizeURL(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }

    // 移除危险的查询参数
    const dangerousParams = ['javascript', 'data', 'vbscript'];
    dangerousParams.forEach((param) => {
      urlObj.searchParams.delete(param);
    });

    return urlObj.toString();
  } catch {
    return null;
  }
}

/**
 * Zod 安全字符串验证 Schema
 */
export const secureStringSchema = (options: {
  maxLength?: number;
  allowHTML?: boolean;
  allowedChars?: RegExp;
} = {}) => z.string().transform((val, ctx) => {
  const result = sanitizeUserInput(val, options);

  if (result.warnings && result.warnings.some(w => w.includes('SQL') || w.includes('XSS'))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Input contains potentially malicious content',
    });
    return z.NEVER;
  }

  return result.sanitized;
});

/**
 * 安全的姓名验证 Schema
 */
export const secureNameSchema = secureStringSchema({
  maxLength: 100,
  allowHTML: false,
  allowedChars: /[a-z\s\-'.,]/i,
});

/**
 * 安全的地址验证 Schema
 */
export const secureAddressSchema = secureStringSchema({
  maxLength: 200,
  allowHTML: false,
  allowedChars: /[a-z0-9\s\-'.,#]/i,
});

/**
 * 安全的城市名验证 Schema
 */
export const secureCitySchema = secureStringSchema({
  maxLength: 50,
  allowHTML: false,
  allowedChars: /[a-z\s\-'.,]/i,
});

/**
 * 安全的邮政编码验证 Schema
 */
export const securePostalCodeSchema = secureStringSchema({
  maxLength: 20,
  allowHTML: false,
  allowedChars: /[a-z0-9\s\-]/i,
});
