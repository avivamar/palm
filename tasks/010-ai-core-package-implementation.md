# Task 010: @rolitt/ai-core - AI 核心能力包完整实现

## 🎯 目标

实现 Rolitt 第9个独立功能包 `@rolitt/ai-core`，提供统一的 AI 能力底座，支持多模型集成（OpenAI、Claude、Gemini、Azure）、智能化功能扩展、Redis 缓存优化、流式响应和企业级速率限制，为整个系统提供"即插即用"的 AI 能力。

**业务价值**:
- 🤖 统一 AI 能力调用接口，减少 80% 集成复杂度
- 🚀 高性能缓存和优化，提升 300% 响应速度
- 🔄 多模型切换和容错机制，保证 99.9% 服务可用性
- 📝 结构化提示词管理，支持业务快速创新

## 📊 当前状态

### 现状分析
- ✅ 需求文档已完善 (`packages/ai-core/readme.md`)
- ❌ 缺少实际包实现代码
- ❌ 缺少与主应用的集成
- ❌ 缺少测试覆盖和验证机制

### 技术背景
- **技术栈**: TypeScript 5.0 + Zod 验证 + Upstash Redis
- **依赖系统**: 现有 Rolitt 认证系统、数据库、环境配置
- **集成模式**: Monorepo workspace 包架构 + Server Actions 模式

## 🔧 实施步骤

- [ ] **步骤1**: 创建包基础结构和配置文件 (packages/ai-core/package.json, tsconfig.json)
- [ ] **步骤2**: 实现核心 AI 管理器和类型定义 (core/manager.ts, core/types.ts, core/interfaces.ts)
- [ ] **步骤3**: 实现 AI 服务提供商集成 (providers/openai/, providers/claude/, providers/gemini/)
- [ ] **步骤4**: 实现缓存、速率限制和日志系统 (utils/cache.ts, utils/rate-limiter.ts, utils/logger.ts)
- [ ] **步骤5**: 实现提示词管理系统 (prompts/loader.ts + 示例模板文件)
- [ ] **步骤6**: 创建主应用集成的 Server Actions (src/app/actions/aiActions.ts)
- [ ] **步骤7**: 添加环境变量配置和根目录脚本集成
- [ ] **步骤8**: 编写测试用例和验证完整功能

## 📁 涉及文件

### 需要创建的文件

#### 包配置文件
- `新建: packages/ai-core/package.json` - 包配置，依赖管理，脚本定义
- `新建: packages/ai-core/tsconfig.json` - TypeScript 配置
- `新建: packages/ai-core/vitest.config.ts` - 测试配置
- `新建: packages/ai-core/.eslintrc.js` - ESLint 配置

#### 核心架构文件
- `新建: packages/ai-core/src/index.ts` - 包的主入口文件
- `新建: packages/ai-core/src/core/types.ts` - 核心类型定义
- `新建: packages/ai-core/src/core/interfaces.ts` - 接口定义
- `新建: packages/ai-core/src/core/manager.ts` - AI 管理器主实现
- `新建: packages/ai-core/src/core/errors.ts` - 错误处理类

#### AI 服务提供商
- `新建: packages/ai-core/src/providers/openai/client.ts` - OpenAI 客户端
- `新建: packages/ai-core/src/providers/openai/service.ts` - OpenAI 服务实现
- `新建: packages/ai-core/src/providers/openai/types.ts` - OpenAI 类型定义
- `新建: packages/ai-core/src/providers/openai/index.ts` - OpenAI 导出文件
- `新建: packages/ai-core/src/providers/claude/client.ts` - Claude 客户端
- `新建: packages/ai-core/src/providers/claude/service.ts` - Claude 服务实现
- `新建: packages/ai-core/src/providers/claude/types.ts` - Claude 类型定义
- `新建: packages/ai-core/src/providers/claude/index.ts` - Claude 导出文件
- `新建: packages/ai-core/src/providers/gemini/client.ts` - Gemini 客户端
- `新建: packages/ai-core/src/providers/gemini/service.ts` - Gemini 服务实现
- `新建: packages/ai-core/src/providers/gemini/types.ts` - Gemini 类型定义
- `新建: packages/ai-core/src/providers/gemini/index.ts` - Gemini 导出文件

#### 工具和配置
- `新建: packages/ai-core/src/utils/cache.ts` - Redis 缓存管理
- `新建: packages/ai-core/src/utils/rate-limiter.ts` - 速率限制实现
- `新建: packages/ai-core/src/utils/logger.ts` - 日志系统
- `新建: packages/ai-core/src/utils/index.ts` - 工具导出文件
- `新建: packages/ai-core/src/config/default.ts` - 默认配置
- `新建: packages/ai-core/src/config/validators.ts` - 配置验证
- `新建: packages/ai-core/src/config/index.ts` - 配置导出文件

#### 提示词管理系统
- `新建: packages/ai-core/src/prompts/loader.ts` - 提示词加载器
- `新建: packages/ai-core/src/prompts/types.ts` - 提示词类型定义
- `新建: packages/ai-core/src/prompts/system/base.md` - 基础系统提示词
- `新建: packages/ai-core/src/prompts/system/safety.md` - 安全提示词
- `新建: packages/ai-core/src/prompts/system/brand.md` - 品牌提示词
- `新建: packages/ai-core/src/prompts/ecommerce/product-description.md` - 产品描述提示词
- `新建: packages/ai-core/src/prompts/ecommerce/recommendation.md` - 推荐系统提示词
- `新建: packages/ai-core/src/prompts/customer-service/support.md` - 客服支持提示词

