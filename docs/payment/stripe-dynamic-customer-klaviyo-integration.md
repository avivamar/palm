# Rolitt 预售最终落地方案 v1.0

本文档结合项目实现草稿与最佳实践，旨在提供一个路径最短、数据闭环、未来可拓展的支付与营销集成方案。

## 1. 系统架构总览

```
┌─────────────────────────────────────┐
│  Next.js 15 预售页  (Vercel)        │
│  ├▶ PaymentButton.tsx               │ ① 选颜色 → 调 createIntent
│  └▶ /api/payments/create-intent     │ ② 创建 Checkout Session
└─────────────────────────────────────┘
                │ sessionId
                ▼
┌─────────────────────────────────────┐
│ Stripe 托管 Checkout Page           │ ③ 用户支付
└─────────────────────────────────────┘
                │  payment_intent.succeeded
                ▼
┌─────────────────────────────────────┐
│ /api/webhook/stripe (Next.js API)   │ ④ 校验 → 幂等写库
│  ├▶ 写入 Firestore: preorders/{pi_id} │ ⑤ 订单备份
│  └▶ 推送 Klaviyo Profile+Event      │ ⑥ 邮件确认 & 流程
└─────────────────────────────────────┘
```

**核心思想**: 实现“一跳支付”，用户在预售页点击按钮后直接跳转至 Stripe 托管的支付页面，完成支付后通过 Webhook 触发后续的数据处理和营销流程。

**数据存储策略**: 初期使用 Firestore 进行快速开发和订单备份。同时，为未来迁移至项目已集成的 Drizzle ORM + PostgreSQL 设计好数据结构，确保平滑过渡。

## 2. 关键文件与代码骨架

### 2.1 `src/components/payments/PaymentButton.tsx`

此组件负责触发支付流程。用户选择颜色后，点击按钮将调用后端的 `create-intent` API，获取 Stripe Checkout Session ID，并重定向到 Stripe 支付页面。

```typescript:src/components/payments/PaymentButton.tsx
'use client';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// 初始化 Stripe，使用 publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const PaymentButton = ({ color, email, locale = 'en' }: { color: string; email: string; locale?: string }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);

    try {
      /* ① 调用后端创建 Stripe Checkout Session */
      const res = await fetch(`/${locale}/api/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color, email }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create checkout session: ${await res.text()}`);
      }

      const { sessionId } = await res.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe.js has not loaded yet.');
      }

      /* ② 重定向到 Stripe Checkout 页面 */
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error(error);
      setLoading(false);
      // 在此可以添加用户友好的错误提示
    }
    // 不需要 setLoading(false)，因为页面会跳转
  };

  return (
    <button onClick={handleClick} disabled={loading} className="btn btn-primary w-full">
      {loading ? '处理中...' : `立即预购 (${color})`}
    </button>
  );
};
```

### 2.2 `src/app/[locale]/api/payments/create-intent/route.ts`

这个 API 路由负责创建 Stripe Checkout Session。它接收前端传来的颜色和邮箱，映射到对应的 Stripe Price ID，并设置成功和取消的返回链接。

```typescript:src/app/[locale]/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/libs/Env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-06-30' });

// 颜色到 Stripe Price ID 的映射
// 建议将此配置移至环境变量或专门的配置文件中
const COLOR_PRICE_MAP: Record<string, string> = JSON.parse(env.COLOR_PRICE_MAP_JSON);

export async function POST(req: NextRequest) {
  try {
    const { color, email } = await req.json();

    if (!color || !email) {
      return new NextResponse('Missing color or email', { status: 400 });
    }

    /* 价格映射：color → priceId */
    const priceId = COLOR_PRICE_MAP[color] ?? COLOR_PRICE_MAP.default;
    if (!priceId) {
      return new NextResponse(`Price ID for color '${color}' not found`, { status: 400 });
    }

    /* 创建 Stripe Checkout Session */
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      // 在 metadata 中存储关键信息，以便 webhook 使用
      metadata: {
        color,
        preorder_number: `ROL-${Date.now()}`,
        locale: req.nextUrl.pathname.split('/')[1] || 'en',
      },
      success_url: `${env.APP_URL}/preorder/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/preorder/cancel`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return new NextResponse(errorMessage, { status: 500 });
  }
}
```

### 2.3 `src/app/api/webhook/stripe/route.ts`

此 Webhook 用于接收 Stripe 的事件通知。核心是处理 `payment_intent.succeeded` 事件，当支付成功后，将订单数据写入 Firestore，并推送客户信息和事件到 Klaviyo。

