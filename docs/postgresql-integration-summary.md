# 文档：PostgreSQL 数据库集成概要

**日期**: 2025年6月25日
**作者**: Claude (AI Assistant) & Aviva

## 1. 背景与动机

在项目开发过程中，我们遇到了与生产环境 Firestore 数据库连接不稳定、难以调试的问题。具体表现为：

- Stripe Webhook 在调用我们的后端 API 时，尽管代码逻辑正确，但频繁出现 `500 Internal Server Error`，根本原因指向 Firestore 初始化失败。
- 由于无法直接访问生产数据库，依赖临时创建的 API 端点进行日志查询，调试效率低下且过程曲折。

为了解决这些"黑盒"问题，并为项目的长期发展奠定一个更健壮、更可控的基础，我们决定将核心业务数据（预购订单、Webhook 日志）的存储从 Firestore 迁移到一个由我们完全控制的 PostgreSQL 数据库中。

## 2. 为什么选择 PostgreSQL + Drizzle？

我们选择这个技术栈是基于以下战略考量：

- **数据所有权与可移植性**：PostgreSQL 是一个开源的关系型数据库，我们可以完全控制自己的数据，避免被单一云服务商锁定。
- **强大的查询与分析能力**：利用标准 SQL，我们可以轻松进行复杂的业务数据分析和报表生成，这是 Firestore 的弱项。
- **开发与测试的便利性**：Drizzle ORM 提供了强大的类型安全和数据库迁移工具，我们可以在本地搭建与生产环境完全一致的数据库，极大地提升了开发和测试效率。
- **与现有技术的无缝集成**：项目中已经集成了 Drizzle 和 `pg` 驱动，技术路线上没有障碍。
- **保留 Firebase Auth 的优势**：我们保留了 Firebase Auth 作为身份验证系统，仅将业务数据存储迁移，实现了两全其美。

## 3. 核心架构设计

我们设计并实现了一个与 Firebase Auth 集成的、基于 PostgreSQL 的双数据源架构。

### 3.1. 数据库 Schema (`src/models/Schema.ts`)

我们使用 Drizzle ORM 定义了以下核心表结构：

- **`users`**: 作为 Firebase 用户的"镜像"表，存储用户的基本信息（UID, Email, Display Name 等）。
- **`preorders`**: 存储所有预购订单的详细信息，并通过 `user_id` 字段与 `users` 表关联。
- **`webhook_logs`**: 记录所有来自 Stripe 的 Webhook 事件的处理状态，用于调试和审计。
- **未来扩展**：我们还预先设计了 `product_inventory`, `discount_codes`, 和 `marketing_campaigns` 等表，为未来的功能扩展做好了准备。

### 3.2. 用户数据同步逻辑 (`src/contexts/AuthContext.tsx`)

这是连接两个系统的桥梁。我们修改了 `AuthContext`，实现了在用户登录或注册时：

1.  触发 `onAuthStateChanged` 事件。
2.  在 PostgreSQL 的 `users` 表中执行"更新或插入"（Upsert）操作。
3.  如果用户是新用户，则插入一条新记录；如果用户已存在，则更新其 `lastLoginAt` 等信息。

这确保了我们的 PostgreSQL 数据库始终拥有最新的用户信息。

### 3.3. 预购流程 (`preorderActions.ts`)

预购流程被改造为：

- **接收可选的 `userId`**：当已登录用户进行预购时，他们的 `userId` (Firebase UID) 会被记录在 `preorders` 表中，从而将订单与用户强关联。
- **未登录用户友好**：未登录用户仍然可以完成预购，此时 `userId` 字段为 `null`。

## 4. 实施与迁移步骤

我们通过以下步骤完成了整个架构的升级：

1.  **Schema 定义**: 在 `src/models/Schema.ts` 中使用 Drizzle 语法完整定义了新的数据库结构。
2.  **生成迁移脚本**: 使用 `npm run db:generate` 创建了 SQL 迁移文件。
3.  **合并与优化迁移**: 将多个迁移文件合并为一个逻辑清晰、带有中文注释的最终脚本 `migrations/0003_combined_migration.sql`，方便在生产环境一次性执行。
4.  **改造核心服务**:
    - 修改了 `AuthContext.tsx` 以实现用户数据同步。
    - 修改了 `preorderActions.ts` 以关联用户与订单。
    - 修改了 Stripe Webhook 处理器和日志记录器，使其与新的 PostgreSQL 数据源兼容。
5.  **前端适配**: 微调了前端组件（如 `ProductSelection.tsx`），以传递 `userId` 并为登录用户自动填充 Email。

## 5. 后续部署要求

为了让新的 PostgreSQL 数据支线在生产环境中生效，需要完成以下关键配置：

1.  **执行数据库迁移**: 在 Neon 数据库上执行 `migrations/0003_combined_migration.sql` 的内容。
2.  **设置 Vercel 环境变量**:
    - **`DATABASE_URL`**: 设置为 Neon 数据库的连接字符串。
    - **`DATABASE_STORAGE_TARGET`**: 将此变量的值设置为 `postgres`。
3.  **重新部署**: 在 Vercel 上触发一次新的部署，以应用所有代码和环境变量的更改。

---

这份文档记录了我们从发现问题到完成一次重要架构升级的全过程。新的 PostgreSQL 数据存储方案将为 Rolitt 项目的稳定性、可扩展性和长期发展提供坚实的保障。
