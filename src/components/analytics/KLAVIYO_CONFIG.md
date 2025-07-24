# Klaviyo 环境变量配置指南

## 概述

Klaviyo 提供了两种不同类型的API密钥，用于不同的场景：

1. **公共密钥 (Company ID)** - 用于客户端/前端集成
2. **私有API密钥** - 用于服务端API调用

## 环境变量说明

### 1. NEXT_PUBLIC_KLAVIYO_COMPANY_ID

**用途**: 客户端前端脚本集成
**格式**: 6位字符的Company ID (也称为Site ID)
**示例**: `ABC123`
**使用场景**:
- 前端JavaScript脚本加载
- 客户端事件追踪
- 表单弹窗显示

```bash
NEXT_PUBLIC_KLAVIYO_COMPANY_ID=ABC123
```

### 2. KLAVIYO_API_KEY

**用途**: 服务端API调用
**格式**: 以 `pk_` 开头的私有API密钥
**示例**: `pk_5206d4e51a1c99d8c58eaa932b466bc342`
**使用场景**:
- 服务端添加用户到邮件列表
- 发送邮件
- 管理用户数据

```bash
KLAVIYO_API_KEY=pk_your_private_api_key_here
```

### 3. KLAVIYO_LIST_ID

**用途**: 指定要添加用户的邮件列表
**格式**: 短字符串ID
**示例**: `Vs8jNd`
**使用场景**:
- 用户订阅时指定目标列表
- 批量导入用户

```bash
KLAVIYO_LIST_ID=Vs8jNd
```

## 如何获取这些值

### 获取 Company ID (公共密钥)

1. 登录 Klaviyo 控制台
2. 点击左下角的账户图标 → Settings
3. 在左侧菜单中选择 "API Keys"
4. 在页面顶部可以看到 "Public API Key (Site ID)"
5. 这个6位字符的值就是你的 Company ID

### 获取私有 API 密钥

1. 在同一个 "API Keys" 页面
2. 点击 "Create Private API Key"
3. 给密钥命名（如："NextJS App"）
4. 选择权限范围（建议选择需要的最小权限）
5. 点击 "Create"
6. 复制生成的以 `pk_` 开头的密钥

### 获取 List ID

1. 在 Klaviyo 控制台中，点击 "Lists & Segments"
2. 选择你要使用的邮件列表
3. 在列表页面的URL中可以找到List ID
4. 或者通过API调用 `/api/lists/` 获取所有列表及其ID

## 安全注意事项

### ✅ 正确做法

- **公共密钥** (`NEXT_PUBLIC_KLAVIYO_COMPANY_ID`) 可以暴露在前端代码中
- **私有API密钥** (`KLAVIYO_API_KEY`) 只能在服务端使用，绝不能暴露在前端
- 使用 `.env.local` 文件存储敏感信息
- 确保 `.env.local` 文件在 `.gitignore` 中

### ❌ 错误做法

- 不要在前端代码中直接使用私有API密钥
- 不要将私有API密钥提交到版本控制系统
- 不要在公共环境变量（`NEXT_PUBLIC_*`）中存储私有密钥

## 使用示例

### 前端使用 (Company ID)

```typescript
// 客户端组件中
const companyId = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID

// 加载 Klaviyo 脚本
<Script
  src={`https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${companyId}`}
  strategy="lazyOnload"
/>
```

### 服务端使用 (私有API密钥)

```typescript
// API 路由中 (app/api/subscribe/route.ts)
export async function POST(request: Request) {
  const apiKey = process.env.KLAVIYO_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;

  const response = await fetch(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, {
    method: 'POST',
    headers: {
      'Authorization': `Klaviyo-API-Key ${apiKey}`,
      'Content-Type': 'application/json',
      'revision': '2023-05-11'
    },
    body: JSON.stringify({
      data: [{
        type: 'profile',
        attributes: {
          email: 'user@example.com'
        }
      }]
    })
  });
}
```

## 故障排除

### 常见错误

1. **"The API key specified is invalid"**
   - 检查是否使用了正确的API密钥格式
   - 确认私有API密钥以 `pk_` 开头
   - 验证API密钥是否有足够的权限

2. **"Company ID not found"**
   - 确认Company ID是6位字符
   - 检查是否使用了正确的公共密钥

3. **"List not found"**
   - 验证List ID是否正确
   - 确认列表是否存在且可访问

### 调试技巧

1. 在开发环境中启用调试模式：
   ```bash
   NEXT_PUBLIC_DEBUG_ANALYTICS=true
   ```

2. 检查浏览器控制台的错误信息

3. 使用Klaviyo的API测试工具验证密钥

## 参考资源

- [Klaviyo API 文档](https://developers.klaviyo.com/en/reference/api_overview) <mcreference link="https://developers.klaviyo.com/en/reference/api_overview" index="3">3</mcreference>
- [Klaviyo 认证指南](https://developers.klaviyo.com/en/docs/authenticate_api_requests)
- [Next.js 环境变量文档](https://nextjs.org/docs/app/guides/environment-variables) <mcreference link="https://nextjs.org/docs/app/guides/environment-variables" index="1">1</mcreference>
