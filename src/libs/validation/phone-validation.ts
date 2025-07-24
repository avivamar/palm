import type { CountryCode } from 'libphonenumber-js';
import { getCountryCallingCode, isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

// 手机号验证结果接口
export type PhoneValidationResult = {
  isValid: boolean;
  formatted?: string;
  country?: string;
  countryCode?: string;
  nationalNumber?: string;
  internationalNumber?: string;
  error?: string;
};

// 手机号重复检测结果接口
export type PhoneDuplicateCheckResult = {
  isDuplicate: boolean;
  existingUserId?: string;
  error?: string;
};

/**
 * 增强的国际手机号验证
 * @param phoneNumber 手机号码
 * @param defaultCountry 默认国家代码
 * @returns 验证结果
 */
export function validateInternationalPhoneNumber(
  phoneNumber: string,
  defaultCountry?: CountryCode,
): PhoneValidationResult {
  try {
    // 清理输入
    const cleanedNumber = phoneNumber.trim();

    if (!cleanedNumber) {
      return {
        isValid: false,
        error: 'Phone number is required',
      };
    }

    // 基础格式验证
    if (!isValidPhoneNumber(cleanedNumber, defaultCountry)) {
      return {
        isValid: false,
        error: 'Invalid phone number format',
      };
    }

    // 解析手机号
    const phoneNumberObj = parsePhoneNumber(cleanedNumber, defaultCountry);

    if (!phoneNumberObj) {
      return {
        isValid: false,
        error: 'Unable to parse phone number',
      };
    }

    // 检查是否为有效的手机号（非固定电话）
    if (phoneNumberObj.getType() && !['MOBILE', 'FIXED_LINE_OR_MOBILE'].includes(phoneNumberObj.getType()!)) {
      return {
        isValid: false,
        error: 'Please provide a mobile phone number',
      };
    }

    return {
      isValid: true,
      formatted: phoneNumberObj.format('E.164'),
      country: phoneNumberObj.country,
      countryCode: phoneNumberObj.countryCallingCode,
      nationalNumber: phoneNumberObj.nationalNumber,
      internationalNumber: phoneNumberObj.format('INTERNATIONAL'),
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

/**
 * 手机号归属地检测
 * @param phoneNumber 手机号码
 * @returns 国家信息
 */
export function detectPhoneNumberCountry(phoneNumber: string): {
  country?: string;
  countryCode?: string;
  callingCode?: string;
  error?: string;
} {
  try {
    const phoneNumberObj = parsePhoneNumber(phoneNumber);

    if (!phoneNumberObj || !phoneNumberObj.country) {
      return {
        error: 'Unable to detect country from phone number',
      };
    }

    return {
      country: phoneNumberObj.country,
      countryCode: phoneNumberObj.country,
      callingCode: phoneNumberObj.countryCallingCode,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Country detection failed',
    };
  }
}

/**
 * 手机号重复检测（需要数据库查询）
 * @param phoneNumber 格式化后的手机号
 * @returns 重复检测结果
 */
export async function checkPhoneNumberDuplicate(
  phoneNumber: string,
): Promise<PhoneDuplicateCheckResult> {
  try {
    // 这里需要导入数据库连接和查询
    // 为了避免循环依赖，我们将在使用时动态导入
    const { getSafeDB } = await import('@/libs/DB');
    const { usersSchema } = await import('@/models/Schema');
    const db = await getSafeDB();
    const { eq } = await import('drizzle-orm');

    // 查询数据库中是否存在相同手机号
    const existingUser = await db
      .select({ id: usersSchema.id })
      .from(usersSchema)
      .where(eq(usersSchema.phone, phoneNumber))
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
 * 格式化手机号显示
 * @param phoneNumber 手机号码
 * @param format 显示格式
 * @returns 格式化后的手机号
 */
export function formatPhoneNumberDisplay(
  phoneNumber: string,
  format: 'national' | 'international' | 'e164' = 'international',
): string {
  try {
    const phoneNumberObj = parsePhoneNumber(phoneNumber);

    if (!phoneNumberObj) {
      return phoneNumber; // 返回原始输入
    }

    switch (format) {
      case 'national':
        return phoneNumberObj.format('NATIONAL');
      case 'international':
        return phoneNumberObj.format('INTERNATIONAL');
      case 'e164':
        return phoneNumberObj.format('E.164');
      default:
        return phoneNumberObj.format('INTERNATIONAL');
    }
  } catch (error) {
    return phoneNumber; // 返回原始输入
  }
}

/**
 * 获取支持的国家列表（常用国家）
 */
export function getSupportedCountries(): Array<{
  code: CountryCode;
  name: string;
  callingCode: string;
}> {
  const countries: Array<{ code: CountryCode; name: string }> = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'CN', name: 'China' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'SG', name: 'Singapore' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'AR', name: 'Argentina' },
  ];

  return countries.map(country => ({
    ...country,
    callingCode: `+${getCountryCallingCode(country.code)}`,
  }));
}
