# 2025-07-10-10-45 Sentry 错误监控系统集成实施

## 📋 变更概述

**任务类型**: 功能开发
**影响范围**: 全站错误监控、性能追踪、开发调试体验
**完成时间**: 2025-07-10-10-45
**状态**: 🚧 待开发

## 🎯 主要目标

基于项目现状分析，Sentry 配置文件已完整但被临时禁用，需要重新启用并完善 Sentry 错误监控系统，以提供生产级的错误收集、性能监控和用户会话重放功能。解决当前项目缺乏生产环境错误监控的技术债务。

### 核心目标
1. **重新启用 Sentry 配置**：解决之前导致构建失败的问题
2. **建立完整监控体系**：错误收集、性能追踪、会话重放
3. **优化开发体验**：与现有 Spotlight 工具协同工作
4. **成本控制**：合理配置采样率，控制在免费层范围内
5. **数据安全**：确保敏感信息不被泄露

## 📁 涉及文件变更

### 修改文件
- `src/instrumentation.ts` - 取消注释，启用 Sentry 初始化
- `sentry.client.config.ts` - 取消注释，配置客户端监控
- `sentry.server.config.ts` - 取消注释，配置服务端监控
- `sentry.edge.config.ts` - 取消注释，配置 Edge Runtime 监控
- `src/app/global-error.tsx` - 启用 Sentry 错误报告
- `src/libs/Env.ts` - 添加 Sentry 环境变量管理
- `package.json` - 添加 @sentry/nextjs 依赖
- `.env.local` - 添加 Sentry 配置变量
- `next.config.ts` - 可能需要添加 Sentry webpack 插件配置

### 新增文件
- `src/libs/sentry/config.ts` - Sentry 配置管理模块
- `src/libs/sentry/utils.ts` - Sentry 工具函数
- `docs/monitoring/sentry-integration-guide.md` - Sentry 集成文档

## 🔧 技术实现

### 1. 核心变更

#### 依赖安装
```bash
npm install @sentry/nextjs
```

#### 环境变量配置
```typescript
// src/libs/Env.ts 新增
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';
export const SENTRY_ORG = process.env.SENTRY_ORG || '';
export const SENTRY_PROJECT = process.env.SENTRY_PROJECT || '';
export const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN || '';
export const SENTRY_ENVIRONMENT = process.env.NODE_ENV || 'development';
```

#### 客户端配置启用
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';
import * as Spotlight from '@spotlightjs/spotlight';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV,
});

