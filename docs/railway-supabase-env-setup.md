# 🚂 Railway Supabase 环境变量配置指南

## 🚨 问题描述

部署到 Railway 后出现 Supabase 配置错误：
```
Supabase configuration is incomplete. Please check environment variables:
- NEXT_PUBLIC_SUPABASE_URL: ❌ Missing
- NEXT_PUBLIC_SUPABASE_ANON_KEY: ❌ Missing
```

## 🔍 根本原因

1. **环境变量缺失**：Railway 项目中未配置 Supabase 环境变量
2. **构建时依赖**：`NEXT_PUBLIC_*` 变量需要在构建时可用才能嵌入到客户端包中
3. **运行时检测**：应用在运行时检测到占位符值，判定为配置不完整

## 🛠️ 解决方案

### 步骤 1：在 Railway 中添加环境变量

1. 登录 [Railway Dashboard](https://railway.app/dashboard)
2. 选择你的项目
3. 点击 **Variables** 标签
4. 添加以下环境变量：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://jyslffzkkrlpgbialrlf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5c2xmZnpra3JscGdiaWFscmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDEyNTgsImV4cCI6MjA2NjUxNzI1OH0.Nz_r4KGceN1mKORnUJRdbM0lG6LLWWmX4_FCcAg7mAg
```

### 步骤 2：重新部署

添加环境变量后，Railway 会自动触发重新部署。如果没有，可以手动触发：

1. 在 Railway Dashboard 中点击 **Deploy** 按钮
2. 或者推送新的代码到 GitHub 仓库

### 步骤 3：验证配置

部署完成后，访问你的应用并检查浏览器控制台，确认不再出现 Supabase 配置错误。

## 🔧 技术细节

### 构建时处理

我们的构建脚本 (`scripts/railway-safe-build.sh`) 会：

1. **检测环境变量**：检查是否存在真实的 Supabase 配置
2. **设置占位符**：如果缺失，设置构建时占位符避免构建失败
3. **运行时验证**：应用启动时检测占位符并显示配置错误

### 环境变量验证逻辑

```typescript
// src/libs/supabase/config.ts
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL
  && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('build-placeholder')
  && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('build_time_placeholder')
);
```

## 📋 环境变量清单

### 必需的 Supabase 环境变量

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥

### 可选的服务端环境变量

- `SUPABASE_SERVICE_ROLE_KEY` - 服务端 API 密钥（暂时不需要）

## 🚀 最佳实践

### 1. 环境变量管理

- 在 Railway 中使用 **Variables** 功能统一管理环境变量
- 考虑使用 Railway 的 **Environment** 功能分离开发和生产环境
- 定期检查环境变量的有效性

### 2. 安全考虑

- `NEXT_PUBLIC_*` 变量会暴露在客户端，确保不包含敏感信息
- 使用 Supabase 的 RLS (Row Level Security) 保护数据
- 定期轮换 API 密钥

### 3. 监控和调试

- 使用 Railway 的日志功能监控部署状态
- 在应用中添加环境变量状态检查端点
- 设置告警监控关键功能的可用性

## 🔍 故障排除

### 问题：环境变量设置后仍然报错

**解决方案：**
1. 确认环境变量名称完全正确（区分大小写）
2. 检查环境变量值是否包含额外的空格或换行符
3. 重新部署应用
4. 清除浏览器缓存

### 问题：构建失败

**解决方案：**
1. 检查 Railway 构建日志
2. 确认所有必需的环境变量都已设置
3. 验证环境变量值的格式是否正确

### 问题：应用运行但功能异常

**解决方案：**
1. 检查浏览器控制台的错误信息
2. 验证 Supabase 项目状态
3. 测试 Supabase 连接性

## 📞 获取帮助

如果问题仍然存在，请：

1. 检查 Railway 部署日志
2. 查看浏览器控制台错误
3. 参考 [Supabase 文档](https://supabase.com/docs)
4. 联系技术支持团队

---

**最后更新：** 2025-01-15
**相关文件：**
- `src/libs/supabase/config.ts`
- `src/libs/Env.ts`
- `scripts/railway-safe-build.sh`
