# Task 001: Referral推荐系统MVP实现

## 🎯 目标

创建一个极简、插拔式的用户推荐系统MVP，遵循奥卡姆剃刀原则（less is more），实现核心功能：A用户获得推荐链接，通过社交媒体分享，B用户通过链接注册/购买，A用户获得奖励。

### 业务价值
- 📈 **用户增长**: 通过社交裂变降低获客成本
- 💰 **转化提升**: 推荐折扣提高购买转化率
- 🔄 **客户粘性**: 奖励机制增强用户留存
- 🎯 **可配置**: Admin面板可视化配置奖励规则

## 📊 当前状态

### 现状分析
- ✅ 数据库已有referrals表基础结构
- ✅ 现有用户认证系统（Supabase主+Firebase备）
- ✅ 现有支付系统（Stripe）和Webhook处理
- ✅ Admin包架构已解耦，支持独立功能模块
- ❌ 缺少推荐链接生成和追踪机制
- ❌ 缺少奖励计算和发放逻辑
- ❌ 缺少Admin可视化配置界面

### 技术背景
- **主技术栈**: Next.js 15, TypeScript, PostgreSQL, Drizzle ORM
- **包管理**: Monorepo workspace架构
- **现有包**: @rolitt/admin, @rolitt/shopify, @rolitt/email
- **设计系统**: shadcn/ui + Tailwind CSS

## 🔧 实施步骤

- [ ] **步骤1**: 创建@rolitt/referral包基础结构，实现核心ReferralMVP类（3个函数）
- [ ] **步骤2**: 扩展数据库Schema，增加推荐追踪必要字段
- [ ] **步骤3**: 实现推荐链接追踪逻辑，集成到现有页面路由
- [ ] **步骤4**: 集成推荐奖励到现有checkout流程和Stripe Webhook
- [ ] **步骤5**: 创建Admin配置面板，支持可视化配置奖励规则
- [ ] **步骤6**: 创建用户推荐面板，显示推荐链接和统计
- [ ] **步骤7**: 添加社交分享按钮组件
- [ ] **步骤8**: 测试完整推荐流程并更新文档

## 📁 涉及文件

### 需要创建的文件
- `新建: packages/referral/package.json` - Referral包配置
- `新建: packages/referral/src/index.ts` - 核心MVP导出
- `新建: packages/referral/src/mvp.ts` - ReferralMVP核心逻辑（3个函数）
- `新建: packages/referral/src/admin/ReferralConfig.tsx` - Admin配置面板
- `新建: packages/referral/src/admin/ReferralStats.tsx` - Admin统计面板
- `新建: packages/referral/src/components/ReferralDashboard.tsx` - 用户推荐面板
- `新建: packages/referral/src/components/ShareButtons.tsx` - 社交分享组件
- `新建: packages/referral/README.md` - 包文档

### 需要修改的文件
- `src/models/Schema.ts` - 扩展referrals表字段
- `src/app/actions/checkoutActions.ts` - 集成推荐折扣逻辑
- `src/app/api/webhooks/stripe/route.ts` - 处理推荐奖励
- `src/app/[locale]/(marketing)/page.tsx` - 添加推荐追踪
- `packages/admin/src/features/index.ts` - 导出推荐管理功能
- `src/app/[locale]/admin/referral/page.tsx` - Admin推荐管理页面
- `src/app/[locale]/(auth)/dashboard/page.tsx` - 用户dashboard集成

### 配置文件
- `package.json` - 添加referral包workspace
- `src/locales/en/referral.json` - 英文翻译
- `src/locales/zh-HK/referral.json` - 中文翻译

## ✅ 验收标准

### 功能验收
- [ ] A用户可以生成唯一推荐链接（格式：domain.com?ref=encoded_user_id）
- [ ] B用户点击推荐链接时自动追踪并设置30天cookie
- [ ] B用户购买时自动应用推荐折扣（20%默认）
- [ ] A用户获得推荐奖励（10%返现默认）
- [ ] Admin可以在配置面板启用/禁用推荐系统
- [ ] Admin可以配置奖励百分比和类型
- [ ] 用户dashboard显示推荐统计和社交分享按钮

