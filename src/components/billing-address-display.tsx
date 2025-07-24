/**
 * Billing Address Display Component
 * 提供更好的 billing address 可读性展示
 */

import type { BillingAddress } from '@/types/address';
import { AlertCircle, CheckCircle, Mail, MapPin, Phone, User } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  getBillingAddressSummary,
  validateBillingAddress,
} from '@/libs/billing-address-utils';
import { validateBillingAddressData } from '@/schemas/billing-address';

type DisplayVariant = 'detailed' | 'compact' | 'card';

type ValidationResult = {
  isValid: boolean;
  missingFields: string[];
  score: number;
};

// 严格类型定义的 Props
export type BillingAddressDisplayProps = {
  /** 格式化后的 billing address 对象 */
  'data': BillingAddress | null;
  /** 显示模式 */
  'variant'?: DisplayVariant;
  /** 是否显示验证状态 */
  'showValidation'?: boolean;
  /** 自定义类名 */
  'className'?: string;
  /** 测试 ID */
  'data-testid'?: string;
};

// 内容组件的 Props
type BillingAddressContentProps = {
  data: BillingAddress | null;
  showValidation: boolean;
  validation: ValidationResult;
};

export function BillingAddressDisplay({
  data,
  variant = 'detailed',
  showValidation = false,
  className,
  'data-testid': testId,
}: BillingAddressDisplayProps) {
  // 验证输入数据
  const billingValidation = data ? validateBillingAddressData(data) : null;

  if (!data) {
    return (
      <div
        className={`flex items-center gap-2 text-muted-foreground ${className || ''}`}
        data-testid={testId ? `${testId}-empty` : 'billing-address-empty'}
      >
        <AlertCircle className="h-4 w-4" />
        <span>No billing address available</span>
      </div>
    );
  }

  // 显示验证错误（如果有）
  if (showValidation && billingValidation && !billingValidation.success) {
    return (
      <div
        className={`flex items-center gap-2 text-destructive ${className || ''}`}
        data-testid={testId ? `${testId}-validation-error` : 'billing-address-validation-error'}
      >
        <AlertCircle className="h-4 w-4" />
        <div>
          <span className="font-medium">Invalid billing address data:</span>
          <ul className="text-xs mt-1">
            {billingValidation.errors?.map((error, index) => (
              <li key={index}>
                •
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const validation = validateBillingAddress(data);

  // Compact 模式 - 单行显示
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-2 ${className || ''}`}
        data-testid={testId ? `${testId}-compact` : 'billing-address-compact'}
      >
        <span className="text-sm">
          {getBillingAddressSummary(data)}
        </span>
        {showValidation && (
          <Badge
            variant={validation.isValid ? 'default' : 'destructive'}
            className="text-xs"
            data-testid={testId ? `${testId}-validation-badge` : 'billing-address-validation-badge'}
          >
            {validation.isValid ? 'Complete' : 'Incomplete'}
          </Badge>
        )}
      </div>
    );
  }

  // Card 模式 - 卡片展示
  if (variant === 'card') {
    return (
      <Card
        className={`w-full ${className || ''}`}
        data-testid={testId ? `${testId}-card` : 'billing-address-card'}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Billing Address
            {showValidation && (
              <Badge
                variant={validation.isValid ? 'default' : 'destructive'}
                className="text-xs"
                data-testid={testId ? `${testId}-validation-badge` : 'billing-address-validation-badge'}
              >
                {validation.isValid
                  ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </>
                    )
                  : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Incomplete
                      </>
                    )}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BillingAddressContent
            data={data}
            showValidation={showValidation}
            validation={validation}
          />
        </CardContent>
      </Card>
    );
  }

  // Detailed 模式 - 详细展示
  return (
    <div
      className={`space-y-4 ${className || ''}`}
      data-testid={testId ? `${testId}-detailed` : 'billing-address-detailed'}
    >
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        <h3 className="font-medium">Billing Address</h3>
        {showValidation && (
          <Badge
            variant={validation.isValid ? 'default' : 'destructive'}
            className="text-xs"
            data-testid={testId ? `${testId}-validation-badge` : 'billing-address-validation-badge'}
          >
            {validation.isValid
              ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </>
                )
              : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Incomplete
                  </>
                )}
          </Badge>
        )}
      </div>
      <BillingAddressContent
        data={data}
        showValidation={showValidation}
        validation={validation}
      />
    </div>
  );
}

// 内容组件
function BillingAddressContent({
  data,
  showValidation,
  validation,
}: BillingAddressContentProps) {
  return (
    <div className="space-y-2">
      {/* 姓名 */}
      {data?.name && (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{data.name}</span>
        </div>
      )}

      {/* 邮箱 */}
      {data?.email && (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{data.email}</span>
        </div>
      )}

      {/* 电话 */}
      {data?.phone && (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{data.phone}</span>
        </div>
      )}

      {/* 地址 */}
      {data?.address && (
        <>
          <Separator className="my-2" />
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm space-y-1">
              {/* 地址行1 */}
              {data.address.line1 && (
                <div>{data.address.line1}</div>
              )}

              {/* 地址行2 */}
              {data.address.line2 && (
                <div>{data.address.line2}</div>
              )}

              {/* 城市、州、邮编 */}
              {(data.address.city || data.address.state || data.address.postalCode) && (
                <div>
                  {[data.address.city, data.address.state, data.address.postalCode].filter(Boolean).join(', ')}
                </div>
              )}

              {/* 国家 */}
              {data.address.country && (
                <div className="font-medium">
                  {data.address.country}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 验证信息 */}
      {showValidation && !validation.isValid && (
        <>
          <Separator className="my-2" />
          <div className="text-xs text-destructive">
            <div className="font-medium mb-1">Missing fields:</div>
            <ul className="list-disc list-inside space-y-0.5">
              {validation.missingFields.map((field: string, index: number) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        </>
      )}

    </div>
  );
}

// 简化的只读展示组件
export function BillingAddressSummary({
  data,
  className,
  'data-testid': testId,
}: Pick<BillingAddressDisplayProps, 'data' | 'className' | 'data-testid'>) {
  return (
    <BillingAddressDisplay
      data={data}
      variant="compact"
      className={className}
      data-testid={testId}
    />
  );
}

// 详细卡片展示组件
export function BillingAddressCard({
  data,
  showValidation = true,
  className,
  'data-testid': testId,
}: Pick<BillingAddressDisplayProps, 'data' | 'showValidation' | 'className' | 'data-testid'>) {
  return (
    <BillingAddressDisplay
      data={data}
      variant="card"
      showValidation={showValidation}
      className={className}
      data-testid={testId}
    />
  );
}
