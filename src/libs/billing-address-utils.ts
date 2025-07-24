/**
 * Billing Address Utilities
 * 提供更好的 billing address 可读性和格式化功能
 */

import type { BillingAddress } from '@/types/address';

/**
 * 格式化 billing address 为可读的字符串
 */
export function formatBillingAddress(billingAddress: any): string {
  if (!billingAddress) {
    return 'No billing address';
  }

  const parts: string[] = [];

  // Name
  if (billingAddress.name) {
    parts.push(`Name: ${billingAddress.name}`);
  }

  // Email
  if (billingAddress.email) {
    parts.push(`Email: ${billingAddress.email}`);
  }

  // Phone
  if (billingAddress.phone) {
    parts.push(`Phone: ${billingAddress.phone}`);
  }

  // Address
  if (billingAddress.address) {
    const address = billingAddress.address;
    const addressParts: string[] = [];

    if (address.line1) {
      addressParts.push(address.line1);
    }
    if (address.line2) {
      addressParts.push(address.line2);
    }
    if (address.city) {
      addressParts.push(address.city);
    }
    if (address.state) {
      addressParts.push(address.state);
    }
    if (address.postalCode) {
      addressParts.push(address.postalCode);
    }
    if (address.country) {
      addressParts.push(address.country);
    }

    if (addressParts.length > 0) {
      parts.push(`Address: ${addressParts.join(', ')}`);
    }
  }

  return parts.join(' | ');
}

/**
 * 格式化 billing address 为多行显示
 */
export function formatBillingAddressMultiline(billingAddress: any): string {
  if (!billingAddress) {
    return 'No billing address';
  }

  const lines: string[] = [];

  // Name
  if (billingAddress.name) {
    lines.push(`Name: ${billingAddress.name}`);
  }

  // Email
  if (billingAddress.email) {
    lines.push(`Email: ${billingAddress.email}`);
  }

  // Phone
  if (billingAddress.phone) {
    lines.push(`Phone: ${billingAddress.phone}`);
  }

  // Address
  if (billingAddress.address) {
    const address = billingAddress.address;
    lines.push('Address:');

    if (address.line1) {
      lines.push(`  ${address.line1}`);
    }
    if (address.line2) {
      lines.push(`  ${address.line2}`);
    }

    const cityStateZip: string[] = [];
    if (address.city) {
      cityStateZip.push(address.city);
    }
    if (address.state) {
      cityStateZip.push(address.state);
    }
    if (address.postalCode) {
      cityStateZip.push(address.postalCode);
    }

    if (cityStateZip.length > 0) {
      lines.push(`  ${cityStateZip.join(', ')}`);
    }

    if (address.country) {
      lines.push(`  ${address.country}`);
    }
  }

  return lines.join('\n');
}

/**
 * 从扁平化字段重建 billing address 对象
 */
export function buildBillingAddressFromFlat(flatData: {
  billingName?: string | null;
  billingEmail?: string | null;
  billingPhone?: string | null;
  billingAddressLine1?: string | null;
  billingAddressLine2?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingCountry?: string | null;
  billingPostalCode?: string | null;
} | null | undefined): BillingAddress | null {
  // Handle null/undefined input
  if (!flatData) {
    return null;
  }

  const {
    billingName,
    billingEmail,
    billingPhone,
    billingAddressLine1,
    billingAddressLine2,
    billingCity,
    billingState,
    billingCountry,
    billingPostalCode,
  } = flatData;

  // 如果没有必需的字段，返回 null
  if (!billingName || !billingAddressLine1 || !billingCity || !billingPostalCode || !billingCountry) {
    return null;
  }

  return {
    name: billingName,
    email: billingEmail || undefined,
    phone: billingPhone || undefined,
    address: {
      line1: billingAddressLine1,
      line2: billingAddressLine2 || undefined,
      city: billingCity,
      state: billingState || undefined,
      country: billingCountry,
      postalCode: billingPostalCode,
    },
  };
}

/**
 * 获取 billing address 的简短摘要
 */
export function getBillingAddressSummary(billingAddress: any): string {
  if (!billingAddress) {
    return 'No billing address';
  }

  const parts: string[] = [];

  if (billingAddress.name) {
    parts.push(billingAddress.name);
  }

  if (billingAddress.address?.city && billingAddress.address?.country) {
    parts.push(`${billingAddress.address.city}, ${billingAddress.address.country}`);
  } else if (billingAddress.address?.country) {
    parts.push(billingAddress.address.country);
  }

  return parts.join(' - ') || 'Billing address available';
}

/**
 * 验证 billing address 是否完整
 */
type ValidationResult = {
  isValid: boolean;
  missingFields: string[];
  score: number;
};

export function validateBillingAddress(billingAddress: any): ValidationResult {
  const missingFields: string[] = [];
  let score = 0;

  if (!billingAddress) {
    return {
      isValid: false,
      missingFields: ['Entire billing address'],
      score: 0,
    };
  }

  if (billingAddress.name) {
    score++;
  } else {
    missingFields.push('Name');
  }
  if (billingAddress.email) {
    score++;
  } else {
    missingFields.push('Email');
  }

  if (!billingAddress.address) {
    missingFields.push('Address (line1, city, postalCode, country)');
  } else {
    if (billingAddress.address.line1) {
      score++;
    } else {
      missingFields.push('Address Line 1');
    }
    if (billingAddress.address.city) {
      score++;
    } else {
      missingFields.push('City');
    }
    if (billingAddress.address.state) {
      score++;
    } // Optional
    if (billingAddress.address.postalCode) {
      score++;
    } else {
      missingFields.push('Postal Code');
    }
    if (billingAddress.address.country) {
      score++;
    } else {
      missingFields.push('Country');
    }
  }

  // Calculate score as a percentage of completed required fields
  const requiredFields = 5; // name, email, line1, city, postalCode, country
  const completedRequiredFields = requiredFields - missingFields.filter(f => f !== 'State').length;
  const calculatedScore = Math.round((completedRequiredFields / requiredFields) * 100);

  return {
    isValid: missingFields.length === 0,
    missingFields,
    score: calculatedScore,
  };
}
