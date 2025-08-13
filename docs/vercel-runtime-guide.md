# Vercel Runtime Configuration Guide

## 问题背景

Vercel的Edge Runtime默认不支持Node.js的某些功能，比如：
- 数据库连接（Supabase、Drizzle ORM）
- 文件系统操作
- 加密模块（crypto）
- 第三方Node.js库（Stripe、Notion等）

当API路由使用这些功能时，需要明确声明使用Node.js runtime。

## 解决方案

### 1. 添加Runtime声明

对于使用以下功能的API路由，需要添加runtime声明：

```typescript
// Add runtime declaration for Node.js compatibility
export const runtime = 'nodejs';
```

### 2. 需要Runtime声明的场景

- **数据库操作**：使用Supabase、Drizzle ORM、PostgreSQL等
- **外部API调用**：Stripe、Notion、Shopify等需要服务器环境的库
- **文件操作**：使用fs、path等Node.js模块
- **加密操作**：使用crypto模块
- **图片处理**：使用Sharp等需要系统依赖的库

### 3. 自动化检查

项目已配置自动化工具：

```bash
# 检查并添加runtime声明
npm run verify-runtime

# 作为CI/CD流程的一部分
npm run ci:validate
```

### 4. 代码示例

#### ✅ 正确的API路由

```typescript
import { NextResponse } from 'next/server';
import { createServerClient } from '@/libs/supabase/config';
import { getDB } from '@/libs/DB';

// Add runtime declaration for Node.js compatibility
export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createServerClient();
  const db = await getDB();
  
  // 数据库操作...
  
  return NextResponse.json({ success: true });
}
```

#### ❌ 错误的API路由（会导致部署失败）

```typescript
import { NextResponse } from 'next/server';
import { createServerClient } from '@/libs/supabase/config';
import { getDB } from '@/libs/DB';

// 缺少runtime声明！

export async function GET() {
  const supabase = await createServerClient();
  const db = await getDB();
  
  // 在Edge Runtime中会失败...
  
  return NextResponse.json({ success: true });
}
```

### 5. 最佳实践

1. **新建API路由时**：
   - 如果使用数据库或外部服务，立即添加runtime声明
   - 使用验证脚本检查：`npm run verify-runtime`

2. **代码审查时**：
   - 检查是否有新的API路由缺少runtime声明
   - 确保pre-commit hook正常工作

3. **CI/CD流程**：
   - 在构建前运行runtime验证
   - 包含在`npm run ci:validate`中

### 6. 故障排除

如果遇到部署错误：

1. **检查错误信息**：看是否提到Edge Runtime不兼容
2. **运行验证脚本**：`npm run verify-runtime`
3. **手动检查**：确认所有数据库相关的API路由都有runtime声明
4. **测试构建**：本地运行`npm run build`确认没有错误

### 7. 工具和脚本

- `scripts/verify-runtime-declarations.js` - 自动检测和添加runtime声明
- `.githooks/pre-commit` - Git提交前自动检查
- `npm run verify-runtime` - 手动运行验证

这个全局性解决方案确保了：
✅ 现有问题得到解决
✅ 未来不会再出现相同问题
✅ 开发流程中自动化检查
✅ 团队开发指南清晰明确