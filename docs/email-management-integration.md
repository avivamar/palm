# Email Management Integration Guide

## 概述

本指南介绍如何在管理后台中使用新集成的邮件管理功能模块。该模块将 `@rolitt/email` 包的功能转化为可视化的管理界面，提供完整的邮件模板管理解决方案。

## 快速开始

### 1. 导入邮件管理模块

```typescript
import { EmailManagement } from '@rolitt/admin';

// 在你的管理后台页面中使用
export default function AdminEmailPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Email Management</h1>
      <EmailManagement />
    </div>
  );
}
```

### 2. 基本配置

在使用邮件管理功能之前，需要先配置基本设置：

1. **品牌配置**: 设置公司名称、主色调、Logo 等
2. **Supabase 配置**: 配置 Supabase 项目连接信息
3. **语言设置**: 选择支持的语言和默认语言

## 功能模块详解

### 1. 模板管理 (Template Manager)

#### 1.1 创建新模板

```typescript
// 通过 UI 界面创建，或者通过 API
const newTemplate = {
  type: 'welcome',
  locale: 'en',
  subject: 'Welcome to {{company_name}}',
  content: 'Hello {{user_name}}, welcome to our platform!',
  variables: {
    company_name: 'Your Company',
    user_name: 'User Name'
  }
};
```

#### 1.2 模板类型

支持以下邮件模板类型：
- `welcome`: 欢迎邮件
- `confirmation`: 邮箱确认
- `reset-password`: 密码重置
- `magic-link`: 魔法链接登录
- `invite`: 用户邀请
- `notification`: 通知邮件

#### 1.3 多语言支持

每个模板类型都支持多语言版本：
- `en`: English
- `zh-TW`: 繁體中文
- `ja`: 日本語

### 2. 配置管理 (Configuration Panel)

#### 2.1 品牌配置

```typescript
const brandConfig = {
  companyName: 'Your Company',
  primaryColor: '#EBFF7F',
  logoUrl: 'https://example.com/logo.png',
  websiteUrl: 'https://example.com',
  supportEmail: 'support@example.com'
};
```

#### 2.2 Supabase 集成配置

```typescript
const supabaseConfig = {
  projectUrl: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key',
  serviceRoleKey: 'your-service-role-key'
};
```

#### 2.3 SMTP 配置 (可选)

用于测试邮件发送：

```typescript
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
};
```

### 3. 测试功能 (Testing Panel)

#### 3.1 发送测试邮件

```typescript
const testRequest = {
  emailType: 'welcome',
  locale: 'en',
  recipientEmail: 'test@example.com',
  variables: {
    user_name: 'John Doe',
    confirmation_url: 'https://example.com/confirm?token=abc123'
  }
};
```

#### 3.2 预览邮件

在发送前可以预览邮件的 HTML 内容，确保样式和内容正确。

### 4. 部署管理 (Deployment Panel)

#### 4.1 批量部署

选择多个模板类型和语言进行批量部署到 Supabase：

```typescript
const deploymentConfig = {
  templates: ['welcome', 'confirmation', 'reset-password'],
  locales: ['en', 'zh-TW'],
  // 总共会部署 6 个模板 (3 types × 2 locales)
};
```

#### 4.2 部署状态监控

实时监控部署进度和状态：
- `pending`: 等待部署
- `deploying`: 部署中
- `success`: 部署成功
- `failed`: 部署失败

#### 4.3 版本回滚

支持回滚到之前的部署版本：

```typescript
// 通过 UI 界面选择历史版本进行回滚
const rollbackToVersion = 'deployment-id-123';
```

### 5. 统计分析 (Email Stats)

#### 5.1 发送统计

- 总模板数量
- 邮件发送总量
- 成功率统计
- 支持语言数量

#### 5.2 使用分析

- 各模板类型使用频率
- 语言分布统计
- 最近活动记录

## API 集成

### 1. 状态管理

使用 Zustand store 进行状态管理：

```typescript
import { useEmailManagementStore } from '@rolitt/admin';

function MyComponent() {
  const {
    templates,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = useEmailManagementStore();

  // 使用状态和方法
}
```

### 2. 自定义 Hooks

提供多个自定义 hooks：

```typescript
import { 
  useEmailTemplates,
  useEmailPreview,
  useEmailConfiguration,
  useEmailTesting,
  useEmailDeployment
} from '@rolitt/admin';
```

### 3. 类型定义

完整的 TypeScript 类型支持：

```typescript
import type {
  EmailTemplate,
  EmailConfiguration,
  EmailTestRequest,
  EmailDeploymentStatus
} from '@rolitt/admin';
```

## 最佳实践

### 1. 模板设计

- **变量命名**: 使用清晰的变量名，如 `{{user_name}}` 而不是 `{{u}}`
- **内容结构**: 保持邮件内容简洁明了
- **多语言**: 确保所有支持的语言都有对应的模板
- **测试**: 在部署前充分测试所有模板

### 2. 配置管理

- **环境分离**: 开发、测试、生产环境使用不同的配置
- **密钥安全**: 妥善保管 Supabase 服务角色密钥
- **备份**: 定期备份配置和模板数据

### 3. 部署策略

- **渐进部署**: 先部署少量模板进行测试
- **版本控制**: 保持部署版本的清晰记录
- **回滚准备**: 确保能够快速回滚到稳定版本

### 4. 监控和维护

- **定期检查**: 定期检查邮件发送状态和成功率
- **性能监控**: 监控模板加载和部署性能
- **用户反馈**: 收集用户对邮件内容的反馈

## 故障排除

### 1. 常见问题

#### Supabase 连接失败
- 检查项目 URL 是否正确
- 验证 API 密钥是否有效
- 确认网络连接正常

#### 模板部署失败
- 检查模板内容格式是否正确
- 验证变量名称是否匹配
- 确认 Supabase 权限设置

#### 测试邮件发送失败
- 检查 SMTP 配置是否正确
- 验证邮箱地址格式
- 确认邮件服务商设置

### 2. 调试技巧

- 使用浏览器开发者工具查看网络请求
- 检查控制台错误信息
- 使用预览功能验证模板内容
- 查看部署历史记录

## 扩展开发

### 1. 添加新模板类型

```typescript
// 1. 在类型定义中添加新类型
type EmailType = 'welcome' | 'confirmation' | 'new-type';

// 2. 在模板管理器中添加对应的处理逻辑
// 3. 更新 UI 组件以支持新类型
```

### 2. 添加新语言支持

```typescript
// 1. 在支持的语言列表中添加新语言
const SUPPORTED_LOCALES = ['en', 'zh-TW', 'ja', 'new-locale'];

// 2. 添加对应的语言标签
const LOCALE_LABELS = {
  'new-locale': 'New Language'
};

// 3. 创建对应语言的模板内容
```

### 3. 自定义组件

```typescript
import { EmailManagement } from '@rolitt/admin';

// 自定义邮件管理组件
function CustomEmailManagement() {
  return (
    <div className="custom-email-management">
      <EmailManagement />
      {/* 添加自定义功能 */}
    </div>
  );
}
```

## 总结

邮件管理集成模块提供了完整的邮件模板管理解决方案，从模板创建、配置管理、测试验证到部署监控，覆盖了邮件管理的全生命周期。通过可视化的界面和强大的功能，大大简化了邮件模板的管理工作，提高了开发和运维效率。