# Rolitt 预售支付与营销集成方案 v2.0

本文档旨在详细说明当前已实现的 Rolitt 预售支付流程与 Klaviyo 营销自动化的集成方案。该方案确保了从用户选择产品到支付完成，再到后续营销跟进的数据流转闭环。

*文档版本: 2.0*
*最后更新: 2025年6月23日*
*负责人: 开发团队*

---

## 1. 系统架构总览

当前系统实现了“一跳支付”模式，结合了早期线索捕获机制，确保最大化营销机会。

```mermaid
flowchart TD
    A[用户在预售页选择颜色/输入邮箱] --> B{调用 /api/payments/create-intent};
    B --> C[Stripe 创建 Customer & Checkout Session];
    C -- sessionId --> A;
    A -- Redirect --> D[Stripe 托管支付页];

    subgraph "异步 Webhook 事件"
        direction LR
        C -- payment_intent.created --> E[/api/webhook/stripe];
        D -- payment_intent.succeeded --> E;
        D -- checkout.session.completed --> E;
    end

    subgraph "后端数据处理"
        direction TB
        E --> F[写入 Firestore: preorders/{id}];
        E --> G[推送事件到 Klaviyo];
    end

    F --> H[数据分析 & 订单管理];
    G --> I[邮件营销自动化];

```

**核心流程**:
1.  **前端交互**: 用户在 <mcfile name="src/components/pre-order/ProductSelection.tsx" path="src/components/pre-order/ProductSelection.tsx"></mcfile> 组件中选择产品颜色并输入邮箱。
2.  **创建支付意图**: 点击支付按钮后，调用 <mcfile name="src/app/[locale]/api/payments/create-intent/route.ts" path="src/app/[locale]/api/payments/create-intent/route.ts"></mcfile>。此 API 会查找或创建 Stripe Customer，然后创建一个包含 `email` 和 `color` 等元数据的 Stripe Checkout Session，并将 `sessionId` 返回给前端。
3.  **跳转支付**: 前端使用 `sessionId` 将用户重定向到 Stripe 的托管支付页面。
4.  **Webhook 处理**: Stripe 在支付流程的关键节点（创建意图、支付成功等）向 <mcfile name="src/app/api/webhook/stripe/route.ts" path="src/app/api/webhook/stripe/route.ts"></mcfile> 发送事件通知。
5.  **数据同步**: Webhook 服务负责验证事件，并将订单信息（包括用户邮箱、颜色偏好、订单状态等）写入 Firestore，同时将相关事件推送到 Klaviyo 触发营销流程。

**关键优势**:
- **线索捕获**: 通过监听 `payment_intent.created` 事件，即使用户未完成支付，也能捕获其邮箱和颜色偏好，用于后续的再营销。
- **数据一致性**: 所有关键信息都存储在 Stripe `metadata` 中，并通过 Webhook 传递，确保了数据源的唯一和准确。
- **幂等性设计**: Webhook 处理和数据库写入均采用幂等设计，防止重复处理事件。

---

## 2. 关键文件与代码实现

### 2.1 `src/app/[locale]/api/payments/create-intent/route.ts`

此路由负责创建支付会话。它接收前端的 `color` 和 `email`，查找或创建 Stripe Customer，并将这些信息附加到 Checkout Session 的 `metadata` 中。

```typescript
// ...
// 查找或创建 Stripe Customer
let customer;
const customers = await stripe.customers.list({ email, limit: 1 });
if (customers.data.length > 0) {
  customer = customers.data[0];
} else {
  customer = await stripe.customers.create({ email });
}

// 创建 Stripe Checkout Session
const session = await stripe.checkout.sessions.create({
  customer: customer.id,
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'payment',
  // 在 metadata 中存储关键信息，以便 webhook 使用
  metadata: {
    email, // 将 email 添加到 metadata
    color,
    preorder_number: `ROL-${Date.now()}`,
    locale: req.nextUrl.pathname.split('/')[1] || 'en',
  },
  success_url: `${Env.APP_URL}/preorder/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${Env.APP_URL}/preorder/cancel`,
});
// ...
```

### 2.2 `src/app/api/webhook/stripe/route.ts`

这是整个支付流程的数据中枢，负责处理来自 Stripe 的多个关键事件。

-   **`payment_intent.created`**:
    -   **目的**: 捕获潜在客户（Leads）。
    -   **触发时机**: 用户进入 Stripe 支付页面时。
    -   **操作**: 从 `metadata` 中提取 `email`, `color`, `preorder_number`, `locale`，并在 Firestore 中创建一条状态为 `created` 的预购记录。这确保了即使客户放弃支付，其基本信息和产品偏好也能被记录下来。

    ```typescript
    async function handlePaymentIntentCreated(paymentIntent: Stripe.PaymentIntent) {
      const email = paymentIntent.metadata.email || paymentIntent.receipt_email;
      if (email) {
        const { color, preorder_number, locale } = paymentIntent.metadata || {};
        await FirestoreDB.collection('preorders').doc(paymentIntent.id).set({
          email,
          payment_intent_id: paymentIntent.id,
          status: 'created',
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          color,
          preorder_number,
          locale,
          createdAt: new Date(),
        }, { merge: true });
        console.log(`Captured email and color from payment_intent.created: ${paymentIntent.id}`);
      }
    }
    ```