```typescript:src/app/api/webhook/stripe/route.ts
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/libs/Env';
import { app as firebaseApp } from '@/libs/firebase/config'; // 确保 Firebase app 已初始化

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const db = getFirestore(firebaseApp);
const endpointSecret = env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    const message = `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
    return new NextResponse(message, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const email = pi.charges.data[0].billing_details.email;

    if (!email) {
      console.warn('Email not found in payment intent, skipping processing.', { id: pi.id });
      return new NextResponse('Email not found', { status: 200 }); // 返回 200 避免 Stripe 重试
    }

    try {
      /* ④ 幂等写入 Firestore，键使用 payment_intent.id */
      await setDoc(doc(db, 'preorders', pi.id), {
        email,
        amount: pi.amount,
        currency: pi.currency,
        color: pi.metadata.color,
        preorder_number: pi.metadata.preorder_number,
        createdAt: new Date().toISOString(),
      });

      /* ⑤ 推送 Klaviyo 事件和 Profile */
      await fetch('https://a.klaviyo.com/api/events/', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${env.KLAVIYO_API_KEY}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15'
        },
        body: JSON.stringify({
          data: {
            type: 'event',
            attributes: {
              profile: { email },
              metric: { name: 'Rolitt Pre-order Success' },
              value: pi.amount / 100,
              properties: {
                color: pi.metadata.color,
                preorder_number: pi.metadata.preorder_number,
              },
            },
          },
        }),
      });
    } catch (error) {
      console.error('Error processing webhook event:', error);
      // 根据错误类型决定是否需要返回 500 以便 Stripe 重试
      return new NextResponse('Internal server error during processing', { status: 500 });
    }
  }

  return new NextResponse('ok');
}
```

## 3. 环境变量配置

将以下变量添加至 `.env.local` (用于本地开发) 和 Vercel 环境变量中。

```bash:.env.local
# App URL
APP_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_***
STRIPE_SECRET_KEY=sk_test_***
STRIPE_WEBHOOK_SECRET=whsec_***

# Klaviyo
KLAVIYO_API_KEY=pk_klaviyo_***

# Color ↔ Price ID Mapping (JSON string)
COLOR_PRICE_MAP_JSON='{"pink":"price_abc","blue":"price_def","mint":"price_xyz","default":"price_abc"}'

# Firebase (已有配置，确保完整)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... 其他 Firebase 环境变量
```

## 4. Firestore → PostgreSQL 迁移预留

当前方案使用 Firestore `preorders` 集合存储订单。为未来迁移到项目已有的 Drizzle ORM + PostgreSQL 数据库，预留以下字段映射。

| Firestore Field   | Postgres Column     | Data Type   |
|-------------------|---------------------|-------------|
| `id` (document ID)| `id` (pk)           | `text`      |
| `email`           | `email`             | `varchar`   |
| `amount`          | `amount`            | `integer`   |
| `currency`        | `currency`          | `varchar`   |
| `color`           | `color`             | `varchar`   |
| `preorder_number` | `preorder_number`   | `varchar`   |
| `createdAt`       | `created_at`        | `timestamptz` |

**迁移策略**: 当需要迁移时，可编写一个脚本，从 Firestore 读取所有 `preorders` 文档，将其转换为 CSV 格式，然后使用 PostgreSQL 的 `COPY` 命令批量导入到按此 schema 创建的新表中。

## 5. 测试与部署清单

1.  **本地 Webhook 测试**:
    *   安装 Stripe CLI: `brew install stripe/stripe-cli/stripe`
    *   登录 Stripe: `stripe login`
    *   启动本地开发服务器: `npm run dev`
    *   将 Webhook 事件转发到本地: `stripe listen --forward-to localhost:3000/api/webhook/stripe`
    *   记下输出的 Webhook signing secret (`whsec_...`) 并配置到 `.env.local`。

2.  **配置检查**:
    *   [ ] 确保 `.env.local` 中所有 `***` 都已替换为真实或测试用的密钥。
    *   [ ] 确认 `COLOR_PRICE_MAP_JSON` 中的 Price ID (`price_...`) 是在 Stripe Dashboard 中创建的真实 Price ID。

3.  **端到端测试流程**:
    *   [ ] 访问本地预售页面。
    *   [ ] 输入测试邮箱，选择一个颜色，点击“立即预购”。
    *   [ ] 在 Stripe Checkout 页面，使用[测试卡号](https://stripe.com/docs/testing#cards)完成支付。
    *   [ ] 观察 `stripe listen` 终端的日志，确认 `payment_intent.succeeded` 事件被接收并返回 `200 OK`。
    *   [ ] 检查 Firebase Console，确认 `preorders` 集合下有新的文档生成。
    *   [ ] 登录 Klaviyo Dashboard，确认收到了 `Rolitt Pre-order Success` 事件，并且对应的 Profile 已创建或更新。

4.  **部署**:
    *   [ ] 将所有环境变量（非 `NEXT_PUBLIC_` 的变量也需要）添加到 Vercel 项目的设置中。
    *   [ ] 在 Stripe Dashboard 中，为生产环境创建一个新的 Webhook 端点，URL 指向 `https://www.rolitt.com/api/webhook/stripe`，并使用生产环境的 Webhook secret。
    *   [ ] `git push` 触发 Vercel 部署。

---

*文档版本: 2.0 (根据 Rolitt 预售最终方案 v1.0 更新)*
*最后更新: [当前日期]*
*负责人: 开发团队*