#### 功能模块
- `新建: packages/ai-core/src/features/chat/service.ts` - 聊天服务
- `新建: packages/ai-core/src/features/chat/types.ts` - 聊天类型定义
- `新建: packages/ai-core/src/features/chat/index.ts` - 聊天模块导出

### 需要修改的文件
- `src/libs/Env.ts` - 添加 AI 相关环境变量验证
- `src/app/actions/aiActions.ts` - 创建 AI Server Actions（如果不存在则新建）
- `.env.local` - 添加 AI 服务的 API Keys
- `package.json` - 添加 AI 包管理脚本

### 配置文件
- `.env.local` - 添加 OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY
- `package.json` - 添加工作区脚本: ai:dev, ai:build, ai:test, ai:validate

## ✅ 验收标准

### 功能验收
- [ ] AIManager 可以成功初始化并连接到 Redis
- [ ] 支持 OpenAI GPT-4、Claude 3.5、Gemini Pro 三个 AI 提供商
- [ ] 实现文本生成、流式聊天、缓存功能
- [ ] 提示词加载器可以正确加载和缓存 Markdown 模板
- [ ] 速率限制功能正常工作，防止 API 滥用
- [ ] 语言指令注入功能正确实现多语言响应

### 性能验收
- [ ] 缓存命中率 > 80%，缓存响应时间 < 50ms
- [ ] AI API 调用响应时间 < 5秒
- [ ] 流式响应首字节时间 < 1秒
- [ ] 并发处理能力支持 100+ 请求/分钟

### 安全验收
- [ ] API Keys 安全存储，不在代码中硬编码
- [ ] 速率限制防止恶意调用
- [ ] 输入验证使用 Zod schema 严格校验
- [ ] 错误信息不泄露敏感信息

### 用户体验验收
- [ ] Server Actions 集成无缝，支持 React 组件调用
- [ ] 错误提示友好，提供明确的故障排除指导
- [ ] 开发体验良好，类型提示完整
- [ ] 包可以独立开发、测试、构建

## 🔗 相关资源

### 项目文档
- [需求文档](../packages/ai-core/readme.md)
- [开发规范](../CLAUDE.md)
- [包架构说明](../README.md#packages)

### 外部文档
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Anthropic Claude API 文档](https://docs.anthropic.com/claude/reference)
- [Google Gemini API 文档](https://ai.google.dev/docs)
- [Upstash Redis 文档](https://docs.upstash.com/redis)

### 相关任务
- [Task 006: Admin 包架构解耦](./006-admin-progressive-decoupling-plan.md)
- [Task 004: 数据库优化](./004-database-optimization.md)

## ⚠️ 技术考虑

### 架构决策
- **多提供商抽象**: 使用统一接口抽象不同 AI 提供商差异
- **缓存策略**: 使用 Redis 实现智能缓存，支持 TTL 和键过期
- **错误处理**: 实现优雅降级，提供商失败时自动切换
- **类型安全**: 全程使用 TypeScript + Zod 确保类型安全

### 风险评估
- **高风险**: API Key 泄露 - 缓解措施：环境变量 + .gitignore
- **中风险**: API 配额超限 - 缓解措施：速率限制 + 监控告警
- **低风险**: 提供商服务不可用 - 缓解措施：多提供商容错

### 性能考虑
- Redis 缓存减少 90% API 调用
- 流式响应提升用户体验
- 并发控制防止资源耗尽

### 兼容性
- 与现有 Supabase 认证系统兼容
- 支持所有现有语言环境 (en, es, ja, zh-HK)
- 保持与 Rolitt 开发规范一致

## 🧪 测试策略

### 单元测试
- [ ] AIManager 核心功能测试
- [ ] 各 AI 提供商服务测试
- [ ] 缓存和速率限制功能测试
- [ ] 提示词加载器测试
- [ ] 目标覆盖率: ≥ 80%

### 集成测试
- [ ] Redis 连接和缓存集成测试
- [ ] AI 提供商 API 集成测试
- [ ] Server Actions 集成测试

### 端到端测试
- [ ] 完整 AI 聊天流程测试
- [ ] 多语言响应测试
- [ ] 错误场景和容错测试

### 性能测试
- [ ] 并发请求压力测试
- [ ] 缓存性能基准测试
- [ ] API 响应时间测试

## 📊 监控和日志

### 监控指标
- AI API 调用次数和响应时间
- 缓存命中率和性能指标
- 错误率和失败原因分布
- 速率限制触发频率

### 日志记录
- AI 请求和响应日志（脱敏后）
- 缓存操作日志
- 错误和异常日志
- 性能指标日志

### 错误处理
- 分级错误处理 (info, warn, error)
- 用户友好的错误提示
- 开发环境详细错误信息

## 🚀 部署考虑

### 部署策略
- 作为 workspace 包随主应用一起部署
- 支持独立构建和测试
- 版本化发布和回滚能力

### 环境配置
- 开发环境：使用测试 API Keys
- 生产环境：使用正式 API Keys，启用全部监控

### 数据迁移
- 无需数据库迁移
- Redis 缓存可以随时清空重建

---

## 📝 执行记录

### 开始时间
- **开始日期**: 2025-01-21
- **执行者**: Claude Code Assistant
- **预计完成时间**: 2025-01-21 (一次性完成)

### 进度更新
- **开始**: 任务文件创建完成，准备开始包实现

### 完成记录
- **完成日期**: [待填写]
- **实际耗时**: [待填写]
- **验收结果**: [待填写]
- **后续跟进**: [待填写]

---

💡 **Claude Code 使用提示**:
```
# 执行此任务的 Claude Code 指令
@tasks/010-ai-core-package-implementation.md

# 或者
"Based on /tasks/010-ai-core-package-implementation.md, complete the task in one shot."
```