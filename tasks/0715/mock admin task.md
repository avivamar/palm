🔍 Dashboard 当前状态分析

  已实现的真实数据接入：

  ✅ 用户统计 - 已接入 PostgreSQL 真实数据
  (src/app/api/admin/dashboard/stats/route.ts)
  ✅ 基础 API 架构 - 已实现 /api/admin/dashboard/stats 端点
  ✅ 认证系统 - 已集成 Supabase Auth 验证
  ✅ 错误处理 - 已实现降级到错误状态

  仍使用模拟数据的部分：

  ❌ 订单统计 - 基于用户数计算的模拟数据 (line 57-58)
  ❌ 收入数据 - 基于模拟订单计算的模拟收入 (line 59-60)
  ❌ 转化率 - 基于模拟数据计算的模拟转化率 (line 61-62)
  ❌ Admin Store - 仍在使用 mock 数据加载
  (packages/admin/src/stores/admin-store.ts:78-83)

  📊 完整的真实数据接入计划

⏺ Update Todos
  ⎿  ☒ Analyze current dashboard structure and identify mock data usage
     ☒ Review dashboard components and their data sources
     ☒ Examine admin package structure and real API integrations
     ☒ Review database schema and available data models
     ☒ Document current real vs mock data mapping
     ☐ Identify missing API endpoints needed for dashboard

⏺ 需要新增的 API 端点：

  1. 订单统计 API - /api/admin/dashboard/orders
    - 总订单数、月度变化
    - 基于 preordersSchema 表的真实数据
  2. 收入统计 API - /api/admin/dashboard/revenue
    - 总收入、月度变化
    - 基于 preordersSchema.amount 字段计算
  3. 转化漏斗 API - /api/admin/dashboard/conversions
    - 真实转化率计算
    - 基于用户数和完成订单数的比例
  4. 实时监控 API - /api/admin/dashboard/realtime
    - 实时活动数据
    - Webhook 日志统计
  5. Shopify 集成数据 - /api/admin/dashboard/shopify
    - 同步状态、库存信息
    - 基于最新的 Shopify 集成

  需要更新的组件：

  1. Admin Store - 移除 mock 数据，接入真实 API
  2. Dashboard Stats - 完全替换模拟数据计算逻辑
  3. 新增模块 - Analytics、Performance、Shopify 管理面板

  数据库查询优化：

  基于 Schema.ts 中的完整数据模型：
  - usersSchema - 用户统计和注册趋势
  - preordersSchema - 订单、收入、转化率
  - webhookLogsSchema - 系统健康监控
  - productInventorySchema - 库存管理
  - marketingCampaignsSchema - 营销效果分析

  🎯 建议的实施顺序：

  1. Phase 1: 更新现有 Dashboard Stats API，移除所有模拟数据
  2. Phase 2: 创建新的统计 API 端点
  3. Phase 3: 更新 Admin Store 和前端组件
  4. Phase 4: 集成 Shopify 数据和实时监控
  5. Phase 5: 添加高级分析和报表功能

  基于你们的最新架构升级，所有基础设施都已就绪，只需要将模拟数据替换为真实
  的数据库查询即可完成完整的真实数据接入。

⏺ Update Todos
  ⎿  ☒ Analyze current dashboard structure and identify mock data usage
     ☒ Review dashboard components and their data sources
     ☒ Examine admin package structure and real API integrations
     ☒ Review database schema and available data models
     ☒ Document current real vs mock data mapping
     ☒ Identify missing API endpoints needed for dashboard

⏺ 现在准备好开始实施真实数据接入了！你希望从哪个部分开始？我建议从 Phase 1
  开始，完全移除现有 Dashboard Stats API
  中的模拟数据，实现基于真实数据库的统计查询。
