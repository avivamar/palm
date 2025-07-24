/**
 * Billing Address Zod Schemas
 * 提供严格的类型验证和数据校验
 */

import { z } from 'zod';
import { secureNameSchema } from '@/libs/security/input-sanitization';
import { enhancedAddressSchema } from '@/libs/validation/address-validation';
import { validateEnhancedEmail } from '@/libs/validation/email-validation';
import { validateInternationalPhoneNumber } from '@/libs/validation/phone-validation';

// 地址验证 Schema（使用增强验证）
export const AddressSchema = enhancedAddressSchema;

// 增强的手机号验证
const enhancedPhoneValidation = z.string().refine(
  (phone) => {
    if (!phone || phone.trim() === '') {
      return true; // 允许空值，因为手机号是可选的
    }
    const result = validateInternationalPhoneNumber(phone);
    return result.isValid;
  },
  {
    message: 'Please enter a valid international phone number (e.g., +1 555-123-4567)',
  },
);

// 增强的邮箱验证
const enhancedEmailValidation = z.string().refine(
  (email) => {
    if (!email || email.trim() === '') {
      return true; // 允许空值，因为邮箱是可选的
    }
    const result = validateEnhancedEmail(email);
    return result.isValid && !result.isDisposable; // 不允许一次性邮箱
  },
  {
    message: 'Please enter a valid email address (disposable emails are not allowed)',
  },
);

// 账单地址验证 Schema
export const BillingAddressSchema = z.object({
  name: z.string().min(1, 'Name is required').pipe(secureNameSchema),
  email: enhancedEmailValidation.optional(),
  phone: enhancedPhoneValidation.optional(),
  address: AddressSchema,
});

// 扁平化 Billing Address Schema
export const FlatBillingAddressSchema = z.object({
  billingName: z.string().nullable().optional().refine(
    (name) => {
      if (!name || name.trim() === '') {
        return true; // 允许空值
      }
      // 应用安全验证逻辑
      return name.length >= 1 && name.length <= 100;
    },
    {
      message: 'Name must be between 1 and 100 characters',
    },
  ),
  billingEmail: z.string().nullable().optional().refine(
    (email) => {
      if (!email || email.trim() === '') {
        return true; // 允许空值
      }
      const result = validateEnhancedEmail(email);
      return result.isValid && !result.isDisposable; // 不允许一次性邮箱
    },
    {
      message: 'Please enter a valid email address (disposable emails are not allowed)',
    },
  ),
  billingPhone: z.string().nullable().optional().refine(
    (phone) => {
      if (!phone || phone.trim() === '') {
        return true; // 允许空值
      }
      const result = validateInternationalPhoneNumber(phone);
      return result.isValid;
    },
    {
      message: 'Please enter a valid international phone number (e.g., +1 555-123-4567)',
    },
  ),
  billingAddressLine1: z.string().nullable().optional(),
  billingAddressLine2: z.string().nullable().optional(),
  billingCity: z.string().nullable().optional(),
  billingState: z.string().nullable().optional(),
  billingCountry: z.string().nullable().optional(),
  billingPostalCode: z.string().nullable().optional(),
});

// 验证结果类型
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  missingFields: z.array(z.string()),
  errors: z.array(z.string()).optional(),
});

// 显示变体类型
export const DisplayVariantSchema = z.enum(['compact', 'detailed', 'card']);

// 导出推断的类型
export type Address = z.infer<typeof AddressSchema>;
export type BillingAddress = z.infer<typeof BillingAddressSchema>;
export type FlatBillingAddress = z.infer<typeof FlatBillingAddressSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type DisplayVariant = z.infer<typeof DisplayVariantSchema>;

// 验证函数
export function validateBillingAddressData(data: unknown): {
  success: boolean;
  data?: BillingAddress;
  errors?: string[];
} {
  try {
    const result = BillingAddressSchema.parse(data);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return {
      success: false,
      errors: ['Unknown validation error'],
    };
  }
}

export function validateFlatBillingAddressData(data: unknown): {
  success: boolean;
  data?: FlatBillingAddress;
  errors?: string[];
} {
  try {
    const result = FlatBillingAddressSchema.parse(data);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return {
      success: false,
      errors: ['Unknown validation error'],
    };
  }
}
