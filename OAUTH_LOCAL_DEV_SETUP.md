# Google OAuth 回调URL统一配置指南

## 问题描述
OAuth回调URL不一致导致重定向问题：
- **Supabase默认**: `/auth/v1/callback`
- **生产环境**: `/auth/v1/callback`
- **我们的Next.js**: `/api/auth/callback`

## ✅ 已修复的问题

### 1. 环境变量配置
✅ `.env.local` 已更新为本地开发配置

### 2. 回调URL路径统一
✅ 创建了标准回调路由 `/auth/callback` → `/api/auth/callback`
✅ 修复了代码中的硬编码回调路径
✅ 现在支持两种回调路径：
- `/auth/callback` (Supabase标准)
- `/api/auth/callback` (Next.js API路由)

### 3. 需要配置的回调URL

现在你需要在Supabase和Google Cloud Console中配置以下URL：

#### 本地开发环境:
```
http://localhost:3000/auth/callback
http://localhost:3000/api/auth/callback
```

#### 生产环境:
```
https://www.rolitt.com/auth/callback
https://www.rolitt.com/api/auth/callback
```

## 📋 Supabase Dashboard配置步骤

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 `jyslffzkkrlpgbialrlf`
3. 进入 `Authentication` > `Providers` > `Google`
4. 在 `Site URL` 中设置:
   ```
   本地: http://localhost:3000
   生产: https://www.rolitt.com
   ```
5. 在 `Redirect URLs` 中添加:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/api/auth/callback
   https://www.rolitt.com/auth/callback
   https://www.rolitt.com/api/auth/callback
   ```

## 📋 Google Cloud Console配置步骤

1. 进入 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择项目
3. 进入 `APIs & Services` > `Credentials`
4. 找到OAuth 2.0客户端ID
5. 在 `Authorized redirect URIs` 中添加:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/api/auth/callback
   https://www.rolitt.com/auth/callback
   https://www.rolitt.com/api/auth/callback
   ```

## 🔄 回调流程

现在的OAuth流程：
1. 用户点击Google登录
2. 重定向到Google OAuth
3. Google重定向回 `/auth/callback` 或 `/api/auth/callback`
4. 如果是 `/auth/callback`，会自动重定向到 `/api/auth/callback`
5. `/api/auth/callback` 处理认证并重定向到dashboard

## ✅ 测试步骤

1. 重启开发服务器: `npm run dev`
2. 访问调试页面: `http://localhost:3000/api/debug/oauth-config`
3. 测试Google登录
4. 验证重定向到: `http://localhost:3000/[locale]/dashboard`

## 🐛 调试信息

查看服务器控制台输出，现在会显示详细的OAuth重定向日志：
- `🔄 标准OAuth回调重定向`
- `🔗 OAuth回调处理`
- `✅ OAuth成功，重定向到`
- `❌ OAuth失败，重定向到`
