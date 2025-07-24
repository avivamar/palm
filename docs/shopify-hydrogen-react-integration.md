# Shopify Hydrogen React 集成方案

基于 Next.js + `@shopify/hydrogen-react` 的完整电商解决方案

## 方案概述

本方案采用 **Next.js 15 + `@shopify/hydrogen-react`** 作为核心电商解决方案，**围绕预售展开，但不限于预售功能**，为后续完整商城功能实现奠定基础。完全避免引入 Remix 框架，保持技术栈的统一性。通过 `@shopify/hydrogen-react` 提供的组件、Hooks 和工具与 Shopify Storefront API 交互，实现高度定制化的电商体验。

### 核心优势

- ✅ **技术栈统一**：完全基于 Next.js，无需引入额外框架
- ✅ **系统解耦**：shop 模块独立，与现有营销网站完全隔离
- ✅ **渐进式扩展**：从预售开始，支持后续完整商城功能
- ✅ **多语言电商**：原生支持多语言多货币
- ✅ **品牌一致性**：复用现有设计系统和 UI 组件
- ✅ **快速部署**：利用现有基础设施和部署流程

## 技术架构

### 现有技术栈
- **框架**：Next.js 15 (App Router)
- **UI 库**：React 19 + shadcn/ui + Tailwind CSS 4
- **国际化**：next-intl
- **认证**：Clerk
- **数据库**：Drizzle ORM + Neon PostgreSQL
- **部署**：Vercel / Cloudflare Workers

### 新增电商组件
- **电商核心**：`@shopify/hydrogen-react`
- **API 交互**：Shopify Storefront API (GraphQL)
- **支付处理**：Shopify Checkout
- **库存管理**：Shopify Admin API

## 项目结构调整（系统解耦设计）

```
src/
├── app/[locale]/
│   ├── (marketing)/          # 现有营销网站（完全独立）
│   │   ├── page.tsx
│   │   ├── about/
│   │   ├── blog/
│   │   ├── pre-order/       # 现有预售营销页面
│   │   │   └── page.tsx
│   │   └── contact/
│   └── (shop)/              # 新增电商模块（完全隔离）
│       ├── products/        # 产品列表和详情
│       │   ├── page.tsx     # 产品列表页
│       │   └── [handle]/
│       │       └── page.tsx # 产品详情页
│       ├── collections/     # 产品分类
│       │   ├── page.tsx
│       │   └── [handle]/
│       │       └── page.tsx
│       ├── cart/
│       │   └── page.tsx     # 购物车页面
│       ├── checkout/
│       │   └── page.tsx     # 结账页面
│       └── account/         # 用户账户
│           ├── page.tsx
│           ├── orders/
│           └── profile/
├── components/
│   ├── shop/               # 电商专用组件（独立模块）
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── Cart.tsx
│   │   ├── CheckoutFlow.tsx
│   │   ├── PaymentButton.tsx
│   │   └── PreOrderCard.tsx # 预售专用组件
│   ├── pre-order/          # 现有预售营销组件
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   └── ...
│   └── ui/                 # 共享 UI 组件
├── lib/
│   ├── shopify/            # Shopify 专用工具（独立模块）
│   │   ├── client.ts
│   │   ├── queries.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── utils.ts            # 共享工具
└── locales/
    ├── en.json             # 扩展电商翻译
    └── zh-HK.json
```

## 实施步骤

### 第一阶段：环境搭建 (1-2天)

#### 1. 安装依赖

```bash
npm install @shopify/hydrogen-react @shopify/storefront-api-client
npm install @types/shopify-buy
```

#### 2. 环境变量配置（遵循项目规范）

需要在 `src/libs/Env.ts` 中添加 Shopify 相关环境变量：

```typescript
// src/libs/Env.ts - 添加到现有配置中
export const Env = createEnv({
  server: {
    // ... 现有服务器环境变量
    SHOPIFY_STORE_DOMAIN: z.string().min(1),
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1),
    SHOPIFY_API_VERSION: z.string().default('2025-04'),
  },
  client: {
    // ... 现有客户端环境变量
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: z.string().min(1),
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1),
    NEXT_PUBLIC_SHOPIFY_API_VERSION: z.string().default('2025-04'),
  },
  shared: {
    // ... 现有共享环境变量
  },
  runtimeEnv: {
    // ... 现有运行时环境变量
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION,
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    NEXT_PUBLIC_SHOPIFY_API_VERSION: process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION,
  },
});
```

