import { z } from 'zod';

// 邮箱验证结果接口
export type EmailValidationResult = {
  isValid: boolean;
  normalized?: string;
  domain?: string;
  isDisposable?: boolean;
  isCorporate?: boolean;
  error?: string;
};

// 一次性邮箱域名列表（常见的）
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.org',
  'temp-mail.org',
  'throwaway.email',
  'yopmail.com',
  'maildrop.cc',
  'sharklasers.com',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'bccto.me',
  'chacuo.net',
  'dispostable.com',
  'fakeinbox.com',
  'hide.biz.st',
  'mytrashmail.com',
  'mailnesia.com',
  'trashmail.at',
  'trashmail.com',
  'trashmail.de',
  'trashmail.me',
  'trashmail.net',
  'trashmail.org',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfmail.org',
]);

// 企业邮箱域名列表（常见的）
const CORPORATE_EMAIL_DOMAINS = new Set([
  'company.com',
  'corp.com',
  'enterprise.com',
  'business.com',
  'office.com',
  'work.com',
]);

// 免费邮箱域名列表
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'mail.com',
  'zoho.com',
  'yandex.com',
  '163.com',
  '126.com',
  'qq.com',
  'sina.com',
  'sohu.com',
  'yeah.net',
]);

/**
 * 增强的邮箱验证
 * @param email 邮箱地址
 * @returns 验证结果
 */
export function validateEnhancedEmail(email: string): EmailValidationResult {
  try {
    // 清理输入
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail) {
      return {
        isValid: false,
        error: 'Email is required',
      };
    }

    // 基础格式验证
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) {
      return {
        isValid: false,
        error: 'Invalid email format',
      };
    }

    // 更严格的邮箱格式验证
    const strictEmailRegex = /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    if (!strictEmailRegex.test(cleanedEmail)) {
      return {
        isValid: false,
        error: 'Invalid email format',
      };
    }

    // 提取域名
    const domain = cleanedEmail.split('@')[1];

    // 检查域名是否存在
    if (!domain) {
      return {
        isValid: false,
        error: 'Invalid email format - missing domain',
      };
    }

    // 检查域名长度
    if (domain.length > 253) {
      return {
        isValid: false,
        error: 'Domain name too long',
      };
    }

    // 检查是否为一次性邮箱
    const isDisposable = DISPOSABLE_EMAIL_DOMAINS.has(domain);

    // 检查是否为企业邮箱（简单判断：不在免费邮箱列表中且不是一次性邮箱）
    const isCorporate = !FREE_EMAIL_DOMAINS.has(domain) && !isDisposable && !domain.includes('.');

    return {
      isValid: true,
      normalized: cleanedEmail,
      domain,
      isDisposable,
      isCorporate,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

/**
 * 检查邮箱是否为一次性邮箱
 * @param email 邮箱地址
 * @returns 是否为一次性邮箱
 */
export function isDisposableEmail(email: string): boolean {
  try {
    const domain = email.toLowerCase().split('@')[1];
    if (!domain) {
      return false;
    }
    return DISPOSABLE_EMAIL_DOMAINS.has(domain);
  } catch {
    return false;
  }
}

/**
 * 检查邮箱是否为企业邮箱
 * @param email 邮箱地址
 * @returns 是否为企业邮箱
 */
export function isCorporateEmail(email: string): boolean {
  try {
    const domain = email.toLowerCase().split('@')[1];
    if (!domain) {
      return false;
    }
    return CORPORATE_EMAIL_DOMAINS.has(domain) || (!FREE_EMAIL_DOMAINS.has(domain) && !DISPOSABLE_EMAIL_DOMAINS.has(domain));
  } catch {
    return false;
  }
}

/**
 * 邮箱重复检测（需要数据库查询）
 * @param email 邮箱地址
 * @returns 重复检测结果
 */
export async function checkEmailDuplicate(
  email: string,
): Promise<{
  isDuplicate: boolean;
  existingUserId?: string;
  error?: string;
}> {
  try {
    // 动态导入避免循环依赖
    const { getSafeDB } = await import('@/libs/DB');
    const { usersSchema } = await import('@/models/Schema');
    const { eq } = await import('drizzle-orm');

    const normalizedEmail = email.toLowerCase().trim();
    const db = await getSafeDB();

    // 查询数据库中是否存在相同邮箱
    const existingUser = await db
      .select({ id: usersSchema.id })
      .from(usersSchema)
      .where(eq(usersSchema.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        isDuplicate: true,
        existingUserId: existingUser[0].id,
      };
    }

    return {
      isDuplicate: false,
    };
  } catch (error) {
    return {
      isDuplicate: false,
      error: error instanceof Error ? error.message : 'Database query failed',
    };
  }
}

/**
 * Zod 邮箱验证 Schema
 */
export const enhancedEmailSchema = z.string().refine(
  (email) => {
    if (!email || email.trim() === '') {
      return true; // 允许空值，因为邮箱可能是可选的
    }
    const result = validateEnhancedEmail(email);
    return result.isValid;
  },
  {
    message: 'Please enter a valid email address',
  },
);

/**
 * 严格的邮箱验证 Schema（不允许一次性邮箱）
 */
export const strictEmailSchema = z.string().refine(
  (email) => {
    if (!email || email.trim() === '') {
      return true;
    }
    const result = validateEnhancedEmail(email);
    return result.isValid && !result.isDisposable;
  },
  {
    message: 'Please enter a valid email address (disposable emails are not allowed)',
  },
);

/**
 * 企业邮箱验证 Schema
 */
export const corporateEmailSchema = z.string().refine(
  (email) => {
    if (!email || email.trim() === '') {
      return true;
    }
    const result = validateEnhancedEmail(email);
    return result.isValid && result.isCorporate;
  },
  {
    message: 'Please enter a corporate email address',
  },
);
