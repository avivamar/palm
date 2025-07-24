# Scripts Directory

这个目录包含了 Rolitt 项目的各种脚本工具。

## Pre-push Validation Script

### `pre-push-validation.sh`

这是一个全面的预推送验证脚本，用于在代码推送前验证所有构建和部署配置。

#### 功能特性

- ✅ **代码质量检查**：ESLint 和 TypeScript 类型检查
- ✅ **测试验证**：运行所有测试用例
- ✅ **标准构建**：验证 Next.js 标准构建
- ✅ **Cloudflare Workers 构建**：验证 Cloudflare Workers 部署构建
- ✅ **配置验证**：检查 wrangler.toml 配置正确性
- ✅ **本地测试**：可选的 Cloudflare Workers 本地测试
- ✅ **部署问题检查**：检查常见的部署问题

#### 使用方法

```bash
# 在项目根目录运行
./scripts/pre-push-validation.sh

# 或者使用 bash 运行
bash scripts/pre-push-validation.sh
```

#### 验证流程

1. **环境检查**
   - 检查必需的工具（npm, npx）
   - 验证项目目录结构
   - 安装/更新依赖

2. **代码质量**
   - ESLint 代码风格检查
   - TypeScript 类型检查
   - 单元测试和集成测试

3. **构建验证**
   - Next.js 标准构建（用于 Vercel）
   - Cloudflare Workers 构建
   - 验证生成的文件

4. **配置检查**
   - wrangler.toml 配置验证
   - 入口文件存在性检查

5. **部署测试**
   - 可选的本地 Cloudflare Workers 测试
   - 大文件检查
   - Node.js 版本兼容性检查

#### 输出示例

```bash
[INFO] Starting pre-push validation for Rolitt project...
[SUCCESS] All required tools are available
[SUCCESS] Dependencies are up to date
[SUCCESS] ESLint passed
[SUCCESS] TypeScript type checking passed
[SUCCESS] Tests passed
[SUCCESS] Standard Next.js build successful
[SUCCESS] Cloudflare Workers build successful
[SUCCESS] All generated files verified
[SUCCESS] wrangler.toml configuration is valid
[SUCCESS] 🎉 All pre-push validations passed!
```

#### 集成到 Git Hooks

**自动安装（推荐）**

使用提供的安装脚本一键设置：

```bash
./scripts/install-git-hooks.sh
```

**手动安装**

你也可以手动将此脚本集成到 Git pre-push hook 中：

```bash
# 创建 pre-push hook
echo '#!/bin/bash' > .git/hooks/pre-push
echo './scripts/pre-push-validation.sh' >> .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

**验证安装**

安装后，每次执行 `git push` 时都会自动运行验证：

```bash
git add .
git commit -m "your changes"
git push  # 自动触发验证
```

#### 故障排除

如果脚本失败，请检查：

1. **依赖问题**：运行 `npm ci` 重新安装依赖
2. **代码问题**：修复 ESLint 和 TypeScript 错误
3. **测试失败**：修复失败的测试用例
4. **构建问题**：检查 Next.js 配置和代码兼容性
5. **配置问题**：验证 wrangler.toml 和 open-next.config.ts

#### 跳过某些检查

如果需要跳过某些检查（不推荐），可以修改脚本或设置环境变量：

```bash
# 跳过测试（示例，需要修改脚本）
SKIP_TESTS=true ./scripts/pre-push-validation.sh
```

#### 相关文档

- [Cloudflare Workers 部署指南](../content/cloudflareworkers.md)
- [项目 README](../README.md)
- [性能优化指南](../content/PERFORMANCE_OPTIMIZATION.md)

---

## Git Hooks 集成

### `install-git-hooks.sh`

Git hooks 自动安装脚本，用于设置预推送验证的自动化流程。

#### 功能特性

- ✅ **自动安装**：一键设置 Git pre-push hook
- ✅ **备份保护**：自动备份现有的 hooks
- ✅ **权限设置**：自动设置正确的执行权限
- ✅ **验证测试**：安装后自动测试 hook 是否正常工作
- ✅ **详细说明**：提供完整的使用指南

#### 使用方法

```bash
# 在项目根目录运行
./scripts/install-git-hooks.sh
```

#### 安装效果

安装后，每次执行 `git push` 时会自动：
1. 运行代码质量检查（ESLint、TypeScript）
2. 执行所有测试用例
3. 验证 Next.js 标准构建
4. 验证 Cloudflare Workers 构建
5. 检查配置文件正确性
6. 只有所有验证通过才允许推送

#### 卸载方法

```bash
# 删除 pre-push hook
rm .git/hooks/pre-push

# 如果有备份，可以恢复
# mv .git/hooks/pre-push.backup.YYYYMMDD_HHMMSS .git/hooks/pre-push
```

---

## 日志创建脚本

### `create-log.sh` 和 `log.sh`

自动化创建项目变更日志的脚本，避免时间格式错误。

#### 功能特性

- ✅ **自动时间戳**：生成准确的 `YYYY-MM-DD-HH-MM` 格式
- ✅ **标准模板**：使用项目统一的变更日志模板
- ✅ **重复检查**：防止创建重复的日志文件
- ✅ **清晰反馈**：提供创建状态和操作指导

#### 使用方法

```bash
# 推荐：使用简化脚本
./scripts/log.sh "brief-description"

# 完整版本（包含更多反馈信息）
./scripts/create-log.sh "brief-description"

# 实际示例
./scripts/log.sh "api-timeout-handling-optimization"
# 输出：log/2025-07-08-09-17-api-timeout-handling-optimization.md
```

#### 脚本优势

- 🕒 **避免时间错误**：自动生成准确时间戳，解决手动输入时间格式错误的问题
- 📝 **标准化**：确保所有日志文件格式一致
- ⚡ **效率提升**：一条命令完成文件创建和模板填充
- 💡 **用户友好**：提供清晰的操作反馈和下一步指导

#### 相关文档

- [日志记录规范](../log/README.md)
- [变更日志模板](../log/CHANGELOG_TEMPLATE.md)

---

## 其他脚本

这个目录还包含其他有用的脚本：

- `setup-*.sh`：各种设置脚本
- `check-*.sh`：检查脚本
- `verify-*.sh`：验证脚本
- `*.md`：相关文档和指南

请查看各个脚本文件了解具体用途。
