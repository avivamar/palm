# @rolitt/image-upload

极简但安全的图片上传包，专为 Rolitt 项目设计，基于 Cloudflare R2 存储，为 ChatGPT 图片识别功能提供基础支持。

## 🎯 设计原则

- **奥卡姆剃刀原则**：仅8个文件，极简设计
- **安全优先**：三层验证（文件类型白名单、大小限制、文件头魔数）
- **专注功能**：只支持图片上传，使用预签名URL模式
- **ChatGPT就绪**：为图片识别功能预留接口

## 🚀 快速开始

### 安装

```bash
npm install @rolitt/image-upload
```

### 环境变量配置

```bash
# Cloudflare R2 配置
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_REGION=auto
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

### 基础使用

```typescript
import { uploadImage, validateImage } from '@rolitt/image-upload';

// 上传图片
const result = await uploadImage(file, userId, (progress) => {
  console.log(`Upload progress: ${progress.percentage}%`);
});

if (result.success) {
  console.log('Image uploaded:', result.data);
} else {
  console.error('Upload failed:', result.error);
}
```

### React Hook 使用

```typescript
import { useImageUpload } from '@rolitt/image-upload/hooks';

function ImageUploader({ userId }: { userId: string }) {
  const { uploadImage, isUploading, progress, error } = useImageUpload(userId, {
    onSuccess: (image) => console.log('Uploaded:', image),
    onError: (error) => console.error('Error:', error),
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
      {isUploading && <p>Uploading... {progress?.percentage}%</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

## 📚 API 参考

### 核心函数

#### `uploadImage(file, userId, onProgress?)`

完整的图片上传流程，包含验证、上传、数据库记录。

**参数：**
- `file: File` - 要上传的图片文件
- `userId: string` - 用户ID
- `onProgress?: (progress) => void` - 进度回调

**返回：** `Promise<UploadResult>`

#### `validateImage(file)`

验证图片文件安全性（三层验证）。

**参数：**
- `file: File` - 要验证的文件

**返回：** `Promise<ValidationResult>`

#### `generateUploadUrl(fileName, contentType, userId)`

生成预签名上传URL。

**参数：**
- `fileName: string` - 文件名
- `contentType: string` - MIME类型
- `userId: string` - 用户ID

**返回：** `Promise<PresignedUrlData>`

### React Hooks

#### `useImageUpload(userId, options?)`

主要的图片上传Hook，提供完整的状态管理。

**参数：**
- `userId: string` - 用户ID
- `options?: UseImageUploadOptions` - 配置选项

**返回：** `UseImageUploadReturn`

#### `useSimpleImageUpload(userId)`

简化版上传Hook，仅返回基本状态。

## 🔒 安全特性

### 三层安全验证

1. **文件类型白名单**：仅允许 JPEG、PNG、WebP、GIF
2. **文件大小限制**：最大10MB，防止文件炸弹攻击
3. **文件头验证**：检查魔数，防止文件类型伪造

### 安全的文件命名

- 使用 UUID + 时间戳生成唯一文件名
- 防止路径遍历攻击
- 用户文件隔离存储

## 📊 支持的图片格式

| 格式 | MIME类型 | 最大大小 | 描述 |
|------|----------|----------|------|
| JPEG | image/jpeg | 10MB | 照片和复杂图像 |
| PNG | image/png | 10MB | 透明背景图像 |
| WebP | image/webp | 10MB | 现代高效格式 |
| GIF | image/gif | 10MB | 动画图像 |

## 🎨 ChatGPT 集成预留

数据库表包含为 ChatGPT 图片识别预留的字段：

```sql
-- 预留字段
description TEXT,                    -- 图片描述
tags TEXT[],                        -- 标签数组
ai_analyzed BOOLEAN DEFAULT FALSE,  -- AI分析状态
ai_description TEXT                 -- AI生成的描述
```

## 🔧 开发

### 构建

```bash
npm run build
```

### 开发模式

```bash
npm run dev
```

### 类型检查

```bash
npm run typecheck
```

### 测试

```bash
npm test
```

## 📝 类型定义

包含完整的 TypeScript 类型定义：

- `ImageUploadConfig` - R2客户端配置
- `UploadedImage` - 上传结果数据
- `ValidationResult` - 验证结果
- `UploadProgress` - 上传进度
- `UseImageUploadOptions` - Hook配置选项

## 🐛 错误处理

### 验证错误码

- `INVALID_FILE_TYPE` - 不支持的文件类型
- `FILE_TOO_LARGE` - 文件超过大小限制
- `INVALID_FILE_HEADER` - 文件头验证失败
- `FILE_CORRUPTED` - 文件损坏

### 用户友好错误信息

```typescript
import { getValidationErrorMessage } from '@rolitt/image-upload';

const message = getValidationErrorMessage(errorCode);
// "Please select a valid image file (JPEG, PNG, WebP, or GIF)."
```

## 📈 性能特性

- **预签名URL**：客户端直传，减少服务器负载
- **最小化处理**：不做图片压缩等复杂处理
- **简单存储**：直接存储，无复杂生命周期管理
- **内存高效**：流式上传，避免内存泄漏

## 🚀 部署注意事项

### 环境变量验证

包会自动验证必需的环境变量，缺失时抛出明确错误。

### CORS 配置

确保 Cloudflare R2 bucket 配置了正确的 CORS 策略：

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

## 🔗 相关链接

- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Rolitt 项目](https://github.com/rolitt/rolitt-official)
