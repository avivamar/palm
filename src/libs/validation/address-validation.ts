import { z } from 'zod';

// 地址验证结果接口
export type AddressValidationResult = {
  isValid: boolean;
  normalized?: {
    country: string;
    state?: string;
    city: string;
    line1: string;
    line2?: string;
    postalCode: string;
  };
  suggestions?: string[];
  error?: string;
};

// 国家特定的邮政编码格式
const POSTAL_CODE_PATTERNS: Record<string, RegExp> = {
  US: /^\d{5}(-\d{4})?$/, // 12345 or 12345-6789
  CA: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i, // A1A 1A1 or A1A1A1
  GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, // SW1A 1AA
  AU: /^\d{4}$/, // 1234
  DE: /^\d{5}$/, // 12345
  FR: /^\d{5}$/, // 12345
  ES: /^\d{5}$/, // 12345
  IT: /^\d{5}$/, // 12345
  JP: /^\d{3}-\d{4}$/, // 123-4567
  KR: /^\d{5}$/, // 12345
  CN: /^\d{6}$/, // 123456
  HK: /^\d{6}$/, // 123456
  TW: /^\d{3}(\d{2})?$/, // 123 or 12345
  SG: /^\d{6}$/, // 123456
  IN: /^\d{6}$/, // 123456
  BR: /^\d{5}-?\d{3}$/, // 12345-678 or 12345678
  MX: /^\d{5}$/, // 12345
  AR: /^[A-Z]\d{4}[A-Z]{3}$/, // A1234ABC
};

// 美国州代码验证
const US_STATE_CODES = new Set([
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
  'DC', // District of Columbia
]);

// 加拿大省代码验证
const CA_PROVINCE_CODES = new Set([
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NS',
  'NT',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
]);

// 需要州/省信息的国家
const COUNTRIES_REQUIRING_STATE = new Set(['US', 'CA', 'AU', 'BR', 'IN']);

/**
 * 验证邮政编码格式
 * @param postalCode 邮政编码
 * @param country 国家代码
 * @returns 是否有效
 */
export function validatePostalCode(postalCode: string, country: string): boolean {
  if (!postalCode || !country) {
    return false;
  }

  const pattern = POSTAL_CODE_PATTERNS[country.toUpperCase()];
  if (!pattern) {
    // 如果没有特定模式，使用通用验证（至少包含数字或字母）
    return /^[A-Z0-9\s-]{3,10}$/i.test(postalCode.trim());
  }

  return pattern.test(postalCode.trim());
}

/**
 * 验证州/省代码
 * @param state 州/省代码
 * @param country 国家代码
 * @returns 是否有效
 */
export function validateStateCode(state: string, country: string): boolean {
  if (!state || !country) {
    return !COUNTRIES_REQUIRING_STATE.has(country.toUpperCase());
  }

  const upperState = state.toUpperCase();
  const upperCountry = country.toUpperCase();

  switch (upperCountry) {
    case 'US':
      return US_STATE_CODES.has(upperState);
    case 'CA':
      return CA_PROVINCE_CODES.has(upperState);
    default:
      return true; // 对于其他国家，暂时接受任何值
  }
}

/**
 * 增强的地址验证
 * @param address 地址对象
 * @returns 验证结果
 */
