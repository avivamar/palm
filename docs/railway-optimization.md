# Railway 容器部署优化指南

## 概述

Railway 是基于容器的部署平台，与 Vercel 的 Edge Runtime 有本质区别。本文档详细说明了针对 Railway 容器部署的优化策略。

## Railway vs Vercel 核心差异

### 部署架构

| 特性 | Railway | Vercel |
|------|---------|--------|
| 运行环境 | 容器化 (Docker/Nixpacks) | Edge Runtime + Serverless Functions |
| 构建方式 | 传统 Node.js 构建 | 优化的 Edge 构建 |
| 冷启动 | 容器启动时间 | 几乎无冷启动 |
| 持久化 | 支持文件系统持久化 | 无状态，依赖外部存储 |
| 数据库 | 内置 PostgreSQL 支持 | 需要外部数据库服务 |
| 定价模型 | 基于资源使用 | 基于请求数量 |

### 性能特点

**Railway 优势：**
- 完整的 Node.js 环境支持
- 更好的数据库集成
- 支持长时间运行的进程
- 更灵活的文件系统操作

**Vercel 优势：**
- 全球 CDN 分发
- 更快的冷启动
- 自动缩放
- 更好的静态资源优化

## Railway 优化策略

### 1. 构建优化

#### Nixpacks 配置 (`.nixpacks.toml`)

```toml
# 使用特定的 Node.js 版本
[phases.setup]
nixPkgs = [
  'nodejs_20',
  'npm-9_x',
]

# 优化依赖安装
[phases.install]
cmds = [
  'npm ci --only=production --no-audit --no-fund',
  'npm cache clean --force'
]

# 构建缓存
[build]
cache = true
timeout = 1800
```

#### Railway.json 优化

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci --only=production --no-audit --no-fund && npm run build",
    "watchPatterns": ["**/*.ts", "**/*.tsx", "package.json"]
  },
  "deploy": {
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### 2. Next.js 配置优化

#### 容器友好的配置

```typescript
// next.config.ts
const nextConfig = {
  // 禁用 Vercel 特定功能
  experimental: {
    // 启用独立模式，减少依赖
    outputStandalone: true,
  },

  // 优化图片处理
  images: {
    // 使用本地优化而非 Vercel 的图片服务
    loader: 'default',
    domains: ['your-domain.com'],
  },

  // 输出配置
  output: 'standalone', // 生成独立的应用包
};
```

### 3. 环境变量管理

#### Railway 环境变量

```bash
# 生产环境优化
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000

# 内存优化
NODE_OPTIONS="--max-old-space-size=2048"

# 数据库连接
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### 4. 健康检查实现

创建 `/api/health` 端点用于容器健康监控：

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
}
```

### 5. 数据库优化

#### PostgreSQL 连接池

```typescript
// src/libs/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway 容器优化
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 6. 性能监控

#### 容器指标监控

```typescript
// 内存使用监控
const memoryUsage = process.memoryUsage();
console.log('Memory usage:', {
  rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
  heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
  heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
});
```

### 7. 部署流程优化

#### CI/CD 管道

```yaml
# .github/workflows/railway-deploy.yml
name: Railway Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 缓存依赖
      - name: Cache node modules
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

      # 构建测试
      - name: Install and Build
        run: |
          npm ci
          npm run build
          npm run test

      # 部署到 Railway
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 性能基准测试

### 推荐的性能指标

- **启动时间**: < 30 秒
- **内存使用**: < 512MB (基础负载)
- **响应时间**: < 200ms (API 端点)
- **健康检查**: < 5 秒响应

### 监控工具

1. **Railway 内置监控**
   - CPU 使用率
   - 内存使用率
   - 网络流量

2. **应用级监控**
   - Sentry (错误监控)
   - PostHog (用户行为)
   - 自定义健康检查

## 故障排除

### 常见问题

1. **构建超时**
   - 增加构建超时时间
   - 优化依赖安装
   - 使用构建缓存

2. **内存不足**
   - 调整 NODE_OPTIONS
   - 优化图片处理
   - 减少并发连接

3. **数据库连接问题**
   - 检查连接池配置
   - 验证环境变量
   - 监控连接数量

### 调试命令

```bash
# 查看日志
railway logs --tail

# 检查服务状态
railway status

# 连接到容器
railway shell

# 重启服务
railway restart
```

## 最佳实践总结

1. **使用 Nixpacks 配置优化构建过程**
2. **实现健康检查端点**
3. **配置适当的重启策略**
4. **优化数据库连接池**
5. **监控容器资源使用**
6. **使用环境变量管理配置**
7. **实现渐进式部署**
8. **定期备份数据库**

## 成本优化

### Railway 定价考虑

- **CPU 使用**: 按实际使用计费
- **内存**: 按分配的内存计费
- **网络**: 按流量计费
- **存储**: 按使用的磁盘空间计费

### 优化建议

1. 使用适当的资源配置
2. 实现有效的缓存策略
3. 优化静态资源大小
4. 监控和调整资源使用

---

通过以上优化策略，可以充分发挥 Railway 容器部署的优势，同时避免常见的性能陷阱。
