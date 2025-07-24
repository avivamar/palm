# 数据库操作函数指引

**日期**: 2025年1月27日
**作者**: AI Assistant
**版本**: 1.0

## 📋 目录

1. [概述](#概述)
2. [数据库连接配置](#数据库连接配置)
3. [Schema 结构说明](#schema-结构说明)
4. [基本 CRUD 操作](#基本-crud-操作)
5. [高级查询操作](#高级查询操作)
6. [事务处理](#事务处理)
7. [迁移管理](#迁移管理)
8. [最佳实践](#最佳实践)
9. [常见问题与解决方案](#常见问题与解决方案)

## 概述

本项目采用 **双数据源架构**，支持 PostgreSQL 和 Firestore 两种数据存储方案：

- **开发环境**: 使用 PostgreSQL (通过 `DATABASE_URL` 连接)
- **构建阶段**: 使用 PGlite (内存数据库)
- **备用方案**: Firestore (当 `DATABASE_STORAGE_TARGET` 不为 `postgres` 时)

### 核心技术栈

- **ORM**: Drizzle ORM
- **数据库**: PostgreSQL / PGlite
- **类型安全**: TypeScript + Drizzle 类型推导
- **迁移工具**: Drizzle Kit

## 数据库连接配置

### 环境变量设置

```bash
# .env.local
DATABASE_URL="postgresql://username:password@host:port/database"
DATABASE_STORAGE_TARGET="postgres"
```

### 连接实例

数据库连接在 `src/libs/DB.ts` 中配置：

```typescript
import { db } from '@/libs/DB';

// db 实例已经配置好，可以直接使用
```

## Schema 结构说明

### 核心表结构

项目定义了以下主要数据表（位于 `src/models/Schema.ts`）：

#### 1. 用户表 (`users`)
```typescript
export const usersSchema = pgTable('users', {
  id: text('id').primaryKey(), // Firebase UID
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  role: userRoleEnum('role').default('customer').notNull(),
  // ... 其他字段
});
```

#### 2. 预购订单表 (`preorders`)
```typescript
export const preordersSchema = pgTable('preorders', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  color: productColorEnum('color').notNull(),
  priceId: text('price_id').notNull(),
  userId: text('user_id'), // 关联到 users.id
  status: preorderStatusEnum('status').default('initiated').notNull(),
  // ... 其他字段
});
```

#### 3. Webhook 日志表 (`webhook_logs`)
```typescript
export const webhookLogsSchema = pgTable('webhook_logs', {
  id: serial('id').primaryKey(),
  provider: text('provider').notNull(),
  eventType: text('event_type').notNull(),
  status: webhookStatusEnum('status').notNull(),
  // ... 其他字段
});
```

### 枚举类型

项目定义了多个枚举类型以确保数据完整性：

```typescript
export const userRoleEnum = pgEnum('user_role', ['customer', 'admin', 'moderator']);
export const preorderStatusEnum = pgEnum('preorder_status', ['initiated', 'processing', 'completed', 'failed', 'refunded', 'cancelled']);
export const webhookStatusEnum = pgEnum('webhook_status', ['success', 'failed', 'pending', 'retry']);
export const productColorEnum = pgEnum('product_color', ['silver', 'black', 'white', 'gold']);
```

## 基本 CRUD 操作

### 1. 创建 (Create)

#### 插入单条记录
```typescript
import { db } from '@/libs/DB';
import { preordersSchema } from '@/models/Schema';

// 示例：创建预购订单
const createPreorder = async (orderData: {
  email: string;
  color: 'silver' | 'black' | 'white' | 'gold';
  priceId: string;
  userId?: string;
}) => {
  try {
    const result = await db.insert(preordersSchema).values({
      id: nanoid(), // 生成唯一ID
      email: orderData.email,
      color: orderData.color,
      priceId: orderData.priceId,
      userId: orderData.userId || null,
      status: 'initiated',
      amount: '0.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return result[0];
  } catch (error) {
    console.error('创建预购订单失败:', error);
    throw error;
  }
};
```

#### 插入多条记录
```typescript
const createMultipleUsers = async (users: Array<{
  id: string;
  email: string;
  displayName?: string;
}>) => {
  try {
    const result = await db.insert(usersSchema).values(users).returning();
    return result;
  } catch (error) {
    console.error('批量创建用户失败:', error);
    throw error;
  }
};
```

### 2. 读取 (Read)

#### 查询所有记录
```typescript
import { desc } from 'drizzle-orm';

// 获取所有预购订单（按创建时间倒序）
const getAllPreorders = async () => {
  try {
    const preorders = await db.query.preordersSchema.findMany({
      orderBy: [desc(preordersSchema.createdAt)],
    });
    return preorders;
  } catch (error) {
    console.error('获取预购订单失败:', error);
    throw error;
  }
};
```

#### 条件查询
```typescript
import { and, eq, or } from 'drizzle-orm';

// 根据用户ID查询预购订单
const getPreordersByUserId = async (userId: string) => {
  try {
    const preorders = await db.query.preordersSchema.findMany({
      where: eq(preordersSchema.userId, userId),
      orderBy: [desc(preordersSchema.createdAt)],
    });
    return preorders;
  } catch (error) {
    console.error('根据用户ID查询预购订单失败:', error);
    throw error;
  }
};

// 复杂条件查询
const getFilteredPreorders = async (filters: {
  status?: string;
  color?: string;
  email?: string;
}) => {
  try {
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(preordersSchema.status, filters.status));
    }
    if (filters.color) {
      conditions.push(eq(preordersSchema.color, filters.color));
    }
    if (filters.email) {
      conditions.push(eq(preordersSchema.email, filters.email));
    }

    const preorders = await db.query.preordersSchema.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(preordersSchema.createdAt)],
    });

    return preorders;
  } catch (error) {
    console.error('条件查询预购订单失败:', error);
    throw error;
  }
};
```

#### 关联查询
```typescript
// 查询用户及其预购订单
const getUserWithPreorders = async (userId: string) => {
  try {
    const userWithPreorders = await db.query.usersSchema.findFirst({
      where: eq(usersSchema.id, userId),
      with: {
        preorders: {
          orderBy: [desc(preordersSchema.createdAt)],
        },
      },
    });
    return userWithPreorders;
  } catch (error) {
    console.error('查询用户及预购订单失败:', error);
    throw error;
  }
};
```

### 3. 更新 (Update)

#### 更新单条记录
```typescript
// 更新预购订单状态
const updatePreorderStatus = async (preorderId: string, status: string) => {
  try {
    const result = await db
      .update(preordersSchema)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(preordersSchema.id, preorderId))
      .returning();

    return result[0];
  } catch (error) {
    console.error('更新预购订单状态失败:', error);
    throw error;
  }
};
```

#### 条件更新
```typescript
// 批量更新特定状态的订单
const updatePreordersByStatus = async (oldStatus: string, newStatus: string) => {
  try {
    const result = await db
      .update(preordersSchema)
      .set({
        status: newStatus as any,
        updatedAt: new Date(),
      })
      .where(eq(preordersSchema.status, oldStatus))
      .returning();

    return result;
  } catch (error) {
    console.error('批量更新预购订单状态失败:', error);
    throw error;
  }
};
```

### 4. 删除 (Delete)

#### 删除单条记录
```typescript
// 删除预购订单
const deletePreorder = async (preorderId: string) => {
  try {
    const result = await db
      .delete(preordersSchema)
      .where(eq(preordersSchema.id, preorderId))
      .returning();

    return result[0];
  } catch (error) {
    console.error('删除预购订单失败:', error);
    throw error;
  }
};
```

#### 条件删除
```typescript
// 删除过期的 webhook 日志
const deleteOldWebhookLogs = async (daysOld: number = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db
      .delete(webhookLogsSchema)
      .where(lt(webhookLogsSchema.receivedAt, cutoffDate))
      .returning();

    return result;
  } catch (error) {
    console.error('删除过期 webhook 日志失败:', error);
    throw error;
  }
};
```

## 高级查询操作

### 聚合查询
```typescript
import { avg, count, sum } from 'drizzle-orm';

// 统计预购订单数量
const getPreorderStats = async () => {
  try {
    const stats = await db
      .select({
        total: count(),
        totalAmount: sum(preordersSchema.amount),
        avgAmount: avg(preordersSchema.amount),
      })
      .from(preordersSchema);

    return stats[0];
  } catch (error) {
    console.error('获取预购统计失败:', error);
    throw error;
  }
};
```

### 分页查询
```typescript
// 分页获取预购订单
const getPreordersWithPagination = async (page: number = 1, pageSize: number = 10) => {
  try {
    const offset = (page - 1) * pageSize;

    const preorders = await db.query.preordersSchema.findMany({
      orderBy: [desc(preordersSchema.createdAt)],
      limit: pageSize,
      offset,
    });

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(preordersSchema);
    const total = totalResult[0]?.count || 0;

    return {
      data: preorders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error('分页查询预购订单失败:', error);
    throw error;
  }
};
```

## 事务处理

### 基本事务
```typescript
// 创建用户并初始化预购订单
const createUserWithPreorder = async (userData: {
  id: string;
  email: string;
  displayName?: string;
}, preorderData: {
  color: string;
  priceId: string;
}) => {
  try {
    const result = await db.transaction(async (tx) => {
      // 创建用户
      const user = await tx.insert(usersSchema).values({
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      // 创建预购订单
      const preorder = await tx.insert(preordersSchema).values({
        id: nanoid(),
        email: userData.email,
        color: preorderData.color as any,
        priceId: preorderData.priceId,
        userId: userData.id,
        status: 'initiated',
        amount: '0.00',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return { user: user[0], preorder: preorder[0] };
    });

    return result;
  } catch (error) {
    console.error('创建用户和预购订单事务失败:', error);
    throw error;
  }
};
```

## 迁移管理

### 生成迁移文件
```bash
# 根据 Schema 变更生成迁移文件
npm run db:generate
```

### 执行迁移
```bash
# 在生产环境手动执行迁移
psql $DATABASE_URL -f migrations/0000_initial_schema.sql
```

### 迁移最佳实践

1. **Schema 变更流程**:
   - 修改 `src/models/Schema.ts`
   - 运行 `npm run db:generate` 生成迁移
   - 检查生成的 SQL 文件
   - 在测试环境验证迁移
   - 部署到生产环境

2. **迁移文件管理**:
   - 迁移文件位于 `migrations/` 目录
   - 文件命名格式：`XXXX_description.sql`
   - 包含 `_journal.json` 元数据文件

## 最佳实践

### 1. 错误处理
```typescript
// 统一的错误处理模式
const safeDbOperation = async <T>(operation: () => Promise<T>): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    console.error('数据库操作失败:', error);
    // 根据需要决定是否重新抛出错误
    return null;
  }
};

// 使用示例
const user = await safeDbOperation(() =>
  db.query.usersSchema.findFirst({
    where: eq(usersSchema.id, userId)
  })
);
```

### 2. 类型安全
```typescript
// 使用 Drizzle 的类型推导
type User = typeof usersSchema.$inferSelect;
type NewUser = typeof usersSchema.$inferInsert;
type Preorder = typeof preordersSchema.$inferSelect;
type NewPreorder = typeof preordersSchema.$inferInsert;

// 类型安全的函数定义
const createUser = async (userData: NewUser): Promise<User> => {
  const result = await db.insert(usersSchema).values(userData).returning();
  return result[0];
};
```

### 3. 连接池管理
```typescript
// 在 API 路由中正确使用数据库连接
export async function GET() {
  try {
    // 直接使用 db 实例，连接池会自动管理
    const data = await db.query.preordersSchema.findMany();
    return Response.json(data);
  } catch (error) {
    console.error('API 错误:', error);
    return Response.json({ error: '内部服务器错误' }, { status: 500 });
  }
  // 不需要手动关闭连接
}
```

### 4. 性能优化
```typescript
// 使用索引优化查询
// 在生产环境中添加适当的索引
/*
CREATE INDEX idx_preorders_user_id ON preorders(user_id);
CREATE INDEX idx_preorders_status ON preorders(status);
CREATE INDEX idx_preorders_created_at ON preorders(created_at);
CREATE INDEX idx_webhook_logs_provider_event ON webhook_logs(provider, event_type);
*/

// 限制查询结果数量
const getRecentPreorders = async (limit: number = 100) => {
  return await db.query.preordersSchema.findMany({
    orderBy: [desc(preordersSchema.createdAt)],
    limit: Math.min(limit, 1000), // 防止过大的查询
  });
};
```

## 常见问题与解决方案

### 1. 连接问题

**问题**: `cannot insert multiple commands into a prepared statement`

**解决方案**:
- 确保迁移文件中的 SQL 语句格式正确
- 避免在单个文件中使用复杂的 `DO` 块
- 使用简单的 `CREATE TABLE` 和 `CREATE TYPE` 语句

### 2. 类型错误

**问题**: TypeScript 类型不匹配

**解决方案**:
```typescript
// 使用类型断言（谨慎使用）
// 或者使用枚举值
import { preorderStatusEnum } from '@/models/Schema';

const status = 'completed' as const;
const validStatuses = preorderStatusEnum.enumValues;
```

### 3. 迁移失败

**问题**: 迁移执行失败

**解决方案**:
- 检查数据库连接字符串
- 确保数据库用户有足够权限
- 手动执行迁移 SQL 文件
- 检查 `_journal.json` 文件是否正确

### 4. 双数据源切换

**问题**: PostgreSQL 和 Firestore 之间的数据同步

**解决方案**:
```typescript
// 使用环境变量控制数据源
const saveData = async (data: any) => {
  if (Env.DATABASE_STORAGE_TARGET === 'postgres') {
    // 使用 PostgreSQL
    return await db.insert(preordersSchema).values(data);
  } else {
    // 使用 Firestore
    return await FirestoreDB.collection('preorders').add(data);
  }
};
```

### 5. 性能问题

**问题**: 查询速度慢

**解决方案**:
- 添加适当的数据库索引
- 使用分页查询
- 避免 N+1 查询问题
- 使用 `select` 指定需要的字段

```typescript
// 优化查询：只选择需要的字段
const getPreorderSummary = async () => {
  return await db
    .select({
      id: preordersSchema.id,
      email: preordersSchema.email,
      status: preordersSchema.status,
      createdAt: preordersSchema.createdAt,
    })
    .from(preordersSchema)
    .orderBy(desc(preordersSchema.createdAt))
    .limit(100);
};
```

---

## 📚 相关文档

- [PostgreSQL 集成概要](./postgresql-integration-summary.md)
- [系统架构文档](./system-architecture.md)
- [Drizzle ORM 官方文档](https://orm.drizzle.team/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)

---

**注意**: 本指引基于项目当前的数据库架构和代码结构。随着项目的发展，请及时更新本文档以保持同步。
