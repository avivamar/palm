# 环境变量使用指南

## 🚨 重要安全规则

### 客户端组件中的环境变量使用

**✅ 正确做法：**
```typescript
// 在客户端组件中，只使用 NEXT_PUBLIC_ 前缀的环境变量
const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
```

**❌ 错误做法：**
```typescript
// 不要在客户端组件中导入 Env 对象
import { Env } from '@/libs/Env'; // 这会导致 "require is not defined" 错误

// 不要在客户端组件中使用服务器端环境变量
const secretKey = process.env.STRIPE_SECRET_KEY; // 这在客户端会是 undefined
```

### 服务器端组件中的环境变量使用

**✅ 正确做法：**
```typescript
// 在服务器端组件或 API 路由中，可以安全使用 Env 对象
import { Env } from '@/libs/Env';

const secretKey = Env.STRIPE_SECRET_KEY;
const databaseUrl = Env.DATABASE_URL;
```

## 📋 环境变量检查清单

### 开发环境设置
- [ ] `.env.local` 文件已创建
- [ ] 所有必需的 `NEXT_PUBLIC_` 变量已设置
- [ ] 数据库连接变量已配置
- [ ] 第三方服务 API 密钥已添加

### 生产环境设置
- [ ] 所有环境变量在部署平台已配置
- [ ] 敏感信息未提交到版本控制
- [ ] 客户端变量使用 `NEXT_PUBLIC_` 前缀
- [ ] 服务器端变量保持私有

## 🔧 常见问题解决

### "require is not defined" 错误
这通常发生在客户端组件尝试使用服务器端代码时：

1. 检查是否在客户端组件中导入了 `Env` 对象
2. 确保只在客户端使用 `NEXT_PUBLIC_` 前缀的变量
3. 将服务器端逻辑移到 API 路由或服务器组件

### 环境变量未定义
1. 检查变量名拼写
2. 确认 `.env.local` 文件存在且格式正确
3. 重启开发服务器
4. 检查是否需要 `NEXT_PUBLIC_` 前缀

## 📚 最佳实践

1. **类型安全**：使用 `@t3-oss/env-nextjs` 进行环境变量验证
2. **安全性**：永远不要在客户端暴露敏感信息
3. **可维护性**：为所有环境变量添加注释说明用途
4. **测试**：在不同环境中验证环境变量配置