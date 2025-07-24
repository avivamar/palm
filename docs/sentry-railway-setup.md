# Sentry 集成配置指南

## Railway 环境变量设置

为了在 Railway 部署中启用 Sentry 发布跟踪和错误监控，需要设置以下环境变量：

### 必需的环境变量

1. **NEXT_PUBLIC_SENTRY_DSN**
   - 描述：Sentry 项目的 DSN（Data Source Name）
   - 获取方式：在 Sentry 项目设置中找到
   - 示例：`https://your-dsn@sentry.io/project-id`

2. **SENTRY_AUTH_TOKEN**
   - 描述：Sentry API 认证令牌，用于创建发布
   - 获取方式：在 Sentry 组织设置 > Auth Tokens 中创建
   - 权限：需要 `project:releases` 权限
   - 示例：`your-auth-token-here`

### 可选的环境变量

3. **SENTRY_ORG**
   - 描述：Sentry 组织名称
   - 默认值：如果不设置，将使用 `.sentryclirc` 中的配置
   - 示例：`your-org-name`

4. **SENTRY_PROJECT**
   - 描述：Sentry 项目名称
   - 默认值：`rolitt-official`
   - 示例：`your-project-name`

## 功能说明

启动脚本现在包含以下 Sentry 集成功能：

### 1. 发布跟踪
- 自动创建 Sentry 发布，使用 Git commit SHA 或时间戳作为版本号
- 关联提交信息到发布
- 标记部署环境（production/development）
- 在服务器启动成功后标记发布为完成

### 2. 错误报告
- 服务器启动失败时自动报告错误到 Sentry
- 包含详细的错误上下文和环境信息

### 3. 部署监控
- 跟踪每次部署的状态
- 提供部署历史和回滚信息

## 设置步骤

1. 在 Sentry 中创建项目（如果还没有）
2. 获取项目 DSN
3. 创建 Auth Token（权限：project:releases）
4. 在 Railway 项目中设置环境变量
5. 重新部署项目

## 验证

部署后，你应该能在 Sentry 中看到：
- 新的发布记录
- 部署信息
- 如果有错误，相关的错误报告

## 故障排除

如果 Sentry 集成失败：
- 检查环境变量是否正确设置
- 验证 Auth Token 权限
- 查看 Railway 部署日志中的 Sentry 相关消息
- Sentry 集成失败不会影响应用正常启动