export function validateEnhancedAddress(address: {
  country: string;
  state?: string;
  city: string;
  line1: string;
  line2?: string;
  postalCode: string;
}): AddressValidationResult {
  try {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // 验证必填字段
    if (!address.country?.trim()) {
      errors.push('Country is required');
    }
    if (!address.city?.trim()) {
      errors.push('City is required');
    }
    if (!address.line1?.trim()) {
      errors.push('Address line 1 is required');
    }
    if (!address.postalCode?.trim()) {
      errors.push('Postal code is required');
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        error: errors.join(', '),
      };
    }

    const country = address.country.toUpperCase();

    // 验证邮政编码格式
    if (!validatePostalCode(address.postalCode, country)) {
      errors.push(`Invalid postal code format for ${country}`);

      // 提供格式建议
      const pattern = POSTAL_CODE_PATTERNS[country];
      if (pattern) {
        switch (country) {
          case 'US':
            suggestions.push('US postal code should be in format: 12345 or 12345-6789');
            break;
          case 'CA':
            suggestions.push('Canadian postal code should be in format: A1A 1A1');
            break;
          case 'GB':
            suggestions.push('UK postal code should be in format: SW1A 1AA');
            break;
          case 'JP':
            suggestions.push('Japanese postal code should be in format: 123-4567');
            break;
          default:
            suggestions.push(`Please check the postal code format for ${country}`);
        }
      }
    }

    // 验证州/省代码
    if (COUNTRIES_REQUIRING_STATE.has(country) && !validateStateCode(address.state || '', country)) {
      errors.push(`Invalid or missing state/province code for ${country}`);

      switch (country) {
        case 'US':
          suggestions.push('Please provide a valid US state code (e.g., CA, NY, TX)');
          break;
        case 'CA':
          suggestions.push('Please provide a valid Canadian province code (e.g., ON, BC, QC)');
          break;
      }
    }

    // 地址长度验证
    if (address.line1.length > 100) {
      errors.push('Address line 1 is too long (max 100 characters)');
    }
    if (address.line2 && address.line2.length > 100) {
      errors.push('Address line 2 is too long (max 100 characters)');
    }
    if (address.city.length > 50) {
      errors.push('City name is too long (max 50 characters)');
    }

    // 特殊字符验证
    const invalidCharsRegex = /[<>"'&]/;
    if (invalidCharsRegex.test(address.line1)
      || (address.line2 && invalidCharsRegex.test(address.line2))
      || invalidCharsRegex.test(address.city)) {
      errors.push('Address contains invalid characters');
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        error: errors.join(', '),
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      };
    }

    // 标准化地址
    const normalized = {
      country,
      state: address.state?.toUpperCase().trim(),
      city: address.city.trim(),
      line1: address.line1.trim(),
      line2: address.line2?.trim(),
      postalCode: address.postalCode.trim().toUpperCase(),
    };

    return {
      isValid: true,
      normalized,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

/**
 * 获取国家列表
 */
export function getSupportedCountries(): Array<{
  code: string;
  name: string;
  requiresState: boolean;
}> {
  return [
    { code: 'US', name: 'United States', requiresState: true },
    { code: 'CA', name: 'Canada', requiresState: true },
    { code: 'GB', name: 'United Kingdom', requiresState: false },
    { code: 'AU', name: 'Australia', requiresState: true },
    { code: 'DE', name: 'Germany', requiresState: false },
    { code: 'FR', name: 'France', requiresState: false },
    { code: 'ES', name: 'Spain', requiresState: false },
    { code: 'IT', name: 'Italy', requiresState: false },
    { code: 'JP', name: 'Japan', requiresState: false },
    { code: 'KR', name: 'South Korea', requiresState: false },
    { code: 'CN', name: 'China', requiresState: false },
    { code: 'HK', name: 'Hong Kong', requiresState: false },
    { code: 'TW', name: 'Taiwan', requiresState: false },
    { code: 'SG', name: 'Singapore', requiresState: false },
    { code: 'IN', name: 'India', requiresState: true },
    { code: 'BR', name: 'Brazil', requiresState: true },
    { code: 'MX', name: 'Mexico', requiresState: false },
    { code: 'AR', name: 'Argentina', requiresState: false },
  ];
}

/**
 * 获取美国州列表
 */
export function getUSStates(): Array<{ code: string; name: string }> {
  return [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' },
  ];
}

/**
 * 获取加拿大省列表
 */
export function getCanadianProvinces(): Array<{ code: string; name: string }> {
  return [
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'NT', name: 'Northwest Territories' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'YT', name: 'Yukon' },
  ];
}

/**
 * Zod 地址验证 Schema
 */
export const enhancedAddressSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required').max(50, 'City name too long'),
  line1: z.string().min(1, 'Address line 1 is required').max(100, 'Address line 1 too long'),
  postal_code: z.string().min(1, 'Postal code is required'),
  line2: z.string().max(100, 'Address line 2 too long').optional(),
  state: z.string().optional(),
}).refine(
  (data) => {
    const result = validateEnhancedAddress({
      country: data.country,
      state: data.state,
      city: data.city,
      line1: data.line1,
      line2: data.line2,
      postalCode: data.postal_code,
    });
    return result.isValid;
  },
  {
    message: 'Invalid address format or missing required fields',
  },
);
