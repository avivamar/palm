# Webhook 日志系统配置文档

## 概述

Webhook 日志系统用于记录和监控 Stripe webhook 事件的处理状态，包括与 Klaviyo 的集成情况。该系统提供了完整的事件追踪、错误监控和管理界面。

## 环境变量配置

### 必需配置

```bash
# Stripe 配置（已有）
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Klaviyo 配置（已有）
KLAVIYO_API_KEY=pk_...
```

### 可选配置

```bash
# Webhook 日志 API 访问密钥（可选，用于保护日志 API）
WEBHOOK_LOGS_API_KEY=your_secure_api_key_here
```

## 功能特性

### 1. 自动日志记录

- **事件开始**: 记录 Stripe webhook 事件接收
- **处理状态**: 跟踪事件处理进度（processing → success/failed）
- **Klaviyo 集成**: 记录是否成功发送到 Klaviyo
- **错误信息**: 详细记录处理失败的原因

### 2. 数据存储结构

日志存储在 Firestore 的 `webhook_logs` 集合中：

```typescript
type WebhookLog = {
  id: string; // 文档 ID
  event: string; // 事件类型（如 checkout.session.completed）
  status: 'success' | 'failed' | 'processing';
  email: string | null; // 用户邮箱
  receivedAt: Date; // 接收时间
  error: string | null; // 错误信息
  metadata: { // 元数据
    preorder_id?: string;
    session_id?: string;
    payment_intent_id?: string;
    amount?: number;
    currency?: string;
    color?: string;
    locale?: string;
    stripe_event_id?: string;
    klaviyo_event_sent?: boolean;
  };
};
```

### 3. API 端点

#### GET `/api/webhook/logs`

获取 webhook 日志列表

**查询参数:**
- `limit`: 返回数量限制（默认 50）
- `offset`: 偏移量（默认 0）
- `status`: 状态过滤（success/failed/processing）

**响应格式:**
```json
{
  "logs": [
    {
      "id": "log_123",
      "event": "checkout.session.completed",
      "status": "success",
      "email": "user@example.com",
      "receivedAt": "2025-01-23T12:34:56Z",
      "error": null,
      "metadata": {
        "preorder_id": "pre_456",
        "amount": 99.99,
        "currency": "usd",
        "klaviyo_event_sent": true
      }
    }
  ],
  "total": 1,
  "hasMore": false
}
```

#### POST `/api/webhook/logs`

创建新的日志记录（主要用于内部调用）

**请求体:**
```json
{
  "event": "checkout.session.completed",
  "status": "processing",
  "email": "user@example.com",
  "metadata": {
    "preorder_id": "pre_456"
  }
}
```

#### DELETE `/api/webhook/logs?days=30`

清理指定天数前的旧日志（需要 API Key）

### 4. 管理界面

访问路径: `/admin/webhook-logs`

**功能包括:**
- 实时日志查看
- 状态统计（总数、成功、失败、处理中）
- 状态过滤
- 错误信息显示
- 自动刷新

**界面组件:**
- 状态图标（✅ 成功、❌ 失败、🔄 处理中）
- 状态标签（Badge）
- 骨架屏加载状态
- 响应式设计

## 使用指南

### 1. 开发环境设置

```bash
# 1. 确保 Firestore 已配置
# 2. 设置环境变量
echo "WEBHOOK_LOGS_API_KEY=dev_api_key_123" >> .env.local

# 3. 重启开发服务器
npm run dev
```

### 2. 生产环境部署

```bash
# 1. 设置生产环境变量
WEBHOOK_LOGS_API_KEY=prod_secure_api_key_456

# 2. 确保 Firestore 安全规则允许写入 webhook_logs 集合
# 3. 部署应用
```

### 3. 监控和维护

```bash
# 查看最近的日志
curl "https://your-domain.com/api/webhook/logs?limit=10"

# 清理 30 天前的日志
curl -X DELETE "https://your-domain.com/api/webhook/logs?days=30" \
  -H "x-api-key: your_api_key"
```

## 安全考虑

### 1. API 访问控制

- 使用 `WEBHOOK_LOGS_API_KEY` 保护敏感操作
- 日志查看可以考虑添加身份验证
- 生产环境建议使用强密码

### 2. 数据隐私

- 邮箱地址会被记录，确保符合隐私政策
- 敏感信息不会记录在日志中
- 定期清理旧日志

### 3. Firestore 安全规则

```javascript
// Firestore 安全规则示例
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Webhook 日志集合
    match /webhook_logs/{document} {
      // 只允许服务端写入
      allow read, write: if false;
    }
  }
}
```

## 故障排除

### 1. 常见问题

**问题**: 日志记录失败
**解决**: 检查 Firestore 连接和权限配置

**问题**: 管理界面无法加载
**解决**: 检查 API 端点是否正常工作

**问题**: Klaviyo 事件发送状态不准确
**解决**: 检查 `RolittKlaviyoEvents` 的错误处理

### 2. 调试命令

```bash
# 检查 API 端点
curl "http://localhost:3000/api/webhook/logs"

# 查看服务器日志
npm run dev

# 测试 Firestore 连接
# 在浏览器控制台中检查网络请求
```

## 扩展功能

### 1. 实时通知

可以添加 WebSocket 或 Server-Sent Events 实现实时日志更新。

### 2. 高级过滤

- 按时间范围过滤
- 按邮箱搜索
- 按预购 ID 搜索

### 3. 导出功能

- CSV 导出
- JSON 导出
- 报表生成

### 4. 告警系统

- 失败率阈值告警
- 邮件通知
- Slack 集成

## 相关文档

- [Stripe Webhook 文档](https://stripe.com/docs/webhooks)
- [Klaviyo API 文档](https://developers.klaviyo.com/)
- [Firestore 文档](https://firebase.google.com/docs/firestore)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