// 保持 Spotlight 在开发环境的使用
if (process.env.NODE_ENV === 'development') {
  Spotlight.init();
}
```

### 2. 关键决策
- **双工具策略**：Spotlight 用于开发环境，Sentry 用于生产环境
- **分层采样**：生产环境降低采样率以控制成本
- **数据脱敏**：启用 `maskAllText` 保护用户隐私
- **渐进式启用**：先启用基础错误监控，后续逐步开启高级功能

### 3. 需要解决的问题
- **构建失败问题**：分析并解决之前导致 Sentry 被禁用的构建问题
- **环境变量配置**：在 Vercel/Railway 等部署平台配置 Sentry 密钥
- **性能影响**：优化配置以最小化对生产环境性能的影响
- **错误过滤**：配置合理的错误过滤规则，减少噪音

## 📊 预期统计数据

| 指标 | 预期数值 | 说明 |
|------|----------|------|
| 新增代码行数 | ~100 | 主要是取消注释和配置 |
| 修改文件数量 | 8-10 | 核心配置文件 |
| 错误捕获率 | 95%+ | 生产环境错误监控覆盖 |
| 性能影响 | <5% | 通过采样率控制 |
| 月度成本 | $0 | 控制在免费层范围内 |

## ✅ 验证计划

### 1. 自动化检查
```bash
npm run lint        # 代码规范检查
npm run type-check  # TypeScript 类型检查
npm run test        # 单元测试
npm run build       # 构建验证
```

### 2. 功能验证
- ✅ **错误捕获**：手动触发错误，验证 Sentry 能正确捕获
- ✅ **性能监控**：验证页面加载性能数据收集
- ✅ **会话重放**：验证用户会话录制功能（如启用）
- ✅ **环境隔离**：确认开发和生产环境配置正确
- ✅ **数据脱敏**：验证敏感信息不会被收集

### 3. 性能测试
- **加载时间影响**：对比启用前后的页面加载时间
- **包大小影响**：检查 Sentry 对构建产物大小的影响
- **运行时性能**：监控 Sentry 对应用运行时性能的影响

## 🚀 实施步骤

### 阶段 1：基础配置（第1天）
- [ ] 安装 @sentry/nextjs 依赖
- [ ] 配置环境变量管理
- [ ] 取消注释基础 Sentry 配置
- [ ] 本地开发环境测试

### 阶段 2：错误监控（第2天）
- [ ] 启用错误捕获功能
- [ ] 配置错误过滤规则
- [ ] 集成全局错误边界
- [ ] 测试错误报告功能

### 阶段 3：性能监控（第3天）
- [ ] 启用性能追踪
- [ ] 配置 Core Web Vitals 监控
- [ ] 优化采样率配置
- [ ] 性能数据验证

### 阶段 4：生产部署（第4天）
- [ ] 配置生产环境变量
- [ ] 部署到 staging 环境测试
- [ ] 生产环境部署
- [ ] 监控数据验证

## 📝 技术债务

### 将解决的债务
- ✅ **Sentry 集成缺失**：重新启用完整的错误监控系统
- ✅ **生产环境盲区**：提供实时错误和性能监控
- ✅ **调试效率低**：改善生产问题排查能力

### 可能新增的债务
- ⚠️ **配置复杂性**：需要维护多环境 Sentry 配置
- ⚠️ **成本监控**：需要定期检查使用量避免超出免费层
- ⚠️ **数据治理**：需要建立错误数据的分类和处理流程

## 🐛 风险评估

### 技术风险
- 🚨 **构建失败**：可能重现之前导致禁用的构建问题
  - **缓解措施**：渐进式启用，充分测试
- 🚨 **性能影响**：Sentry 可能影响应用性能
  - **缓解措施**：合理配置采样率，持续监控
- 🚨 **数据泄露**：错误信息可能包含敏感数据
  - **缓解措施**：启用数据脱敏，配置过滤规则

### 业务风险
- 🚨 **成本超支**：使用量超出免费层限制
  - **缓解措施**：设置使用量告警，优化采样策略
- 🚨 **依赖风险**：增加对第三方服务的依赖
  - **缓解措施**：配置降级策略，确保 Sentry 故障不影响主业务

## 📚 文档计划

### 需要创建的文档
- [ ] `docs/monitoring/sentry-setup-guide.md` - Sentry 设置指南
- [ ] `docs/monitoring/error-handling-best-practices.md` - 错误处理最佳实践
- [ ] `docs/monitoring/performance-monitoring.md` - 性能监控指南
- [ ] `docs/troubleshooting/sentry-issues.md` - Sentry 常见问题解决

### 需要更新的文档
- [ ] `README.md` - 更新监控工具说明
- [ ] `docs/system-architecture.md` - 更新系统架构图
- [ ] `.env.example` - 添加 Sentry 环境变量示例

## 🔄 回滚计划

### 回滚条件
- 构建失败且无法快速修复
- 生产环境性能严重下降（>10%）
- 出现数据泄露或安全问题
- 成本超出预算限制

### 回滚步骤
1. 重新注释所有 Sentry 配置代码
2. 移除 @sentry/nextjs 依赖
3. 清理环境变量配置
4. 重新构建和部署
5. 验证应用正常运行

### 回滚验证
- 应用构建成功
- 所有功能正常运行
- 性能恢复到之前水平
- 无错误日志产生

## 🎉 预期成果

### 量化收益
- **错误发现速度**：从被动发现提升到实时监控
- **问题解决效率**：通过详细错误信息和堆栈跟踪提升 50%+
- **用户体验**：通过主动错误修复减少用户遇到的问题
- **开发效率**：通过性能监控优化关键路径

### 质性收益
- **生产环境可观测性**：全面了解应用运行状态
- **数据驱动决策**：基于真实错误和性能数据优化
- **团队协作**：统一的错误报告和处理流程
- **技术债务清理**：解决长期存在的监控缺失问题

## 📞 联系信息

**变更人员**: AI Assistant
**审核状态**: 待审核
**相关issue**: 待创建
**PR链接**: 待创建

## 🔗 相关资源

- [Sentry Next.js 官方文档](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry 性能监控指南](https://docs.sentry.io/product/performance/)
- [Sentry 数据脱敏配置](https://docs.sentry.io/platforms/javascript/data-management/sensitive-data/)
- [项目现有 Spotlight 配置](./sentry.client.config.ts)
- [错误边界实现](./src/app/global-error.tsx)

---

**模板版本**: v1.0
**创建时间**: 2025-07-10-10-45
**最后更新**: 2025-07-10-10-45
