# 🚨 紧急数据库修复指南

## 问题现状

**错误**: `relation "users" does not exist`
**影响**: 生产环境无法正常运行，所有用户相关功能失效

## 🚀 立即修复步骤

### 1. **数据库初始化**（推荐方案）

在 **Supabase Dashboard** 中执行：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 运行以下脚本：

```bash
# 从本地复制完整的初始化脚本
cat /Users/aviva/github/avivamar/rolittmain/scripts/init-production-database.sql
```

### 2. **验证数据库状态**

执行以下查询确认表已创建：

```sql
-- 检查所有表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 预期结果应包含：
-- counter
-- discount_codes
-- marketing_campaigns
-- preorders
-- product_inventory
-- referral_config
-- referrals
-- share_activities
-- user_images
-- users
-- webhook_logs
```

### 3. **运行现有迁移**（备选方案）

如果完整初始化不可行，依次运行现有迁移：

```bash
# 本地运行迁移（需要正确的DATABASE_URL）
npm run db:migrate
```

### 4. **环境变量检查**

确认以下环境变量已正确配置：

```env
# 数据库连接
DATABASE_URL="postgresql://user:password@host:port/database"

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# 管理员配置
ADMIN_EMAIL="your-admin@email.com"
```

## 🔍 故障排查

### 问题1: 数据库连接失败
```
解决方案: 检查DATABASE_URL是否正确，确保数据库服务可访问
```

### 问题2: 权限错误
```
解决方案: 确保数据库用户有创建表和索引的权限
```

### 问题3: 环境变量无效
```
错误: Invalid environment variables
解决方案: 检查Env.ts文件中的验证规则，确保所有必需变量已设置
```

## 📋 创建的数据库结构

### 核心表：
- ✅ **users** - 用户表（解决主要错误）
- ✅ **preorders** - 预订表
- ✅ **webhook_logs** - Webhook日志
- ✅ **user_images** - 用户图片表

### 支持表：
- ✅ **counter** - 计数器
- ✅ **product_inventory** - 产品库存
- ✅ **discount_codes** - 折扣码
- ✅ **marketing_campaigns** - 营销活动
- ✅ **referrals** - 推荐系统
- ✅ **referral_config** - 推荐配置
- ✅ **share_activities** - 分享活动

### 数据类型：
- ✅ 所有必需的枚举类型
- ✅ 外键关系
- ✅ 索引优化
- ✅ 触发器和约束

## ⚡ 快速验证

修复后，访问以下页面验证：

1. **Admin Dashboard**: `/zh-HK/admin/users`
   - 应该能正常显示用户列表
   - 统计数据不再为0

2. **预订页面**: `/zh-HK/pre-order`
   - 用户创建功能正常

3. **API健康检查**: `/api/admin/users/stats`
   - 返回正确的JSON响应

## 🔄 持续监控

修复后设置监控：

1. **数据库健康检查**
   ```sql
   SELECT COUNT(*) as user_count FROM users;
   SELECT COUNT(*) as preorder_count FROM preorders;
   ```

2. **API响应监控**
   - 监控 `/api/admin/users/stats` 响应时间
   - 确保不再出现 "relation does not exist" 错误

3. **日志监控**
   - 检查 Vercel/Railway 日志
   - 确认数据库连接稳定

## 🚀 部署后验证清单

- [ ] 所有数据库表已创建
- [ ] Admin用户页面正常加载
- [ ] 用户注册/登录功能正常
- [ ] 预订流程无错误
- [ ] API统计数据显示正确值
- [ ] 日志中无数据库错误

---

**紧急联系**: 如果问题持续，请立即检查数据库连接字符串和Supabase项目配置。
