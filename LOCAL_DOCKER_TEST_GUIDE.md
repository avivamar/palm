# 🐳 本地 Docker 测试指南

## 🚀 快速开始

### 1. 基础测试
```bash
# 测试默认的 Dockerfile.minimal
./scripts/test-docker-local.sh

# 测试特定的 Dockerfile
./scripts/test-docker-local.sh Dockerfile.simple
./scripts/test-docker-local.sh Dockerfile.railway
./scripts/test-docker-local.sh Dockerfile
```

### 2. 调试工具
```bash
# 显示系统信息
./scripts/docker-debug.sh info

# 查看容器日志
./scripts/docker-debug.sh logs

# 查看容器性能
./scripts/docker-debug.sh stats

# 进入运行中的容器
./scripts/docker-debug.sh enter

# 测试所有 Dockerfile
./scripts/docker-debug.sh test-all

# 清理所有资源
./scripts/docker-debug.sh cleanup
```

## 🔍 测试流程

### 第一步：检查构建环境
```bash
# 检查 Docker 是否运行
docker info

# 检查可用的 Dockerfile
ls -la Dockerfile*

# 检查构建上下文
./scripts/docker-debug.sh build-check
```

### 第二步：测试构建
```bash
# 测试最简单的版本
./scripts/test-docker-local.sh Dockerfile.minimal

# 如果失败，查看错误日志
./scripts/docker-debug.sh logs
```

### 第三步：验证应用
```bash
# 检查应用是否正常运行
curl http://localhost:3000/api/health

# 检查主页
curl http://localhost:3000

# 检查容器状态
docker ps
```

## 🐛 常见问题和解决方案

### 构建失败
```bash
# 查看详细构建日志
docker build -f Dockerfile.minimal -t rolitt-test . --no-cache

# 检查构建上下文
./scripts/docker-debug.sh build-check

# 测试不同的 Dockerfile
./scripts/docker-debug.sh test-all
```

### 容器启动失败
```bash
# 查看容器日志
./scripts/docker-debug.sh logs

# 检查容器状态
./scripts/docker-debug.sh info

# 进入容器调试
./scripts/docker-debug.sh enter
```

### 应用不响应
```bash
# 检查容器统计
./scripts/docker-debug.sh stats

# 检查端口绑定
docker port rolitt-container

# 手动测试健康检查
curl -v http://localhost:3000/api/health
```

## 📊 性能测试

### 监控资源使用
```bash
# 实时监控
docker stats rolitt-container

# 检查镜像大小
docker images | grep rolitt

# 检查容器内存使用
docker exec rolitt-container free -h
```

### 压力测试
```bash
# 使用 ab 进行压力测试
ab -n 100 -c 10 http://localhost:3000/

# 使用 wrk 进行压力测试
wrk -t12 -c400 -d30s http://localhost:3000/
```

## 🔧 不同 Dockerfile 的比较

| Dockerfile | 构建时间 | 镜像大小 | 内存使用 | 推荐度 |
|-----------|---------|---------|---------|-------|
| Dockerfile.minimal | 快 | ~1.2GB | 低 | ⭐⭐⭐⭐⭐ |
| Dockerfile.simple | 中 | ~1.2GB | 中 | ⭐⭐⭐⭐ |
| Dockerfile.railway | 中 | ~1.2GB | 中 | ⭐⭐⭐ |
| Dockerfile | 慢 | ~800MB | 低 | ⭐⭐ |

## 🚀 部署前检查清单

- [ ] 本地 Docker 构建成功
- [ ] 容器启动正常
- [ ] 健康检查通过
- [ ] 主要页面可以访问
- [ ] 内存使用在合理范围内
- [ ] 没有错误日志

## 📝 提交到 Railway 前的最后验证

```bash
# 完整测试流程
./scripts/test-docker-local.sh Dockerfile.minimal

# 验证健康检查
curl http://localhost:3000/api/health

# 验证主页
curl http://localhost:3000

# 清理资源
./scripts/docker-debug.sh cleanup
```

如果本地测试全部通过，那么 Railway 部署成功的概率就很高！🎉
