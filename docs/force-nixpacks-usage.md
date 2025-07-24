# 强制Railway使用NIXPACKS的说明

## 问题
Railway忽略了`railway.json`中的`"builder": "NIXPACKS"`设置，仍在使用Dockerfile构建。

## 解决方案
1. **备份Dockerfile**: 移动到`Dockerfile.backup`
2. **强化railway.json**: 添加明确的buildCommand
3. **清理构建缓存**: 在Railway控制台手动触发新构建

## 验证NIXPACKS使用
部署日志应该显示：
```
Setting up Next.js environment variables for build...
NEXT_PUBLIC_SUPABASE_URL=https://xxx...
```

而不是：
```
[internal] load build definition from Dockerfile
```

## Dockerfile vs NIXPACKS对比

### Dockerfile问题
❌ 构建时无法访问Railway环境变量
❌ 需要手动处理Next.js环境变量映射
❌ 更复杂的多阶段构建

### NIXPACKS优势
✅ 自动处理环境变量映射
✅ 针对Next.js优化
✅ 更简洁的配置
✅ 更快的构建速度
