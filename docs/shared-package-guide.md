# 共享包使用指南

## 概述

本文档说明如何在新功能开发中优先使用 `@rolitt/shared` 包，以实现渐进式的 UI 组件解耦。

## 基本原则

### 1. 新功能优先使用共享类型

```typescript
// ✅ 推荐：使用共享类型
import type { Product, User, ApiResponse } from '@rolitt/shared';

// ❌ 避免：重复定义类型
type Product = {
  id: string;
  name: string;
  // ...
};
```

### 2. 业务组件使用共享类型定义

```typescript
// ✅ 推荐：使用共享的业务组件类型
import type { ProductCardProps, UserProfileProps } from '@rolitt/shared';

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // 组件实现
};
```

### 3. UI 组件类型统一

```typescript
// ✅ 推荐：使用共享的 UI 类型
import type { ButtonProps, CardProps } from '@rolitt/shared';
import { Button, Card } from '@/components/ui';

const MyComponent: React.FC<{ data: Product }> = ({ data }) => {
  const buttonProps: ButtonProps = {
    variant: 'primary',
    size: 'lg',
    loading: false
  };
  
  return (
    <Card variant="elevated">
      <Button {...buttonProps}>
        Add to Cart
      </Button>
    </Card>
  );
};
```

## 可用的共享类型

### 基础类型

- `BaseEntity` - 基础实体类型
- `ApiResponse<T>` - API 响应类型
- `PaginationParams` - 分页参数
- `PaginatedResponse<T>` - 分页响应
- `AsyncState<T>` - 异步状态管理
- `LoadingState` - 加载状态
- `FormState<T>` - 表单状态

### 业务类型

- `Product` - 产品类型
- `User` - 用户类型
- `Order` - 订单类型
- `Address` - 地址类型

### UI 组件类型

- `ButtonProps` - 按钮组件属性
- `CardProps` - 卡片组件属性
- `InputProps` - 输入框组件属性
- `DialogProps` - 对话框组件属性
- `TableProps<T>` - 表格组件属性
- `NavigationProps` - 导航组件属性

### 业务组件类型

- `ProductCardProps` - 产品卡片组件
- `UserProfileProps` - 用户资料组件
- `OrderSummaryProps` - 订单摘要组件
- `PageHeaderProps` - 页面头部组件
- `ContactFormProps` - 联系表单组件

## 工具函数

### 样式工具

```typescript
import { cn } from '@rolitt/shared';

const className = cn(
  'base-class',
  condition && 'conditional-class',
  props.className
);
```

### 数据格式化

```typescript
import { formatCurrency, formatNumber } from '@rolitt/shared';

const price = formatCurrency(29.99, 'USD');
const count = formatNumber(1234567);
```

### 实用工具

```typescript
import { debounce, generateId } from '@rolitt/shared';

const debouncedSearch = debounce((query: string) => {
  // 搜索逻辑
}, 300);

const uniqueId = generateId();
```

## 开发最佳实践

### 1. 类型优先

在开始编写组件之前，先检查是否有可用的共享类型：

```typescript
// 1. 检查共享类型
import type { Product, ButtonProps } from '@rolitt/shared';

// 2. 定义组件 Props
interface ProductListProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  loading?: boolean;
}

// 3. 实现组件
const ProductList: React.FC<ProductListProps> = ({ products, onProductClick, loading }) => {
  // 组件实现
};
```

### 2. 渐进式迁移

对于现有组件，可以逐步迁移到共享类型：

```typescript
// 第一步：导入共享类型
import type { Product } from '@rolitt/shared';

// 第二步：更新组件 Props
interface ProductCardProps {
  product: Product; // 使用共享类型
  className?: string;
}

// 第三步：逐步替换内部类型定义
```

### 3. 新功能开发流程

1. **需求分析**：确定需要的数据类型和 UI 组件
2. **类型检查**：查看 `@rolitt/shared` 是否有相应类型
3. **类型扩展**：如需要，向共享包添加新类型
4. **组件开发**：使用共享类型开发组件
5. **测试验证**：确保类型安全和功能正确

## 示例：创建新的产品页面

```typescript
// pages/products/[id].tsx
import type { Product, User, AsyncState } from '@rolitt/shared';
import type { ProductCardProps } from '@rolitt/shared';
import { Card, Button } from '@/components/ui';

interface ProductPageProps {
  product: Product;
  currentUser?: User;
}

const ProductPage: React.FC<ProductPageProps> = ({ product, currentUser }) => {
  const [addToCartState, setAddToCartState] = useState<AsyncState<any>>({
    loading: false,
    error: null,
    data: null
  });

  const handleAddToCart = async () => {
    setAddToCartState({ loading: true, error: null, data: null });
    try {
      // 添加到购物车逻辑
      setAddToCartState({ loading: false, error: null, data: 'success' });
    } catch (error) {
      setAddToCartState({ loading: false, error: error.message, data: null });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card variant="elevated" className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-xl text-gray-600 mt-2">
                {formatCurrency(product.price, 'USD')}
              </p>
            </div>
            
            <p className="text-gray-700">{product.description}</p>
            
            <Button
              variant="primary"
              size="lg"
              loading={addToCartState.loading}
              onClick={handleAddToCart}
              className="w-full"
            >
              Add to Cart
            </Button>
            
            {addToCartState.error && (
              <p className="text-red-600">{addToCartState.error}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductPage;
```

## 注意事项

1. **类型安全**：始终使用 TypeScript 严格模式
2. **向后兼容**：新类型不应破坏现有代码
3. **文档更新**：添加新类型时更新此文档
4. **测试覆盖**：确保新组件有充分的测试覆盖

## 后续计划

1. **短期目标**（1-2 周）：
   - 所有新功能使用共享类型
   - 完善共享类型定义
   - 建立类型使用监控

2. **中期目标**（1-2 月）：
   - 核心业务组件迁移
   - 建立组件库文档
   - 实现自动化测试

3. **长期目标**（3-6 月）：
   - 完整的 UI 组件解耦
   - 跨项目组件复用
   - 设计系统标准化