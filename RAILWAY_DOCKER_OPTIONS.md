# Railway Docker 构建选项

## 🚀 可用的 Dockerfile 选项

### 1. **Dockerfile.minimal** (当前使用 - 推荐)
- **特点**: 最简单的单阶段构建
- **优势**:
  - 构建步骤最少，出错概率低
  - 没有外部脚本依赖
  - 网络问题最少
- **适用**: 优先尝试此选项

### 2. **Dockerfile.simple**
- **特点**: 包含详细的构建日志和错误处理
- **优势**:
  - 有详细的构建过程日志
  - 包含构建验证步骤
  - 内置重试机制
- **缺点**: 之前有脚本路径问题（已修复）

### 3. **Dockerfile.railway**
- **特点**: 单阶段构建，使用外部构建脚本
- **优势**:
  - 有强大的重试机制
  - 详细的错误处理
- **缺点**: 依赖外部脚本，可能有路径问题

### 4. **Dockerfile** (原始版本)
- **特点**: 多阶段构建，最优化
- **优势**:
  - 最小的最终镜像大小
  - 分离构建和运行环境
- **缺点**: 可能有网络连接问题

## 🔧 切换构建方式

要切换到不同的 Dockerfile，修改 `railway.json` 中的 `dockerfilePath`：

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.minimal" // 改为其他选项
  }
}
```

## 🐛 故障排除

### 如果 Dockerfile.minimal 失败：
1. 尝试 `Dockerfile.simple`
2. 如果还是失败，尝试 `Dockerfile.railway`
3. 最后尝试回到 `Dockerfile`

### 常见问题：
- **网络超时**: 使用 `Dockerfile.minimal` 或 `Dockerfile.simple`
- **构建脚本找不到**: 使用 `Dockerfile.minimal`
- **内存不足**: 已配置 4GB 内存，应该足够

## 📋 当前配置

- **当前使用**: `Dockerfile.minimal`
- **内存配置**: 4GB
- **CPU 配置**: 2 cores
- **重启策略**: ON_FAILURE，最多 10 次重试

## 🔄 回退选项

如果 Docker 构建仍然失败，可以考虑：
1. 回到 NIXPACKS 构建（修改 `railway.json` 中的 `builder` 为 `"NIXPACKS"`）
2. 使用其他部署平台（Vercel、Cloudflare Workers）

## 📊 性能对比

| Dockerfile | 构建时间 | 镜像大小 | 稳定性 | 推荐度 |
|-----------|---------|---------|-------|-------|
| Dockerfile.minimal | 快 | 大 | 高 | ⭐⭐⭐⭐⭐ |
| Dockerfile.simple | 中 | 大 | 高 | ⭐⭐⭐⭐ |
| Dockerfile.railway | 中 | 大 | 中 | ⭐⭐⭐ |
| Dockerfile | 慢 | 小 | 中 | ⭐⭐ |
