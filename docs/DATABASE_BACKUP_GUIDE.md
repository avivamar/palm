# 数据库备份与恢复指南

## 概览

本项目提供了完整的数据库备份与恢复策略，支持自动化备份、手动备份和数据恢复功能。

## 🔧 备份系统架构

### 1. **Drizzle ORM 直接导出** (推荐)
- 脚本: `scripts/database-export.ts`
- 命令: `npm run backup:database`
- 优势: 直接访问数据库，完全控制导出过程
- 支持表: users, preorders, palm_analysis_sessions, user_images, webhook_logs

### 2. **Supabase API 备份** (备选)
- 脚本: `scripts/supabase-backup.ts`
- 命令: `npm run backup:supabase`
- 要求: 需要 Supabase 服务角色密钥
- 适用: 使用 Supabase 管理平台的项目

## 📋 可用命令

### 备份命令
```bash
# 标准数据库备份
npm run backup:database

# 完整备份到指定目录
npm run backup:database:full

# Supabase API 备份
npm run backup:supabase

# 检查备份文件状态
npm run backup:check
```

### 数据库优化命令
```bash
# 生成数据库迁移
npm run db:generate

# 执行数据库迁移
npm run db:migrate

# 打开数据库管理界面
npm run db:studio
```

## 📁 备份文件结构

```
backups/
├── database_export_2025-07-31T12-27-13-289Z.json      # 主备份文件
├── database_export_2025-07-31T12-27-13-289Z.json.meta # 元数据文件
└── ...其他备份文件
```

### 备份文件格式
```json
{
  "timestamp": "2025-07-31T12:27:13.289Z",
  "export_type": "drizzle_orm_export",
  "database_url": "postgres://***@***",
  "tables": {
    "users": {
      "data": [...],
      "count": 0,
      "exported_at": "2025-07-31T12:27:13.445Z"
    },
    "palm_analysis_sessions": {
      "data": [...],
      "count": 21,
      "exported_at": "2025-07-31T12:27:13.563Z"
    }
  }
}
```

### 元数据文件格式
```json
{
  "filename": "database_export_2025-07-31T12-27-13-289Z.json",
  "timestamp": "2025-07-31T12-27-13-289Z",
  "export_type": "drizzle_orm_export",
  "tables_count": 5,
  "total_records": 21,
  "file_size": 95542,
  "file_size_mb": "0.09"
}
```

## 🔄 自动化备份设置

### 1. Cron 配置
编辑 crontab (`crontab -e`) 并添加:

```bash
# 每天凌晨2点备份
0 2 * * * cd /path/to/palm && npm run backup:database >> /var/log/palm-backup.log 2>&1

# 每周日凌晨3点完整备份
0 3 * * 0 cd /path/to/palm && npm run backup:database:full >> /var/log/palm-backup.log 2>&1

# 每12小时高频备份
0 */12 * * * cd /path/to/palm && npm run backup:database >> /var/log/palm-backup.log 2>&1
```

### 2. 环境变量配置
确保以下环境变量正确设置:

```bash
# 数据库连接
DATABASE_URL="postgres://user:password@host:port/database"

# Supabase 配置 (如果使用 Supabase 备份)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# 备份目录 (可选)
BACKUP_DIR="./backups"
```

## 📊 监控与健康检查

### 1. 备份状态API
```bash
GET /api/admin/backup/status
```

返回备份文件状态、总大小、最新备份时间等信息。

### 2. 数据库健康检查API
```bash
GET /api/admin/database/health
```

提供数据库性能指标、连接状态、缓存命中率等。

### 3. 备份清理
```bash
DELETE /api/admin/backup/status
```

清理超过7天的旧备份文件。

## 🔧 数据库性能优化

项目已应用以下数据库优化:

### 索引优化
- 邮箱查找索引: `idx_users_email_lower`
- 状态过滤索引: `idx_preorders_status`, `idx_palm_sessions_status`
- 时间排序索引: `idx_preorders_created_at`, `idx_palm_sessions_created_at`
- 复合索引: `idx_preorders_status_created`, `idx_palm_sessions_conversion`

### 查询优化工具
文件: `src/libs/db-optimization.ts`

```typescript
import { optimizedQueries } from '@/libs/db-optimization';

// 用户查询
const users = await optimizedQueries.users.findByEmail('user@example.com');
const userStats = await optimizedQueries.users.getUserStats(userId);

// 订单查询
const recentOrders = await optimizedQueries.orders.getRecentOrders(10);
const orderStats = await optimizedQueries.orders.getOrderStats();

// Palm 分析查询
const userHistory = await optimizedQueries.palm.getUserAnalysisHistory(userId);
const pendingAnalysis = await optimizedQueries.palm.getPendingAnalysis();
```

## 🚨 故障排除

### 常见问题

1. **备份失败: "Database connection failed"**
   - 检查 `DATABASE_URL` 环境变量
   - 确认数据库服务正在运行
   - 检查网络连接

2. **Supabase 备份失败: "Invalid API key"**
   - 需要 `SUPABASE_SERVICE_ROLE_KEY` 而不是匿名密钥
   - 从 Supabase 控制台获取服务角色密钥

3. **备份文件为空**
   - 检查数据库表是否存在数据
   - 确认表名与 schema 定义匹配
   - 查看详细错误日志

### 调试模式
```bash
# 启用详细日志
NODE_ENV=development npm run backup:database

# 检查数据库连接
npm run db:studio
```

## 📈 最佳实践

1. **定期备份**: 设置自动化每日备份
2. **多重备份**: 本地备份 + 云存储备份
3. **测试恢复**: 定期测试备份文件的完整性
4. **监控空间**: 监控备份目录磁盘使用
5. **安全存储**: 确保备份文件访问权限安全
6. **版本控制**: 保留多个版本的备份文件
7. **文档更新**: 备份策略变更时更新文档

## 🔮 未来改进

- [ ] 增量备份支持
- [ ] 云存储自动上传 (AWS S3, Google Cloud)
- [ ] 备份加密功能
- [ ] 自定义备份策略配置
- [ ] 备份完整性验证
- [ ] 图形化备份管理界面

---

**Palm AI 数据库备份系统 v1.0** - 为生产环境设计的企业级备份解决方案