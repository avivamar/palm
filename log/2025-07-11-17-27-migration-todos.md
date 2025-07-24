# Firebase 到 Supabase 认证迁移 TODO 清单

**创建时间**: 2025-07-11 17:27:00
**预计完成**: 2025-07-18
**负责人**: 开发团队

## 🎯 迁移总体进度

- [ ] **第1阶段**: 环境准备 (1天)
- [ ] **第2阶段**: 核心功能迁移 (2-3天)
- [ ] **第3阶段**: 数据迁移和测试 (1-2天)
- [ ] **第4阶段**: 清理和优化 (1天)

---

## 📋 第1阶段：环境准备 (第1天)

### Supabase 项目设置
- [ ] 创建 Supabase 项目
  - [ ] 访问 [supabase.com](https://supabase.com) 创建新项目
  - [ ] 记录项目 URL 和 API Keys
  - [ ] 配置项目基础设置

- [ ] 配置认证提供商
  - [ ] 启用 Email/Password 认证
  - [ ] 配置 Google OAuth (如果需要)
  - [ ] 配置 GitHub OAuth (如果需要)
  - [ ] 设置认证回调 URLs

- [ ] 数据库设计
  - [ ] 设计用户表结构
  - [ ] 创建用户相关表 (profiles, sessions 等)
  - [ ] 设置 Row Level Security (RLS) 策略
  - [ ] 创建必要的数据库函数

### 环境变量配置
- [ ] 更新本地环境变量
  ```env
  # 移除 Firebase 变量 (6个)
  # NEXT_PUBLIC_FIREBASE_API_KEY=
  # NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  # NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  # NEXT_PUBLIC_FIREBASE_APP_ID=
  # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
  # NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=

  # 添加 Supabase 变量 (仅2个)
  NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

- [ ] 更新 Railway 生产环境变量
  - [ ] 登录 Railway Dashboard
  - [ ] 删除所有 Firebase 环境变量
  - [ ] 添加 Supabase 环境变量
  - [ ] 验证配置正确性

### 依赖包管理
- [ ] 安装 Supabase 依赖
  ```bash
  npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
  npm install @supabase/auth-helpers-react @supabase/auth-ui-react
  ```

- [ ] 更新 package.json
  - [ ] 添加 Supabase 相关依赖
  - [ ] 保留 Firebase 依赖 (迁移期间)
  - [ ] 更新 TypeScript 类型定义

---

## 🔧 第2阶段：核心功能迁移 (第2-3天)

### 配置文件重写
- [ ] 创建 `src/libs/supabase/config.ts`
  ```typescript
  import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
  import { cookies } from 'next/headers';

  // 客户端 Supabase 客户端
  export const createClient = () => createClientComponentClient();

  // 服务端 Supabase 客户端
  export const createServerClient = () => createServerComponentClient({ cookies });
  ```

- [ ] 创建 `src/libs/supabase/auth.ts`
  ```typescript
  // 封装认证相关功能
  export const signUp = async (email: string, password: string) => { ... };
  export const signIn = async (email: string, password: string) => { ... };
  export const signOut = async () => { ... };
  export const getCurrentUser = async () => { ... };
  ```

- [ ] 创建 `src/libs/supabase/types.ts`
  ```typescript
  // 生成数据库类型定义
  export interface Database {
    public: {
      Tables: {
        users: { ... },
        profiles: { ... }
      }
    }
  }
  ```

### 认证组件重写
- [ ] 更新 `src/contexts/AuthContext.tsx`
  - [ ] 替换 Firebase 认证逻辑
  - [ ] 使用 Supabase 用户状态管理
  - [ ] 保持相同的 API 接口 (减少组件修改)

- [ ] 创建 `src/components/auth/SupabaseAuth.tsx`
  - [ ] 使用 Supabase Auth UI 组件
  - [ ] 支持多种登录方式
  - [ ] 集成现有样式系统

- [ ] 更新 `src/app/[locale]/layout.tsx`
  - [ ] 替换认证提供者
  - [ ] 初始化 Supabase 会话
  - [ ] 保持国际化支持

### API 路由重写
- [ ] 重写 `src/app/api/auth/session/route.ts`
  - [ ] 使用 Supabase 会话验证
  - [ ] 保持相同的响应格式

- [ ] 重写 `src/app/api/auth/create-session/route.ts`
  - [ ] 实现 Supabase 登录逻辑
  - [ ] 处理错误和验证

- [ ] 重写 `src/app/api/auth/logout/route.ts`
  - [ ] 实现 Supabase 登出逻辑
  - [ ] 清理会话数据

- [ ] 重写 `src/app/api/auth/verify-session/route.ts`
  - [ ] 使用 Supabase 令牌验证
  - [ ] 更新用户权限检查

### 中间件更新
- [ ] 更新 `src/middleware.ts`
  - [ ] 集成 Supabase 中间件
  - [ ] 处理认证路由保护
  - [ ] 保持国际化路由支持

---

## 🔄 第3阶段：数据迁移和测试 (第1-2天)

### 用户数据迁移
- [ ] 分析现有 Firebase 用户数据
  - [ ] 导出用户列表和基本信息
  - [ ] 识别用户元数据和自定义字段
  - [ ] 准备数据映射策略

- [ ] 实现数据迁移脚本
  - [ ] 创建 `scripts/migrate-users.ts`
  - [ ] 批量迁移用户账户
  - [ ] 处理密码重置 (无法迁移密码哈希)
  - [ ] 保留用户 UID 映射关系

- [ ] 通知用户 (如需要)
  - [ ] 发送迁移通知邮件
  - [ ] 提供密码重置链接
  - [ ] 说明迁移后的变更

### 功能测试
- [ ] 本地开发环境测试
  - [ ] 用户注册功能
  - [ ] 用户登录功能
  - [ ] 第三方 OAuth 登录
  - [ ] 密码重置功能
  - [ ] 会话持久性
  - [ ] 权限控制

- [ ] 生产环境部署测试
  - [ ] Railway 环境变量验证
  - [ ] 构建和部署成功
  - [ ] 认证流程端到端测试
  - [ ] 性能基准测试

### 回归测试
- [ ] 相关功能测试
  - [ ] 用户仪表板访问
  - [ ] 支付流程 (如果依赖认证)
  - [ ] 管理员权限功能
  - [ ] API 端点保护

- [ ] 浏览器兼容性测试
  - [ ] Chrome/Edge/Firefox/Safari
  - [ ] 移动端浏览器测试
  - [ ] 第三方登录在各浏览器的表现

---

## 🧹 第4阶段：清理和优化 (第1天)

### Firebase 依赖清理
- [ ] 移除 Firebase 相关文件
  - [ ] 删除 `src/libs/firebase/` 整个目录
  - [ ] 移除 Firebase 相关组件引用
  - [ ] 清理未使用的 import 语句

- [ ] 更新 package.json
  - [ ] 卸载 Firebase 相关包
    ```bash
    npm uninstall firebase @firebase/app @firebase/auth
    ```
  - [ ] 清理 package-lock.json
  - [ ] 运行 `npm audit` 检查安全性

- [ ] 更新配置文件
  - [ ] 清理 `next.config.ts` 中的 Firebase 配置
  - [ ] 移除环境变量验证中的 Firebase 字段
  - [ ] 更新 TypeScript 配置 (如需要)

### 性能优化
- [ ] Bundle 大小优化
  - [ ] 检查打包体积变化
  - [ ] 移除未使用的代码
  - [ ] 优化 import 策略

- [ ] 缓存策略优化
  - [ ] 配置 Supabase 客户端缓存
  - [ ] 优化认证状态管理
  - [ ] 实现智能预取

### 文档更新
- [ ] 更新开发文档
  - [ ] `README.md` 认证部分
  - [ ] 环境变量配置说明
  - [ ] 部署指南更新

- [ ] 创建迁移文档
  - [ ] 记录迁移过程
  - [ ] 问题和解决方案
  - [ ] 性能对比数据

---

## ✅ 验收标准

### 功能完整性
- [ ] 所有认证功能正常工作
- [ ] 用户数据完整迁移
- [ ] 第三方登录正常
- [ ] 权限控制有效

### 性能指标
- [ ] 认证响应时间 < 500ms
- [ ] 页面加载时间无明显增加
- [ ] Bundle 大小减少或保持
- [ ] 无认证相关错误

### 稳定性保证
- [ ] 连续运行 24 小时无问题
- [ ] 压力测试通过
- [ ] 错误处理机制完善
- [ ] 监控告警配置完成

---

## 🚨 风险预案

### 高风险项
- [ ] **数据丢失风险**:
  - 迁移前完整备份
  - 实施分批迁移
  - 保留 Firebase 数据 7 天

- [ ] **服务中断风险**:
  - 准备快速回滚方案
  - 部署在低峰时段
  - 监控系统实时检查

- [ ] **用户体验影响**:
  - 提前通知用户
  - 准备客服支持
  - 密码重置流程优化

### 应急联系
- **技术负责人**: [联系方式]
- **产品负责人**: [联系方式]
- **运维负责人**: [联系方式]

---

**文档版本**: v1.0
**最后更新**: 2025-07-11 17:27:00
**下次检查**: 2025-07-12 09:00:00
