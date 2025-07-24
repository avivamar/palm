# Task 001: 简化版图片上传包实施 ⚡

## 🎯 目标

基于奥卡姆剃刀原则，实施一个**极简但安全**的 `@rolitt/image-upload` 包，专注于用户图片上传功能。该包将为后续的 ChatGPT 图片识别功能提供基础支持，去除不必要的抽象层，确保安全性的同时最小化复杂度。

> **包命名说明**: 选择 `@rolitt/image-upload` 而非 `@rolitt/cloudflare-r2` 或 `@rolitt/r2`，遵循项目功能导向的命名规范，与现有包（auth、admin、email、payments 等）保持一致，专注业务功能而非技术实现细节。

## 🔄 设计调整说明

**原设计问题**:
- 20+ 个文件，过度抽象
- 支持多种上传模式（直接上传、预签名URL、分片上传、批量上传）
- 复杂的文件处理和多云存储抽象

**新设计原则**:
- 仅 8 个核心文件
- 只支持图片上传（预签名 URL 模式）
- 专注安全验证，去除不必要功能
- 为 ChatGPT 集成预留接口

## 📊 当前状态

### 现状分析
- 项目当前缺乏统一的文件上传解决方案
- 需要支持多种文件类型和上传模式
- 要求与现有认证系统（Supabase Auth）和数据库（PostgreSQL）集成
- 必须符合项目的包架构标准和 TypeScript 严格模式

### 技术背景
- 基于 Cloudflare R2 对象存储服务
- 集成到现有的 monorepo 包架构中
- 使用 TypeScript 严格模式和项目统一的构建系统
- 支持 Next.js API 路由和 React Hooks

## 🔧 实施步骤（简化版）

- [ ] **步骤1**: 创建包基础架构 - 建立 `packages/image-upload` 目录，配置 package.json、tsconfig.json
- [ ] **步骤2**: 实现核心功能 - 开发 uploadImage、validateImage 函数和 useImageUpload Hook
- [ ] **步骤3**: 集成和测试 - 与认证系统集成，数据库表创建，基础测试

## 📁 涉及文件（极简版）

### 包结构（仅 8 个文件）
- `新建: packages/image-upload/package.json` - 包配置文件
- `新建: packages/image-upload/tsconfig.json` - TypeScript 配置
- `新建: packages/image-upload/src/index.ts` - 主导出文件（3个核心函数）
- `新建: packages/image-upload/src/client.ts` - R2 客户端（单一职责）
- `新建: packages/image-upload/src/validator.ts` - 图片安全验证
- `新建: packages/image-upload/src/types.ts` - 类型定义
- `新建: packages/image-upload/src/hooks/useImageUpload.ts` - React Hook
- `新建: packages/image-upload/README.md` - 包文档

### 数据库迁移
- `新建: migrations/create_user_images_table.sql` - 用户图片表

## ✅ 验收标准（简化版）

### 功能验收
- [ ] 支持图片上传（JPEG、PNG、WebP、GIF）
- [ ] 文件类型和大小验证正确执行
- [ ] 文件头验证防护恶意文件
- [ ] 与 Supabase Auth 认证系统集成
- [ ] 图片记录正确存储到 PostgreSQL

### 安全验收
- [ ] 文件类型白名单验证有效
- [ ] 文件大小限制（10MB）正确执行
- [ ] 文件头魔数验证防护伪造文件
- [ ] 安全的文件名生成（防路径遍历）

### 用户体验验收
- [ ] React Hook 提供简单的上传接口
- [ ] 上传进度和错误状态正确显示
- [ ] 错误信息友好且具有指导性

### 性能验收
- [ ] 图片上传响应时间 < 3秒（10MB 以下）
- [ ] 预签名 URL 模式减少服务器负载
- [ ] 内存使用合理，无泄漏

## 🔗 相关资源

### 项目文档
- [简化设计方案](./002-simplified-image-upload-package.md)
- [原始设计方案](./2025-07-29%2018:50-cloudflare-r2-storage-package-design.md)（参考用）
- [Claude Code 开发指南](../../docs/CLAUDE_CODE_DEVELOPMENT_GUIDE.md)

### 外部文档
- [Cloudflare R2 API 文档](https://developers.cloudflare.com/r2/api/)
- [预签名 URL 文档](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)

### 相关包参考
- [现有包结构](../../packages/)
- [Shared 包类型定义](../../packages/shared/)

## ⚠️ 技术考虑（简化版）

### 架构决策
- **极简设计**: 8 个文件，单一职责，易于理解和维护
- **安全优先**: 三层安全验证，防护恶意文件和文件炸弹
- **类型安全**: TypeScript 严格模式，完整类型定义
- **ChatGPT 就绪**: 为图片识别功能预留数据库字段

### 安全策略
- **文件类型白名单**: 仅允许 4 种图片格式
- **文件大小限制**: 10MB 上限，防止文件炸弹
- **文件头验证**: 检查魔数，防止文件类型伪造
- **安全文件名**: UUID + 时间戳，防止路径遍历

### 性能考虑
- **预签名 URL**: 客户端直传，减少服务器负载
- **最小化处理**: 不做图片压缩等复杂处理
- **简单存储**: 直接存储，不需要复杂的生命周期管理

## 🧪 测试策略（简化版）

### 核心测试
- [ ] uploadImage 函数的基础功能测试
- [ ] validateImage 的各种文件类型测试
- [ ] useImageUpload Hook 的状态管理测试
- [ ] 与 Cloudflare R2 的实际上传测试

### 安全测试
- [ ] 恶意文件上传防护测试
- [ ] 文件大小限制测试
- [ ] 文件类型伪造防护测试

## 📊 监控和日志（简化版）

### 基础监控
- 上传成功率统计
- 平均上传时间记录
- 错误类型和频率分析

### 简单日志
- 上传操作日志（用户ID、文件信息、时间）
- 错误日志和基础堆栈信息

## 🚀 部署考虑（简化版）

### 环境配置
- 开发环境使用测试 bucket
- 生产环境独立 R2 配置
- 环境变量管理

### 数据库迁移
- 创建 user_images 表
- 为 ChatGPT 集成预留字段

---

## 📝 执行记录

### 开始时间
- **开始日期**: 待定
- **执行者**: Claude Code + 开发团队
- **预计完成时间**: 2 天（比原方案减少 60% 时间）

### 简化效果
- **文件数量**: 8 个 vs 20+ 个（减少 60%）
- **开发时间**: 2 天 vs 5-7 天（减少 60%）
- **维护成本**: 大幅降低
- **功能专注**: 专注图片上传 + ChatGPT 集成

---

💡 **Claude Code 使用提示**:
```
# 执行简化版任务
@tasks/storage/001-cloudflare-r2-storage-package-implementation.md

# 参考简化设计
@tasks/storage/002-simplified-image-upload-package.md
```

## 🎯 成功指标（简化版）

完成此任务后，项目将获得：
- ✅ 极简但安全的图片上传功能
- ✅ 为 ChatGPT 图片识别预留的完整基础
- ✅ 最小化的维护成本和复杂度
- ✅ 清晰的代码结构，易于理解和扩展

**核心原则**: 先做最简单能工作的版本，专注核心需求，避免过度设计！