然后在 `.env.local` 中添加实际值：

```bash
# .env.local
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token
SHOPIFY_API_VERSION=2024-01
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token
NEXT_PUBLIC_SHOPIFY_API_VERSION=2024-01
```

#### 3. 创建 Shopify 客户端（遵循项目规范）

```typescript
// src/lib/shopify/client.ts
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { Env } from '@/libs/Env';

// 使用项目统一的环境变量管理
export const shopifyClient = createStorefrontApiClient({
  storeDomain: Env.SHOPIFY_STORE_DOMAIN,
  apiVersion: Env.SHOPIFY_API_VERSION,
  publicAccessToken: Env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
});

// 客户端版本（用于客户端组件）
export const shopifyClientPublic = createStorefrontApiClient({
  storeDomain: Env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  apiVersion: Env.NEXT_PUBLIC_SHOPIFY_API_VERSION,
  publicAccessToken: Env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
});
```

#### 4. 创建 GraphQL 查询（src/lib/shopify/queries.ts）

```typescript
// src/lib/shopify/queries.ts

// 产品列表查询
export const PRODUCTS_QUERY = `
  query Products($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        title
        handle
        description
        featuredImage {
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        availableForSale
        tags
      }
    }
  }
`;

// 单个产品查询
export const PRODUCT_QUERY = `
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: 10) {
        nodes {
          url
          altText
          width
          height
        }
      }
      variants(first: 100) {
        nodes {
          id
          title
          price {
            amount
            currencyCode
          }
          availableForSale
          quantityAvailable
          selectedOptions {
            name
            value
          }
        }
      }
      options {
        name
        values
      }
      tags
      vendor
      productType
    }
  }
`;

// 预售产品专用查询（包含预售相关元字段）
export const PRE_ORDER_PRODUCT_QUERY = `
  query PreOrderProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      featuredImage {
        url
        altText
        width
        height
      }
      variants(first: 1) {
        nodes {
          id
          title
          price {
            amount
            currencyCode
          }
          availableForSale
          quantityAvailable
        }
      }
      metafields(identifiers: [
        { namespace: "custom", key: "pre_order_date" },
        { namespace: "custom", key: "early_bird_price" },
        { namespace: "custom", key: "regular_price" },
        { namespace: "custom", key: "estimated_delivery" },
        { namespace: "custom", key: "pre_order_limit" }
      ]) {
        key
        value
      }
    }
  }
