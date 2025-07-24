# Redis 迁移指南：从 Railway 到 Upstash

## 📋 迁移概述

本指南将帮助你将 Redis 服务从 Railway 迁移到 Upstash，以获得更好的备份支持、成本效益和无服务器友好的体验。

## 🔍 为什么选择 Upstash？

### Railway Redis 的限制
- ❌ **无备份功能**：数据丢失风险高
- ❌ **成本较高**：按时间计费，即使空闲也收费
- ❌ **维护复杂**：需要手动管理和监控
- ❌ **扩展限制**：垂直扩展选项有限

### Upstash Redis 的优势
- ✅ **自动备份**：内置数据备份和恢复
- ✅ **按请求计费**：只为实际使用付费
- ✅ **全球分布**：边缘计算支持，延迟更低
- ✅ **无服务器友好**：完美适配 Vercel、Netlify 等平台
- ✅ **零运维**：无需管理服务器和更新
- ✅ **高可用性**：内置故障转移

## 🚀 迁移步骤

### 步骤 1：创建 Upstash 账户

1. 访问 [Upstash Console](https://console.upstash.com/)
2. 使用 GitHub 或 Google 账户注册
3. 验证邮箱地址

### 步骤 2：创建 Redis 数据库

1. 在 Upstash Console 中点击 "Create Database"
2. 配置数据库：
   ```
   Name: rolitt-redis
   Region: 选择离你的用户最近的区域
   Type: Regional (推荐) 或 Global (如果需要全球分布)
   ```
3. 点击 "Create"

### 步骤 3：获取连接信息

1. 在数据库详情页面，找到 "REST API" 部分
2. 复制 **Redis URL**，格式类似：
   ```
   rediss://default:your-password@your-endpoint.upstash.io:6380
   ```

### 步骤 4：更新环境变量

#### 本地开发环境

更新 `.env.local` 文件：
```bash
# 注释掉旧的 Railway Redis URL
# REDIS_URL="redis://default:password@redis.railway.internal:6379"

# 添加新的 Upstash Redis URL
REDIS_URL="rediss://default:your-password@your-endpoint.upstash.io:6380"
```

#### 生产环境 (Railway)

1. 登录 Railway Dashboard
2. 选择你的项目
3. 进入 "Variables" 设置
4. 更新 `REDIS_URL` 变量为 Upstash 的连接字符串

#### 生产环境 (Vercel)

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 进入 "Settings" > "Environment Variables"
4. 更新 `REDIS_URL` 变量

### 步骤 5：数据迁移 (可选)

如果你有重要的缓存数据需要迁移：

1. **导出 Railway Redis 数据**：
   ```bash
   # 连接到 Railway Redis
   redis-cli -h redis.railway.internal -p 6379 -a your-password

   # 导出所有键
   redis-cli -h redis.railway.internal -p 6379 -a your-password --scan > keys.txt

   # 导出数据
   redis-cli -h redis.railway.internal -p 6379 -a your-password --rdb dump.rdb
   ```

2. **导入到 Upstash**：
   ```bash
   # 连接到 Upstash Redis
   redis-cli -u "rediss://default:your-password@your-endpoint.upstash.io:6380"

   # 导入数据
   redis-cli -u "rediss://default:your-password@your-endpoint.upstash.io:6380" --pipe < dump.rdb
   ```

**注意**：由于缓存数据通常是临时的，建议直接切换而不迁移数据。

### 步骤 6：测试连接

1. **本地测试**：
   ```bash
   npm run dev
   ```

2. **检查 Redis 连接**：
   访问 `http://localhost:3001/zh-HK/admin/scripts` 查看系统健康状态

3. **验证缓存功能**：
   - 访问管理面板的性能监控页面
   - 检查缓存统计数据
   - 确认缓存命中率正常

### 步骤 7：清理 Railway Redis

确认 Upstash 工作正常后：

1. 登录 Railway Dashboard
2. 找到 Redis 服务
3. 删除 Redis 服务以停止计费

## 🔧 配置优化

### Upstash 特定配置

在 `src/libs/performance/cache-manager.ts` 中，Upstash 连接已经优化：

```typescript
// 现有配置已经兼容 Upstash
this.redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: this.config.maxRetries,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
});
```

### 性能优化建议

1. **TTL 策略**：
   ```typescript
   // 用户权限缓存：5分钟
   await cache.set('user:permissions:123', permissions, 300);

   // API 响应缓存：1小时
   await cache.set('api:response:key', data, 3600);

   // 静态数据缓存：24小时
   await cache.set('static:config', config, 86400);
   ```

2. **键命名规范**：
   ```typescript
   // 使用项目前缀
   const key = `rolitt:${type}:${id}`;
   ```

## 📊 成本对比

### Railway Redis
- **基础费用**：$5/月 (即使不使用)
- **内存费用**：按 GB 计费
- **无备份**：需要额外付费

### Upstash Redis
- **免费额度**：10,000 请求/天
- **按请求计费**：$0.2 per 100K 请求
- **包含备份**：自动备份和恢复
- **预估成本**：中小型项目 < $5/月

## 🔍 监控和维护

### 监控指标

1. **连接状态**：通过健康检查 API 监控
2. **缓存命中率**：目标 > 80%
3. **响应时间**：目标 < 50ms
4. **错误率**：目标 < 1%

### 告警设置

在 Upstash Console 中设置告警：
- 连接失败告警
- 高延迟告警
- 内存使用告警

## 🚨 故障排除

### 常见问题

1. **连接超时**：
   ```bash
   # 检查网络连接
   telnet your-endpoint.upstash.io 6380
   ```

2. **认证失败**：
   - 确认 Redis URL 格式正确
   - 检查密码是否包含特殊字符需要编码

3. **SSL 证书问题**：
   ```typescript
   // 在开发环境中可以禁用 SSL 验证
   const redis = new Redis(process.env.REDIS_URL, {
     tls: {
       rejectUnauthorized: false // 仅开发环境
     }
   });
   ```

### 回滚计划

如果遇到问题，可以快速回滚：

1. 恢复原来的 `REDIS_URL` 环境变量
2. 重新部署应用
3. 检查系统功能正常

## ✅ 迁移检查清单

- [ ] 创建 Upstash 账户和数据库
- [ ] 获取 Redis 连接字符串
- [ ] 更新本地环境变量
- [ ] 测试本地连接
- [ ] 更新生产环境变量
- [ ] 部署到生产环境
- [ ] 验证生产环境功能
- [ ] 监控系统性能
- [ ] 清理 Railway Redis 资源
- [ ] 更新文档和团队

## 📚 相关资源

- [Upstash 官方文档](https://docs.upstash.com/)
- [Redis 最佳实践](https://redis.io/docs/manual/)
- [项目缓存管理文档](../src/libs/performance/cache-manager.ts)
- [系统健康监控](../src/app/api/admin/health/)
---

**迁移完成后，你将获得更可靠、更经济的 Redis 服务，同时享受自动备份和全球分布的优势。**
