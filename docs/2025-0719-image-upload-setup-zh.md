# Cloudflare R2 图片上传包设置指南

## 概述

`@rolitt/image-upload` 包提供了使用 Cloudflare R2 存储的安全图片上传功能。本指南涵盖了使用该包所需的设置和配置。
数据库文件：migrations/0003_create_user_images_table.sql
## 必需的环境变量

将以下环境变量添加到您的 `.env` 文件中：

```bash
# Cloudflare R2 配置
CLOUDFLARE_R2_BUCKET_NAME="your-bucket-name"
CLOUDFLARE_R2_REGION="auto"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-access-key"
CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
```

## Cloudflare R2 设置

1. **创建 R2 存储桶**：
   - 登录 Cloudflare 控制台
   - 导航到 R2 对象存储
   - 使用您想要的名称创建新存储桶

2. **生成 API 令牌**：
   - 转到 R2 → 管理 R2 API 令牌
   - 创建具有以下权限的令牌：
     - Object:Read
     - Object:Write
     - Bucket:List

3. **获取账户 ID**：
   - 在 Cloudflare 控制台的右侧边栏中可找到
   - 用于构建端点 URL

## 数据库迁移

运行数据库迁移以创建所需的表：

```bash
npm run db:migrate
```

这将创建具有以下结构的 `user_images` 表：
- `id` - 主键
- `user_id` - 用户表的外键
- `file_name` - 原始文件名
- `file_size` - 文件大小（字节）
- `mime_type` - MIME 类型（jpeg、png、webp、gif）
- `url` - 访问图片的公共 URL
- `r2_key` - R2 对象键，用于存储引用
- `description` - 可选描述
- `tags` - 标签数组
- `ai_analyzed` - ChatGPT 集成的布尔标志
- `ai_description` - AI 生成的描述
- `created_at` - 上传时间戳
- `updated_at` - 最后修改时间戳

## 使用方法

### 1. 基本上传（React Hook）

```tsx
import { useImageUpload } from '@rolitt/image-upload/hooks';

export function ImageUploadComponent({ userId }: { userId: string }) {
  const { uploadImage, isUploading, progress, error } = useImageUpload(userId, {
    onSuccess: (result) => {
      console.log('上传成功:', result);
    },
    onError: (error) => {
      console.error('上传失败:', error);
    },
    onProgress: (progress) => {
      console.log(`上传进度: ${progress.percentage}%`);
    }
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      {isUploading && (
        <p>
          上传中...
          {' '}
          {progress?.percentage || 0}
          %
        </p>
      )}
      {error && (
        <p style={{ color: 'red' }}>
          错误:
          {' '}
          {error}
        </p>
      )}
    </div>
  );
}
```

### 2. 手动上传

```typescript
import { generateUploadUrl, getUserImages, uploadImage } from '@rolitt/image-upload';

// 生成预签名 URL 用于直接上传
const presignedData = await generateUploadUrl('my-image.jpg', 'image/jpeg', 'user-123');

// 完成上传并验证
const result = await uploadImage(file, 'user-123');
if (result.success) {
  console.log('已上传图片:', result.data);
}

// 获取用户的图片
const userImages = await getUserImages('user-123');
```

### 3. API 端点

该包提供以下 API 端点：

- `POST /api/user/images/upload-url` - 生成预签名上传 URL
- `GET /api/user/images?userId=123` - 获取用户的图片
- `POST /api/user/images` - 上传后保存图片记录
- `DELETE /api/user/images?imageId=123` - 删除图片记录

## 安全功能

### 1. 文件验证
- **文件类型白名单**：仅允许 JPEG、PNG、WebP 和 GIF 图片
- **大小限制**：最大文件大小 10MB
- **魔数验证**：验证实际文件格式与文件扩展名

### 2. 访问控制
- **需要身份验证**：所有端点都需要有效的 Supabase 会话
- **用户隔离**：用户只能访问自己的图片
- **安全密钥生成**：UUID + 时间戳防止路径遍历

### 3. 错误处理
- **全面验证**：客户端和服务器端验证
- **优雅失败**：详细的错误消息用于调试
- **重试逻辑**：内置瞬态故障重试

## ChatGPT 集成（未来功能）

数据库架构包含 AI 集成字段：
- `description` - 用户提供的图片描述
- `tags` - 可搜索标签
- `ai_analyzed` - 指示 AI 处理状态的标志
- `ai_description` - AI 生成的图片描述

## 故障排除

### 常见问题

1. **"缺少必需的环境变量"**
   - 确保设置了所有 R2 环境变量
   - 验证环境文件已正确加载

2. **"生成预签名 URL 失败"**
   - 检查 R2 凭据和权限
   - 验证存储桶存在且可访问

3. **"文件验证失败"**
   - 确保文件是支持的图片格式
   - 检查文件大小是否在 10MB 限制内

4. **"用户未找到"**
   - 验证用户已通过 Supabase 身份验证
   - 检查用户在数据库中存在

### 调试模式

启用调试日志：

```bash
DEBUG=@rolitt/image-upload npm run dev
```

## 性能考虑

- **直接上传**：使用预签名 URL 直接上传到 R2，减少服务器负载
- **异步处理**：数据库操作通过 webhook 异步进行
- **CDN 缓存**：R2 提供全球 CDN 以实现快速图片传输
- **渐进增强**：在没有 JavaScript 的情况下也能提供基本功能

## 监控

通过以下方式监控上传成功率和错误：
- 应用程序日志
- Cloudflare R2 分析
- 数据库查询日志
- 用户反馈机制
