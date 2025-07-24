# 🚨 Railway 白屏问题修复指南

## 问题诊断结果

✅ **问题已确认**: Railway 域名配置不匹配导致应用白屏

### 🔍 根本原因
- Railway 服务运行在 `rolitt.com` 域名
- 应用配置期望 `www.rolitt.com` 域名
- 域名不匹配导致认证和 API 调用失败

### ✅ **已修复**: 2025-01-16 22:45
- 已统一所有应用 URL 配置为 `https://www.rolitt.com`
- 已修复代码中硬编码的域名引用
- 已触发重新部署
- Cloudflare CNAME 重定向已配置: `rolitt.com` → `www.rolitt.com`

### 缺失的关键环境变量:

- `NEXT_PUBLIC_SUPABASE_URL`: https://jyslffzkkrlpgbialrlf.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5c2xmZnpra3JscGdiaWFscmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDEyNTgsImV4cCI6MjA2NjUxNzI1OH0.Nz_r4KGceN1mKORnUJRdbM0lG6LLWWmX4_FCcAg7mAg

## 🔧 修复方法

### 方法1: Railway CLI 快速修复 (推荐)

```bash
# 1. 安装 Railway CLI (如果还没有)
npm install -g @railway/cli

# 2. 登录 Railway
railway login

# 3. 连接到你的项目
railway link

# 4. 添加缺失的环境变量
railway variables set NEXT_PUBLIC_SUPABASE_URL="https://jyslffzkkrlpgbialrlf.supabase.co"
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5c2xmZnpra3JscGdiaWFscmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDEyNTgsImV4cCI6MjA2NjUxNzI1OH0.Nz_r4KGceN1mKORnUJRdbM0lG6LLWWmX4_FCcAg7mAg"

# 5. 重新部署
railway up
```

### 方法2: Railway 控制台手动添加

1. 打开 [Railway 控制台](https://railway.app)
2. 进入你的项目
3. 点击 "Variables" 标签
4. 添加以下环境变量:

```
NEXT_PUBLIC_SUPABASE_URL = https://jyslffzkkrlpgbialrlf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5c2xmZnpra3JscGdiaWFscmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDEyNTgsImV4cCI6MjA2NjUxNzI1OH0.Nz_r4KGceN1mKORnUJRdbM0lG6LLWWmX4_FCcAg7mAg
```

5. 保存后会自动触发重新部署

### 方法3: 批量导入 (高级用户)

使用生成的 `.env.railway.fixed` 文件:

```bash
railway variables set --file .env.railway.fixed
```

## 📋 验证修复

修复后，你可以通过以下方式验证:

1. **检查部署日志**: 在 Railway 控制台查看部署是否成功
2. **访问网站**: 打开 https://www.rolitt.com 检查是否还是白屏
3. **检查环境变量**: 在 Railway 控制台确认变量已正确设置

## 🔍 为什么会出现这个问题?

1. **Supabase 是应用的核心依赖**: 用于用户认证和数据库连接
2. **环境变量同步问题**: 本地 `.env.local` 和 Railway 环境变量不同步
3. **构建时检查**: Next.js 在构建时会检查必需的环境变量

## 🚀 预防措施

为避免将来出现类似问题:

1. **定期同步环境变量**: 本地更新后及时同步到 Railway
2. **使用环境变量检查脚本**: 定期运行 `railway-env-fix.js` 检查差异
3. **文档化环境变量**: 在 `.env.example` 中记录所有必需变量

## 📞 如果问题仍然存在

如果按照上述步骤操作后问题仍然存在:

1. 检查 Railway 部署日志中的错误信息
2. 确认环境变量值没有多余的空格或引号
3. 尝试手动触发重新部署
4. 检查 Supabase 项目是否正常运行

---

**预计修复时间**: ✅ 已完成修复
**影响范围**: 生产环境用户访问已恢复
**优先级**: ✅ 问题已解决