`;

// 购物车查询
export const CART_QUERY = `
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
        totalTaxAmount {
          amount
          currencyCode
        }
        totalDutyAmount {
          amount
          currencyCode
        }
      }
      lines(first: 100) {
        nodes {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
`;

// 创建购物车
export const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// 添加商品到购物车
export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;
```

### 第二阶段：核心架构搭建 (2-3天)

#### 1. 创建 Shopify Provider（系统解耦）

```typescript
// src/components/shop/ShopifyProvider.tsx
'use client';

import { ShopifyProvider as HydrogenShopifyProvider } from '@shopify/hydrogen-react';
import { ReactNode } from 'react';

interface ShopifyProviderProps {
  children: ReactNode;
  locale: string;
}

export function ShopifyProvider({ children, locale }: ShopifyProviderProps) {
  return (
    <HydrogenShopifyProvider
      storeDomain={process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!}
      storefrontToken={process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!}
      storefrontApiVersion={process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION!}
      countryIsoCode={getCountryFromLocale(locale)}
      languageIsoCode={getLanguageFromLocale(locale)}
    >
      {children}
    </HydrogenShopifyProvider>
  );
}

function getCountryFromLocale(locale: string): string {
  const countryMap: Record<string, string> = {
    'en': 'US',
    'zh-HK': 'HK',
    'zh': 'CN',
    'ja': 'JP',
    'ko': 'KR',
    'vi': 'VN',
    'es': 'ES',
  };
  return countryMap[locale] || 'US';
}

function getLanguageFromLocale(locale: string): string {
  const languageMap: Record<string, string> = {
    'en': 'EN',
    'zh-HK': 'ZH',
    'zh': 'ZH',
    'ja': 'JA',
    'ko': 'KO',
    'vi': 'VI',
    'es': 'ES',
  };
  return languageMap[locale] || 'EN';
}
```

#### 2. 仅在 Shop 路由组中集成（避免双向影响）

```typescript
// src/app/[locale]/(shop)/layout.tsx
import { ShopifyProvider } from '@/components/shop/ShopifyProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

// 电商模块专用布局，与营销网站完全隔离
export default function ShopLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <ShopifyProvider locale={locale}>
      <div className="min-h-screen flex flex-col">
        <Navbar /> {/* 复用现有导航组件 */}
        <main className="flex-1">
          {children}
        </main>
        <Footer /> {/* 复用现有页脚组件 */}
      </div>
    </ShopifyProvider>
  );
}
```

```typescript
// src/app/[locale]/(marketing)/layout.tsx 保持不变
// 营销网站布局完全独立，不引入 Shopify 相关代码
export default function MarketingLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

### 第三阶段：电商组件开发 (3-4天)

#### 1. 通用产品卡片组件

```typescript
// src/components/shop/ProductCard.tsx
import { Image, Money, AddToCartButton } from '@shopify/hydrogen-react';
import { Product } from '@shopify/hydrogen-react/storefront-api-types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  locale: string;
  showQuickAdd?: boolean;
}

export function ProductCard({ product, locale, showQuickAdd = true }: ProductCardProps) {
  const t = useTranslations('shop.product');
  const variant = product.variants.nodes[0];
  const isOnSale = product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20">
      <CardHeader className="p-0">
        <Link href={`/${locale}/shop/products/${product.handle}`}>
          <div className="relative aspect-square overflow-hidden rounded-t-lg cursor-pointer">
            <Image
              data={product.featuredImage}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
            {isOnSale && (
              <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                {t('sale')}
              </Badge>
            )}
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-4 right-4 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <Link href={`/${locale}/shop/products/${product.handle}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-2">
            {product.title}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Money
              data={product.priceRange.minVariantPrice}
              className="text-lg font-bold text-primary"
            />
            {isOnSale && (
              <Money
                data={product.priceRange.maxVariantPrice}
                className="text-sm text-muted-foreground line-through"
              />
            )}
          </div>

          {product.tags.includes('pre-order') && (
            <Badge variant="outline" className="text-xs">
              {t('preOrder')}
            </Badge>
          )}
        </div>
      </CardContent>

      {showQuickAdd && (
        <CardFooter className="p-4 pt-0">
          <AddToCartButton
            variantId={variant?.id}
            quantity={1}
            disabled={!variant?.availableForSale}
            className="w-full"
          >
            <Button
              size="sm"
              className="w-full"
              disabled={!variant?.availableForSale}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {variant?.availableForSale ? t('addToCart') : t('soldOut')}
            </Button>
          </AddToCartButton>
        </CardFooter>
      )}
    </Card>
  );
}
```

#### 2. 预售专用产品卡片组件（特殊场景）

```typescript
// src/components/shop/PreOrderCard.tsx
import { Image, Money, AddToCartButton } from '@shopify/hydrogen-react';
import { Product } from '@shopify/hydrogen-react/storefront-api-types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PreOrderCardProps {
  product: Product;
  locale: string;
}

export function PreOrderCard({ product, locale }: PreOrderCardProps) {
  const t = useTranslations('shop.preOrder');
  const variant = product.variants.nodes[0];

  // 从 metafields 获取预订信息
  const preOrderDate = product.metafields?.find(m => m.key === 'pre_order_date')?.value;
  const earlyBirdPrice = product.metafields?.find(m => m.key === 'early_bird_price')?.value;
  const regularPrice = product.metafields?.find(m => m.key === 'regular_price')?.value;
  const estimatedDelivery = product.metafields?.find(m => m.key === 'estimated_delivery')?.value;
  const preOrderLimit = product.metafields?.find(m => m.key === 'pre_order_limit')?.value;

  const isEarlyBird = preOrderDate ? new Date() < new Date(preOrderDate) : false;
  const currentPrice = isEarlyBird && earlyBirdPrice ? earlyBirdPrice : (regularPrice || variant?.price.amount);
  const savings = regularPrice && earlyBirdPrice ?
    (parseFloat(regularPrice) - parseFloat(earlyBirdPrice)).toFixed(2) : null;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            data={product.featuredImage}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          {isEarlyBird && (
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
              <Zap className="w-3 h-3 mr-1" />
              {t('earlyBird')}
            </Badge>
          )}
          <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">
            {t('preOrder')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="font-bold text-2xl mb-2 text-foreground">{product.title}</h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">{product.description}</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <Money
                data={{
                  amount: currentPrice,
                  currencyCode: variant?.price.currencyCode || 'USD'
                }}
                className="text-2xl font-bold text-primary"
              />
              {isEarlyBird && regularPrice && savings && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground line-through">
                    ${regularPrice}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {t('save')} ${savings}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {estimatedDelivery && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{t('estimatedDelivery')}: {estimatedDelivery}</span>
              </div>
            )}

            {preOrderLimit && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{t('limitedQuantity')}: {preOrderLimit} {t('unitsAvailable')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <AddToCartButton
          variantId={variant?.id}
          quantity={1}
          disabled={!variant?.availableForSale}
          className="w-full"
        >
          <Button size="lg" className="w-full" disabled={!variant?.availableForSale}>
            {variant?.availableForSale ?
              (isEarlyBird ? t('preOrderEarlyBird') : t('preOrderNow')) :
              t('soldOut')
            }
          </Button>
        </AddToCartButton>
      </CardFooter>
    </Card>
  );
}
```

#### 2. Pre-order 专用购物车组件

```typescript
// src/components/shop/PreOrderCart.tsx
import {
  useCart,
  CartLineProvider,
  useCartLine,
  CartCheckoutButton,
  Money,
  Image,
  useCartLineUpdateQuantity,
  useCartLineRemove
} from '@shopify/hydrogen-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, X, Clock, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

function PreOrderCartLineItem() {
  const { merchandise, quantity, id } = useCartLine();
  const updateQuantity = useCartLineUpdateQuantity();
  const removeItem = useCartLineRemove();
  const t = useTranslations('shop.cart');

  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    try {
      await updateQuantity(id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeItem(id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-start space-x-4 py-4">
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          data={merchandise.image}
          className="w-full h-full object-cover"
          sizes="80px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{merchandise.product.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{merchandise.title}</p>
            <Badge variant="secondary" className="mt-2 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {t('preOrder')}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            disabled={isUpdating}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isUpdating}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <Money data={merchandise.price} className="font-bold text-primary" />
        </div>
      </div>
    </div>
  );
}

function PreOrderCartContent() {
  const { lines, cost, totalQuantity } = useCart();
  const t = useTranslations('shop.cart');

  if (!lines.nodes.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Truck className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{t('empty.title')}</h3>
        <p className="text-muted-foreground text-sm">{t('empty.description')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {lines.nodes.map((line) => (
            <div key={line.id}>
              <CartLineProvider line={line}>
                <PreOrderCartLineItem />
              </CartLineProvider>
              <Separator className="my-2" />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t('deliveryInfo.title')}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t('deliveryInfo.description')}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">{t('subtotal')} ({totalQuantity} {t('items')})</span>
            <Money data={cost?.subtotalAmount} className="font-semibold" />
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>{t('total')}</span>
            <Money data={cost?.totalAmount} className="text-primary" />
          </div>
        </div>

        <CartCheckoutButton className="w-full">
          <Button className="w-full" size="lg">
            {t('proceedToCheckout')}
          </Button>
        </CartCheckoutButton>

        <p className="text-xs text-muted-foreground text-center">
          {t('secureCheckout')}
        </p>
      </div>
    </div>
  );
}

export function PreOrderCart({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations('shop.cart');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            {t('title')}
          </SheetTitle>
        </SheetHeader>
        <PreOrderCartContent />
      </SheetContent>
    </Sheet>
  );
}
```

### 第四阶段：Pre-order 页面集成 (2-3天)

#### 1. Pre-order 专用页面

```typescript
// src/app/[locale]/(shop)/pre-order/page.tsx
import { shopifyClient, PRE_ORDER_PRODUCT_QUERY } from '@/lib/shopify/client';
import { PreOrderCard } from '@/components/shop/PreOrderCard';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// 预订产品的固定 handle（根据实际 Shopify 产品配置）
const PRE_ORDER_PRODUCT_HANDLE = 'rolitt-ai-companion';

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations('shop.preOrder.meta');

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
    },
  };
}

export default async function PreOrderPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations('shop.preOrder');

  // 获取预订产品数据
  const { data } = await shopifyClient.request(PRE_ORDER_PRODUCT_QUERY, {
    variables: { handle: PRE_ORDER_PRODUCT_HANDLE }
  });

  if (!data.product) {
    notFound();
  }

  const { product } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Product Card */}
        <div className="max-w-4xl mx-auto">
          <PreOrderCard product={product} locale={locale} />
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-semibold mb-2">{t('features.ai.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('features.ai.description')}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💝</span>
            </div>
            <h3 className="font-semibold mb-2">{t('features.companion.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('features.companion.description')}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="font-semibold mb-2">{t('features.magic.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('features.magic.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 启用 ISR，每小时重新验证
export const revalidate = 3600;
```

#### 2. 产品详情页面

```typescript
// src/app/[locale]/(shop)/products/[handle]/page.tsx
import { shopifyClient } from '@/lib/shopify';
import { Image, Money, AddToCartButton } from '@shopify/hydrogen-react';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

const PRODUCT_QUERY = `
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      featuredImage {
        url
        altText
        width
        height
      }
      variants(first: 10) {
        nodes {
          id
          title
          price {
            amount
            currencyCode
          }
          availableForSale
        }
      }
    }
  }
`;

export default async function ProductPage({
  params: { handle, locale }
}: {
  params: { handle: string; locale: string }
}) {
  const { data } = await shopifyClient.request(PRODUCT_QUERY, {
    variables: { handle }
  });

  if (!data.product) {
    notFound();
  }

  const { product } = data;
  const variant = product.variants.nodes[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square">
          <Image
            data={product.featuredImage}
            className="w-full h-full object-cover rounded-lg"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <Money
            data={variant?.price}
            className="text-2xl font-bold text-primary"
          />
          <p className="text-muted-foreground">{product.description}</p>
          <AddToCartButton
            variantId={variant?.id}
            quantity={1}
            disabled={!variant?.availableForSale}
          >
            <Button size="lg" className="w-full">
              {variant?.availableForSale ? '添加到购物车' : '缺货'}
            </Button>
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
}
```

### 第五阶段：国际化集成 (1-2天)

#### 1. 添加 Pre-order 专用翻译

```json
// src/locales/zh-HK.json (扩展现有文件)
{
  "shop": {
    "preOrder": {
      "meta": {
        "title": "Rolitt AI 伴侶預訂 - 早鳥優惠",
        "description": "立即預訂 Rolitt AI 伴侶，享受早鳥優惠價格。先進 AI 技術，自然對話體驗。"
      },
      "hero": {
        "title": "預訂你的 AI 伴侶",
        "subtitle": "體驗下一代人工智能伴侶，現在預訂享受早鳥優惠"
      },
      "earlyBird": "早鳥優惠",
      "save": "節省",
      "deliveryDate": "預計交付",
      "preOrderEarlyBird": "早鳥預訂 - 節省 $40",
      "preOrderNow": "立即預訂",
      "soldOut": "已售完",
      "features": {
        "ai": {
          "title": "先進 AI",
          "description": "最新的人工智能技術，提供自然流暢的對話體驗"
        },
        "companion": {
          "title": "情感陪伴",
          "description": "24/7 陪伴，理解你的情感需求，提供溫暖支持"
        },
        "magic": {
          "title": "魔法時刻",
          "description": "創造特殊的互動體驗，讓每一刻都充滿驚喜"
        }
      }
    },
    "cart": {
      "title": "購物車",
      "preOrder": "預訂",
      "subtotal": "小計",
      "total": "總計",
      "items": "件商品",
      "proceedToCheckout": "前往結帳",
      "secureCheckout": "安全結帳，支持多種付款方式",
      "deliveryInfo": {
        "title": "交付信息",
        "description": "預訂商品將在 2024 年第三季度開始發貨"
      },
      "empty": {
        "title": "購物車是空的",
        "description": "添加一些商品開始購物吧"
      }
    }
  }
}
```

```json
// src/locales/en.json (扩展现有文件)
{
  "shop": {
    "preOrder": {
      "meta": {
        "title": "Pre-order Rolitt AI Companion - Early Bird Special",
        "description": "Pre-order your Rolitt AI Companion now and enjoy early bird pricing. Advanced AI technology with natural conversation experience."
      },
      "hero": {
        "title": "Pre-order Your AI Companion",
        "subtitle": "Experience the next generation of AI companionship. Pre-order now for early bird pricing."
      },
      "earlyBird": "Early Bird",
      "save": "Save",
      "deliveryDate": "Expected Delivery",
      "preOrderEarlyBird": "Early Bird Pre-order - Save $40",
      "preOrderNow": "Pre-order Now",
      "soldOut": "Sold Out",
      "features": {
        "ai": {
          "title": "Advanced AI",
          "description": "Latest artificial intelligence technology for natural, flowing conversations"
        },
        "companion": {
          "title": "Emotional Companion",
          "description": "24/7 companionship that understands your emotional needs and provides warm support"
        },
        "magic": {
          "title": "Magic Moments",
          "description": "Create special interactive experiences that make every moment surprising"
        }
      }
    },
    "cart": {
      "title": "Shopping Cart",
      "preOrder": "Pre-order",
      "subtotal": "Subtotal",
      "total": "Total",
      "items": "items",
      "proceedToCheckout": "Proceed to Checkout",
      "secureCheckout": "Secure checkout with multiple payment options",
      "deliveryInfo": {
        "title": "Delivery Information",
        "description": "Pre-order items will begin shipping in Q3 2024"
      },
      "empty": {
        "title": "Your cart is empty",
        "description": "Add some items to get started"
      }
    }
  }
}
```

#### 2. 多货币支持

```typescript
// src/lib/currency.ts
export function getCurrencyFromLocale(locale: string): string {
  const currencyMap: Record<string, string> = {
    'en': 'USD',
    'zh-HK': 'HKD',
    'ja': 'JPY',
    'es': 'EUR',
  };
  return currencyMap[locale] || 'USD';
}
```

### 第六阶段：性能优化与部署 (1-2天)

#### 1. 图片优化

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
};
```

#### 2. 缓存策略

```typescript
// src/lib/shopify.ts
export async function getProducts() {
  const { data } = await shopifyClient.request(PRODUCTS_QUERY, {
    variables: { first: 20 }
  });

  return data.products.nodes;
}

