# 🚀 CI/CD 配置指南

本文档详细说明了项目的 CI/CD 配置，包括 GitHub Actions 和 Railway 部署的完整设置。

## 📋 目录

- [GitHub Actions 配置](#github-actions-配置)
- [Railway 部署配置](#railway-部署配置)
- [环境变量设置](#环境变量设置)
- [部署流程](#部署流程)
- [监控和通知](#监控和通知)
- [故障排查](#故障排查)

## 🔧 GitHub Actions 配置

### 工作流文件

项目包含以下 GitHub Actions 工作流：

1. **主 CI/CD 流水线** (`.github/workflows/ci.yml`)
   - 代码质量检查 (ESLint, TypeScript)
   - 单元测试和覆盖率
   - 构建测试
   - E2E 测试 (Playwright)
   - Storybook 测试
   - 安全扫描
   - 多环境部署
   - 性能监控 (Lighthouse)

2. **Railway 专用部署** (`.github/workflows/railway-deploy.yml`)
   - 生产环境部署
   - 健康检查
   - 烟雾测试
   - 性能检查
   - 通知系统

3. **依赖更新** (`.github/dependabot.yml`)
   - 自动依赖更新
   - 安全补丁
   - GitHub Actions 更新

### 触发条件

| 工作流 | 触发条件 | 目标环境 |
|--------|----------|----------|
| CI/CD 主流水线 | Push to `main`/`develop`, PR | 多环境 |
| Railway 部署 | Push to `main`, 手动触发 | Production/Staging |
| 依赖更新 | 每周一 09:00 | - |

## 🚂 Railway 部署配置

### railway.json 配置

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build",
    "watchPatterns": ["src/**/*", "public/**/*", "package.json"]
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/webhook/health",
    "healthcheckTimeout": 300
  }
}
```

### 部署特性

- ✅ **自动健康检查**: `/api/webhook/health` 端点
- ✅ **故障重启**: 最多重试 10 次
- ✅ **文件监控**: 自动检测代码变更
- ✅ **构建优化**: 缓存依赖和构建产物

## 🔐 环境变量设置

### GitHub Secrets 配置

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中配置：

#### 必需的 Secrets

```bash
# Railway 部署
RAILWAY_TOKEN=your_railway_token
RAILWAY_SERVICE_ID=your_service_id
RAILWAY_STAGING_SERVICE_ID=your_staging_service_id

# Vercel 部署 (可选)
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Cloudflare 部署 (可选)
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id

# 代码质量
CODECOV_TOKEN=your_codecov_token
SNYK_TOKEN=your_snyk_token

# 通知
SLACK_WEBHOOK=your_slack_webhook_url
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
NOTIFICATION_EMAIL=admin@rolitt.com
```

#### 可选的 Secrets

```bash
# 性能监控
LIGHTHOUSE_TOKEN=your_lighthouse_token

# 安全扫描
SONARCLOUD_TOKEN=your_sonarcloud_token
```

### Railway 环境变量

在 Railway 项目设置中配置生产环境变量：

```bash
# 应用配置
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
APP_URL=https://www.rolitt.com
SITE_URL=https://www.rolitt.com

# 数据库
DATABASE_URL=postgresql://...

# 认证
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# 支付
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRODUCT_ID=prod_...

# 营销
KLAVIYO_API_KEY=your_klaviyo_key
KLAVIYO_LIST_ID=your_list_id
```

## 🔄 部署流程

### 自动部署

1. **开发流程**
   ```bash
   git checkout develop
   git add .
   git commit -m "feat: new feature"
   git push origin develop
   ```
   → 触发 CI 检查 + Cloudflare 部署

2. **生产发布**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```
   → 触发完整 CI/CD + Railway 生产部署

### 手动部署

1. **GitHub Actions 手动触发**
   - 访问 Actions 页面
   - 选择 "Railway Deployment"
   - 点击 "Run workflow"
   - 选择环境 (production/staging)

2. **Railway CLI 部署**
   ```bash
   # 安装 Railway CLI
   npm install -g @railway/cli

   # 登录
   railway login

   # 部署
   railway up
   ```

## 📊 监控和通知

### 健康检查

- **端点**: `https://www.rolitt.com/api/webhook/health`
- **检查频率**: 每次部署后
- **超时时间**: 300 秒
- **重试次数**: 5 次

### 性能监控

- **Lighthouse CI**: 自动性能评分
- **Core Web Vitals**: LCP, FID, CLS 监控
- **阈值设置**:
  - Performance: ≥ 80
  - Accessibility: ≥ 90
  - Best Practices: ≥ 90
  - SEO: ≥ 90

### 通知系统

1. **Slack 通知**
   - 部署成功/失败
   - 性能警告
   - 安全漏洞

2. **邮件通知**
   - 部署失败
   - 严重错误
   - 安全警报

## 🔍 故障排查

### 常见问题

#### 1. 构建失败

```bash
# 检查依赖
npm audit
npm run check-types
npm run lint

# 本地构建测试
npm run build
```

#### 2. 部署失败

```bash
# 检查环境变量
npm run check-env

# 检查 Railway 状态
railway status

# 查看部署日志
railway logs
```

#### 3. 健康检查失败

```bash
# 测试健康端点
curl -f https://www.rolitt.com/api/webhook/health

# 检查应用日志
railway logs --tail

# 检查数据库连接
npm run test-db-fix
```

### 调试工具

1. **本地调试**
   ```bash
   npm run dev
   npm run check-status
   npm run verify-fixes
   ```

2. **生产调试**
   ```bash
   # 访问调试页面
   https://www.rolitt.com/debug-payment

   # 查看 Webhook 日志
   https://www.rolitt.com/api/webhook/logs
   ```

### 回滚策略

1. **自动回滚**
   - 健康检查失败时自动回滚
   - 性能阈值不达标时警告

2. **手动回滚**
   ```bash
   # Railway 回滚
   railway rollback

   # Git 回滚
   git revert HEAD
   git push origin main
   ```

## 📈 优化建议

### 构建优化

1. **缓存策略**
   - npm 依赖缓存
   - Next.js 构建缓存
   - Docker 层缓存

2. **并行执行**
   - 测试并行运行
   - 多环境同时部署
   - 独立的质量检查

### 安全增强

1. **代码扫描**
   - Snyk 漏洞扫描
   - CodeQL 分析
   - 依赖审计

2. **访问控制**
   - 分支保护规则
   - 必需的状态检查
   - 代码审查要求

## 📚 相关文档

- [部署清单](../DEPLOYMENT_CHECKLIST.md)
- [部署指南](../DEPLOYMENT_GUIDE.md)
- [Webhook 配置](./webhook-logs-config.md)
- [数据库操作指南](./database-operations-guide.md)

---

**维护者**: Rolitt 开发团队
**最后更新**: 2025-01-08
**版本**: 1.0.0
