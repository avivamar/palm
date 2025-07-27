# Cloudflare R2 Upload Troubleshooting Guide

## 问题描述
用户上传手相图片到 Cloudflare R2 时失败，即使环境变量已正确配置。

## 用户当前环境变量
```bash
CLOUDFLARE_R2_BUCKET_NAME=palm
CLOUDFLARE_R2_REGION=auto
CLOUDFLARE_R2_ACCESS_KEY_ID=u7PH1DS1vl_vJLVPEQs1NcLX-JETZ9sBDDLtb0rQ
CLOUDFLARE_R2_SECRET_ACCESS_KEY=u7PH1DS1vl_vJLVPEQs1NcLX-JETZ9sBDDLtb0rQ
CLOUDFLARE_R2_ENDPOINT=https://2fc5a27543499b104d29c62f3f766d6d.r2.cloudflarestorage.com/palm
```

## 发现的问题

### 1. Endpoint 配置错误 ❌
**问题**: Endpoint URL 包含了 bucket 名称 `/palm`
```bash
# 错误配置
CLOUDFLARE_R2_ENDPOINT=https://2fc5a27543499b104d29c62f3f766d6d.r2.cloudflarestorage.com/palm

# 正确配置
CLOUDFLARE_R2_ENDPOINT=https://2fc5a27543499b104d29c62f3f766d6d.r2.cloudflarestorage.com
```

### 2. 访问密钥重复 ❌
**问题**: Access Key ID 和 Secret Access Key 是相同的值
```bash
# 问题配置 - 两个值相同
CLOUDFLARE_R2_ACCESS_KEY_ID=u7PH1DS1vl_vJLVPEQs1NcLX-JETZ9sBDDLtb0rQ
CLOUDFLARE_R2_SECRET_ACCESS_KEY=u7PH1DS1vl_vJLVPEQs1NcLX-JETZ9sBDDLtb0rQ
```

## 解决方案

### 步骤 1: 修正 Endpoint 配置
移除 endpoint URL 中的 bucket 名称:
```bash
# 更新环境变量
CLOUDFLARE_R2_ENDPOINT=https://2fc5a27543499b104d29c62f3f766d6d.r2.cloudflarestorage.com
```

### 步骤 2: 验证访问密钥
确保 Access Key ID 和 Secret Access Key 是不同的值。如果相同，需要重新生成 R2 API 令牌。

### 步骤 3: 测试配置
使用测试 API 验证配置:
```bash
curl http://localhost:3000/api/test-r2
```

### 步骤 4: 检查 R2 存储桶权限
确保 API 令牌具有以下权限:
- Object:Read
- Object:Write
- Object:Delete (可选)

## 代码修复

### 1. R2 Client 改进
已修复 `packages/image-upload/src/client.ts`:
- 自动清理 endpoint 中的 bucket 名称
- 改进错误处理和日志记录
- 标准化公共 URL 生成

### 2. 上传 API 增强
已更新 `src/app/api/palm/upload/route.ts`:
- 添加详细的调试日志
- 改进错误报告
- 测试公共 URL 可访问性

## 测试工具

### 1. R2 配置测试 API
访问 `/api/test-r2` 获取详细的配置诊断信息。

### 2. 上传测试
使用 Palm 分析页面测试完整的上传流程。

## 预期结果

配置修正后，您应该看到:
1. ✅ R2 客户端创建成功
2. ✅ 预签名 URL 生成成功
3. ✅ 图片上传成功
4. ✅ 公共 URL 可访问

## 监控和调试

所有相关日志将在服务器控制台中显示，包括:
- 环境变量状态检查
- R2 客户端配置详情
- 预签名 URL 生成过程
- 上传响应状态
- 公共 URL 测试结果

## 下一步

1. 更新环境变量配置
2. 重启开发服务器
3. 测试图片上传功能
4. 验证图片可通过公共 URL 访问