// 使用 Next.js 缓存
export const revalidate = 3600; // 1小时
```

## 部署与测试

### 1. 环境变量配置

在 Vercel 或 Cloudflare Workers 中配置：
- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_API_VERSION`

### 2. 测试清单

- [ ] 产品列表加载
- [ ] 产品详情显示
- [ ] 购物车功能
- [ ] 多语言切换
- [ ] 多货币显示
- [ ] 结账流程
- [ ] 移动端适配

## 预期收益

### 技术收益
- **统一技术栈**：避免维护多个框架
- **多语言电商**：原生支持国际化
- **性能优化**：利用 Next.js Server Components
- **类型安全**：完整的 TypeScript 支持

### 业务收益
- **品牌一致性**：统一的 UI/UX 体验
- **快速上线**：复用现有基础设施
- **易于维护**：单一代码库管理
- **扩展性强**：可逐步添加新功能

## 时间估算（Pre-order 专用）

### 第一优先级：核心 Pre-order 功能 (1-2周)
- **环境搭建与配置**：2-3天
- **Pre-order 页面开发**：3-4天
- **购物车与支付集成**：3-4天
- **基础测试与部署**：2-3天

### 第二优先级：优化与扩展 (1-2周)
- **多语言完善**：2-3天
- **性能优化**：2-3天
- **用户体验优化**：2-3天
- **全面测试**：2-3天