-   **`payment_intent.succeeded`**:
    -   **目的**: 确认支付成功，更新订单状态。
    -   **触发时机**: 用户成功完成支付。
    -   **操作**: 将 Firestore 中对应订单的状态更新为 `succeeded`。同时，从 Firestore 读取完整的预购信息（包括颜色），向 Klaviyo 发送 `Rolitt Pre-order Success` 事件，触发后续的感谢邮件和营销流程。

    ```typescript
    async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
      const email = paymentIntent.metadata.email || paymentIntent.receipt_email;
      if (email) {
        const preorderRef = FirestoreDB.collection('preorders').doc(paymentIntent.id);
        await preorderRef.set({
          status: 'succeeded',
          updatedAt: new Date(),
        }, { merge: true });

        const preorderDoc = await preorderRef.get();
        const preorderData = preorderDoc.data();

        if (preorderData) {
          await Klaviyo.track('Rolitt Pre-order Success', {
            email: email!,
            color: preorderData.color,
            preorder_number: preorderData.preorder_number,
            locale: preorderData.locale,
            amount: paymentIntent.amount / 100,
          });
        }
      }
    }
    ```

-   **`checkout.session.completed`**:
    -   **目的**: 作为支付成功的补充和最终确认。
    -   **触发时机**: Stripe Checkout Session 完成时。
    -   **操作**: 这是一个更全面的成功事件，包含了 `customer_details` 等信息。当前实现也处理此事件，将完整的会话信息写入 Firestore 并触发 Klaviyo 事件，提供了数据冗余和可靠性。

---

## 3. 数据存储 (Firestore)

所有预购信息都存储在 Firestore 的 `preorders` 集合中。文档 ID 使用 Stripe 的 `payment_intent.id` 或 `session.id`，以确保幂等性。

**`preorders` 集合文档结构:**

| 字段                | 类型      | 描述                                     |
| ------------------- | --------- | ---------------------------------------- |
| `email`             | `string`  | 客户邮箱                                 |
| `color`             | `string`  | 选择的产品颜色                           |
| `amount`            | `number`  | 支付金额 (Stripe 单位，如美分为 9900)    |
| `currency`          | `string`  | 货币单位 (e.g., `usd`)                   |
| `status`            | `string`  | 订单状态 (`created`, `succeeded`, `completed`) |
| `preorder_number`   | `string`  | 内部预购单号                             |
| `payment_intent_id` | `string`  | Stripe 支付意图 ID                       |
| `session_id`        | `string`  | Stripe Checkout Session ID (可选)        |
| `locale`            | `string`  | 用户语言环境 (e.g., `en`, `zh-HK`)       |
| `createdAt`         | `Timestamp` | 创建时间                                 |
| `updatedAt`         | `Timestamp` | 更新时间 (可选)                          |

---

## 4. 环境变量配置

确保在 `.env.local` 和 Vercel 部署环境中配置了以下变量：

```bash
# App URL
APP_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Klaviyo
KLAVIYO_API_KEY=pk_klaviyo_...

# Color ↔ Price ID Mapping (JSON string)
COLOR_PRICE_MAP_JSON='{"khaki":"price_...","grey":"price_...","pink":"price_...","green":"price_..."}'

# Firebase (确保所有相关 Firebase key 都已配置)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ...
```

---

## 5. 测试与验证

**端到端测试流程**:
1.  **启动本地服务**: 运行 `npm run dev` 和 `stripe listen --forward-to localhost:3000/api/webhook/stripe`。
2.  **创建预购**: 访问预售页面，选择颜色，输入邮箱，点击预购。
3.  **放弃支付**: 在跳转到 Stripe 页面后，直接关闭页面。
    -   **验证**: 检查 `stripe listen` 日志，应看到 `payment_intent.created` 事件。检查 Firestore，应有一条状态为 `created` 的新记录，包含邮箱和颜色。
4.  **完成支付**: 重新操作，并使用 Stripe 测试卡完成支付。
    -   **验证**: 检查 `stripe listen` 日志，应看到 `payment_intent.succeeded` 和 `checkout.session.completed` 事件。检查 Firestore，对应记录的状态应更新为 `succeeded` 或 `completed`。检查 Klaviyo，应收到 `Rolitt Pre-order Success` 事件。
