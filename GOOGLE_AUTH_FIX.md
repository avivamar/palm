# Google 登录重定向错误修复指南

## 问题描述

当前 Google 登录后跳转到 `https://www.thepalmistry.life/zh-HK/sign-in?error=auth_callback_error`，这是因为环境变量配置不一致和重定向 URL 配置错误导致的。

## 根本原因分析

1. **环境变量不一致**：
   - 本地开发环境使用 `http://localhost:3000`
   - 生产环境需要使用 `https://www.thepalmistry.life`
   - `.env.example` 中之前配置的是错误的域名 `https://www.rolitt.com`

2. **重定向 URL 配置问题**：
   - Supabase Auth 需要正确的重定向 URL
   - Google Cloud Console 需要配置正确的授权重定向 URI
   - 应用代码中的 `redirectTo` 参数需要指向正确的回调地址

## 解决方案

### 1. 环境变量配置

#### 生产环境 (Vercel)
确保以下环境变量设置正确：

```bash
NEXT_PUBLIC_APP_URL=https://www.thepalmistry.life
SITE_URL=https://www.thepalmistry.life
NEXT_PUBLIC_SITE_URL=https://www.thepalmistry.life
```

#### 本地开发环境 (.env.local)
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Supabase Dashboard 配置

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication** → **Providers**
4. 启用 **Google** 提供商
5. 配置以下设置：
   - **Client ID**: 你的 Google OAuth Client ID
   - **Client Secret**: 你的 Google OAuth Client Secret

6. 在 **Authentication** → **URL Configuration** 中添加重定向 URL：
   ```
   http://localhost:3000/api/auth/callback
   https://www.thepalmistry.life/api/auth/callback
   ```

### 3. Google Cloud Console 配置

1. 登录 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择你的项目
3. 进入 **APIs & Services** → **Credentials**
4. 选择你的 OAuth 2.0 客户端 ID
5. 在 **Authorized JavaScript origins** 中添加：
   ```
   http://localhost:3000
   https://www.thepalmistry.life
   ```

6. 在 **Authorized redirect URIs** 中添加：
   ```
   https://[your-supabase-project].supabase.co/auth/v1/callback
   ```

### 4. 代码检查

确保以下文件中的重定向配置正确：

#### `src/libs/supabase/auth.ts`
```typescript
const origin = typeof window !== 'undefined' 
  ? window.location.origin 
  : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const { data, error } = await this.supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${origin}/api/auth/callback`,
  },
});
```

#### `src/app/api/auth/callback/route.ts`
确保回调路由正确处理重定向：
```typescript
// 成功时重定向到 dashboard
return NextResponse.redirect(`${origin}/${locale}/dashboard`);

// 失败时重定向到登录页面
return NextResponse.redirect(`${origin}/${locale}/sign-in?error=auth_callback_error`);
```

### 5. 验证步骤

1. **本地测试**：
   ```bash
   npm run dev
   ```
   访问 `http://localhost:3000/en/auth-test` 测试 Google 登录

2. **生产环境测试**：
   部署到 Vercel 后，访问 `https://www.thepalmistry.life/en/auth-test` 测试

3. **检查重定向流程**：
   - 点击 Google 登录按钮
   - 应该跳转到 Google 授权页面
   - 授权后应该跳转回 `/api/auth/callback`
   - 最终重定向到 `/dashboard` 页面

### 6. 常见问题排查

#### 问题：`auth_callback_error`
**原因**：回调处理失败
**解决**：检查 Supabase 配置和环境变量

#### 问题：`redirect_uri_mismatch`
**原因**：Google Cloud Console 中的重定向 URI 配置错误
**解决**：确保添加了正确的 Supabase 回调 URL

#### 问题：无限重定向循环
**原因**：环境变量配置错误或回调路由逻辑问题
**解决**：检查 `NEXT_PUBLIC_SITE_URL` 和回调路由实现

### 7. 监控和调试

使用以下工具进行调试：

1. **浏览器开发者工具**：查看网络请求和重定向
2. **Supabase Dashboard**：查看认证日志
3. **Vercel Dashboard**：查看函数日志
4. **测试页面**：使用 `/auth-test` 页面进行系统检查

## 部署清单

- [ ] 更新生产环境变量
- [ ] 配置 Supabase 重定向 URL
- [ ] 配置 Google Cloud Console 授权 URI
- [ ] 测试本地开发环境
- [ ] 测试生产环境
- [ ] 验证所有语言版本的重定向

## 相关文件

- `src/libs/supabase/auth.ts` - Supabase 认证服务
- `src/app/api/auth/callback/route.ts` - OAuth 回调处理
- `src/components/auth/GoogleSignInButton.tsx` - Google 登录按钮
- `src/app/[locale]/auth-test/page.tsx` - 认证测试页面
- `.env.example` - 环境变量模板
- `vercel.json` - Vercel 部署配置

---

**注意**：修改配置后，需要重新部署应用并清除浏览器缓存进行测试。