**总计**：2-4周完成 Pre-order 电商解决方案

### 关键里程碑
- **Week 1**: 基础 Pre-order 功能上线
- **Week 2**: 购物车和支付流程完善
- **Week 3-4**: 优化和多语言支持

## 总结

本方案专门针对 **Rolitt Pre-order 需求**进行优化，通过 `@shopify/hydrogen-react` 实现了与现有 Next.js 项目的完美集成。关键特点：

### 🎯 专注 Pre-order 场景
- **早鸟优惠**：支持时间敏感的定价策略
- **预订流程**：优化的购物车和结账体验
- **交付信息**：清晰的时间线和期望管理

### 🔒 系统完全解耦
- **独立路由组**：`(shop)` 与 `(marketing)` 完全隔离
- **独立组件库**：电商组件不影响现有系统
- **独立状态管理**：Shopify Provider 仅在电商模块中使用

### 🚀 快速实施
- **最小化改动**：复用现有 UI 组件和设计系统
- **渐进式开发**：可以分阶段上线功能
- **性能优化**：利用 Next.js 15 的最新特性

### 📱 用户体验优先
- **品牌一致性**：使用现有的 Tailwind CSS 4 和 shadcn/ui
- **多语言支持**：无缝集成 next-intl
- **响应式设计**：移动端优先的设计理念

这种方案既保持了技术栈的统一性，又充分利用了 Shopify 的电商能力，是当前最适合 Rolitt Pre-order 需求的集成解决方案。