### 性能验收
- [ ] 推荐链接生成 < 100ms
- [ ] 推荐追踪不影响页面加载性能
- [ ] 整个包编译后 < 50KB

### 安全验收
- [ ] 推荐码使用base64编码，防止用户ID直接暴露
- [ ] 推荐奖励计算在服务端进行，防止篡改
- [ ] Admin配置需要管理员权限验证

### 用户体验验收
- [ ] 推荐面板UI简洁美观，移动端适配
- [ ] 社交分享按钮一键复制/分享
- [ ] 推荐统计实时更新
- [ ] 多语言支持（中英文）

## 🔗 相关资源

### 项目文档
- [CLAUDE.md](../../CLAUDE.md) - 开发规范
- [README.md](../../README.md) - 项目架构
- [packages/admin/README.md](../../packages/admin/README.md) - Admin包架构

### 技术参考
- [Stripe Webhooks](https://stripe.com/docs/webhooks) - 支付事件处理
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) - 推荐追踪
- [shadcn/ui Components](https://ui.shadcn.com/) - UI组件库

## ⚠️ 技术考虑

### 架构决策
- **插拔式设计**: 完全可选，不影响现有系统运行
- **零侵入集成**: 仅在有推荐参数时执行追踪逻辑
- **MVP优先**: 仅实现核心3个函数，后续可扩展
- **Admin配置**: 支持运行时配置，无需重新部署

### 风险评估
- **低风险**: MVP功能简单，依赖最小，不影响核心业务流程
- **中风险**: 数据库Schema扩展需要migration，需要测试向后兼容性
- **缓解措施**: 所有新增字段设置默认值，保持现有数据完整性

### 性能考虑
- 推荐追踪仅在有ref参数时执行，对正常用户无影响
- 使用Redis缓存推荐统计，减少数据库查询
- 社交分享使用原生Web Share API，无需第三方库

### 兼容性
- 支持现有的双认证系统（Supabase主+Firebase备）
- 兼容现有的多语言系统（next-intl）
- 移动端响应式设计，支持PWA分享

## 🧪 测试策略

### 单元测试
- [ ] ReferralMVP.link() 函数测试
- [ ] ReferralMVP.setCookie() 函数测试
- [ ] ReferralMVP.getReward() 函数测试
- [ ] 奖励计算逻辑测试

### 集成测试
- [ ] 完整推荐流程测试（生成->分享->点击->购买->奖励）
- [ ] Stripe Webhook推荐奖励处理测试
- [ ] Admin配置保存和读取测试

### 端到端测试
- [ ] 用户生成推荐链接并分享流程
- [ ] 新用户通过推荐链接注册购买流程
- [ ] Admin配置推荐规则流程

## 📊 监控和日志

### 监控指标
- 推荐链接点击率
- 推荐转化率
- 奖励发放数量和金额
- 系统启用状态

### 日志记录
- 推荐链接生成日志
- 推荐点击追踪日志
- 奖励计算和发放日志
- Admin配置变更日志

## 🚀 部署考虑

### 部署策略
- 包构建：npm run build
- 渐进式启用：先部署代码，再通过Admin面板启用
- 回滚方案：Admin面板一键禁用功能

### 环境配置
- 无需新增环境变量
- 复用现有数据库和认证系统
- 通过Admin面板配置所有参数

### 数据迁移
- 扩展现有referrals表结构
- 添加默认配置到referral_config表
- 保持现有数据完整性

---

## 📝 执行记录

### 开始时间
- **开始日期**: 2025-01-19
- **执行者**: Claude Code
- **预计完成时间**: 2025-01-19

### 进度更新
- **[等待开始]**: 任务文件已创建，等待执行确认

---

💡 **Claude Code 使用提示**:
```
# 执行此任务的 Claude Code 指令
@tasks/referral/001-referral-mvp-system.md

# 或者
"Based on /tasks/referral/001-referral-mvp-system.md, complete the task in one shot."
```
