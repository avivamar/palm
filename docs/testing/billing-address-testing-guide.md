# Billing Address 组件测试指南

## 概述

本文档介绍了 `billing-address-display.tsx` 组件和 `billing-address-utils.ts` 工具函数的测试策略和使用方法。

## 类型安全增强

### Zod Schema 验证

我们引入了 Zod schema 来确保数据的类型安全：

```typescript
import { validateBillingAddressData, validateFlatBillingAddressData } from '@/schemas/billing-address';

// 验证 BillingAddress 数据
const result = validateBillingAddressData(billingAddress);
if (!result.success) {
  console.error('Validation errors:', result.errors);
}

// 验证 FlatBillingAddress 数据
const flatResult = validateFlatBillingAddressData(flatData);
if (!flatResult.success) {
  console.error('Flat data validation errors:', flatResult.errors);
}
```

### 严格类型定义

`BillingAddressDisplayProps` 现在包含更严格的类型定义：

```typescript
type BillingAddressDisplayProps = {
  'billingAddress'?: BillingAddress | null;
  'flatBillingData'?: FlatBillingAddress | null;
  'variant'?: DisplayVariant;
  'showValidation'?: boolean;
  'className'?: string;
  'data-testid'?: string;
};
```

## 测试覆盖

### 单元测试 (billing-address-utils.ts)

位置：`src/libs/__tests__/billing-address-utils.test.ts`

测试覆盖的功能：
- `formatBillingAddress` - 格式化账单地址为单行字符串
- `formatBillingAddressMultiline` - 格式化账单地址为多行字符串
- `buildBillingAddressFromFlat` - 从扁平化数据构建 BillingAddress 对象
- `getBillingAddressSummary` - 生成账单地址摘要
- `validateBillingAddress` - 验证账单地址完整性

#### 运行单元测试

```bash
# 运行所有单元测试
npm run test:unit

# 运行特定文件的测试
npx vitest src/libs/__tests__/billing-address-utils.test.ts

# 运行测试并生成覆盖率报告
npx vitest --coverage
```

### 组件测试 (billing-address-display.tsx)

位置：`src/components/__tests__/billing-address-display.test.tsx`

测试覆盖的场景：
- 空状态处理
- 验证错误显示
- 不同显示模式（compact, card, detailed）
- 数据源优先级（扁平化数据 vs 原始数据）
- 自定义属性（className, data-testid）
- 可访问性
- 边界情况和错误处理

#### 运行组件测试

```bash
# 运行所有组件测试
npm run test:components

# 运行特定组件的测试
npx vitest src/components/__tests__/billing-address-display.test.tsx

# 运行测试并监听文件变化
npx vitest --watch
```

## 测试最佳实践

### 1. 使用 data-testid 属性

所有组件都支持 `data-testid` 属性，便于测试定位：

```typescript
<BillingAddressDisplay
  billingAddress={address}
  data-testid="checkout-billing-address"
/>
```

测试中使用：

```typescript
const element = screen.getByTestId('checkout-billing-address-detailed');

expect(element).toBeInTheDocument();
```

### 2. Mock 外部依赖

测试中正确 mock 工具函数：

```typescript
vi.mock('../../libs/billing-address-utils', () => ({
  buildBillingAddressFromFlat: vi.fn(),
  getBillingAddressSummary: vi.fn(),
  validateBillingAddress: vi.fn()
}));
```

### 3. 测试不同的数据状态

确保测试覆盖：
- 完整数据
- 部分数据
- 空数据
- 无效数据
- 边界情况

## 性能测试

### 渲染性能

```typescript
import { render } from '@testing-library/react';
import { performance } from 'perf_hooks';

it('should render within performance budget', () => {
  const start = performance.now();
  render(<BillingAddressDisplay billingAddress={largeDataSet} />);
  const end = performance.now();

  expect(end - start).toBeLessThan(100); // 100ms 预算
});
```

### 内存泄漏测试

```typescript
it('should not cause memory leaks', () => {
  const { unmount } = render(<BillingAddressDisplay billingAddress={address} />);
  unmount();

  // 验证组件正确清理
  expect(screen.queryByTestId('billing-address-detailed')).not.toBeInTheDocument();
});
```

## 集成测试

### 与表单集成

```typescript
it('should integrate with form validation', async () => {
  const { user } = setup(
    <form>
      <BillingAddressDisplay
        billingAddress={incompleteAddress}
        showValidation={true}
      />
      <button type="submit">Submit</button>
    </form>
  );

  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(screen.getByText('Incomplete')).toBeInTheDocument();
});
```

## 可访问性测试

### 使用 axe-core

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should be accessible', async () => {
  const { container } = render(
    <BillingAddressDisplay billingAddress={address} />
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 测试配置

### Vitest 配置

配置文件：`vitest.config.ts`

关键配置：
- 测试环境：jsdom
- 覆盖率阈值：80%
- 设置文件：`src/test/setup.ts`

### 覆盖率目标

- 行覆盖率：≥ 80%
- 函数覆盖率：≥ 80%
- 分支覆盖率：≥ 80%
- 语句覆盖率：≥ 80%

## 持续集成

### GitHub Actions 配置

```yaml
- name: Run tests
  run: |
    npm run test:unit
    npm run test:components
    npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## 故障排除

### 常见问题

1. **Mock 函数未正确设置**
   ```typescript
   // 确保在每个测试前重置 mock
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

2. **异步操作未等待**
   ```typescript
   // 使用 waitFor 等待异步更新
   await waitFor(() => {
     expect(screen.getByText('Complete')).toBeInTheDocument();
   });
   ```

3. **DOM 清理问题**
   ```typescript
   // 确保测试设置文件包含清理逻辑
   afterEach(() => {
     cleanup();
   });
   ```

## 下一步

1. 添加 E2E 测试（Playwright）
2. 性能基准测试
3. 视觉回归测试（Storybook）
4. 国际化测试
5. 移动端响应式测试
