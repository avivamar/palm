# Docker 环境变量最佳实践

## 当前实现

我们的 Dockerfile.minimal 现在使用了安全的环境变量管理：

```dockerfile
# 使用 ARG 处理敏感数据
ARG SHOPIFY_STORE_DOMAIN="placeholder-store"
ARG SHOPIFY_ADMIN_ACCESS_TOKEN="shpat_placeholder_token_for_build_only"
ENV SHOPIFY_STORE_DOMAIN=${SHOPIFY_STORE_DOMAIN}
ENV SHOPIFY_ADMIN_ACCESS_TOKEN=${SHOPIFY_ADMIN_ACCESS_TOKEN}
```

## 安全优势

1. **构建时安全**: ARG 变量不会保存在最终镜像中
2. **运行时灵活**: 可以在容器启动时覆盖环境变量
3. **审计友好**: 明确区分构建时和运行时变量

## 使用方法

### 本地开发
```bash
docker build --build-arg SHOPIFY_STORE_DOMAIN="your-store" -t rolitt .
```

### 生产部署
Railway 会自动使用平台配置的环境变量覆盖占位符值。

## 进一步改进建议

1. 考虑使用 Docker secrets 管理真正敏感的数据
2. 实现环境变量验证中间件
3. 添加环境变量文档生成工具
