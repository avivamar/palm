# 变更日志 - Cloudflare R2 文件上传系统设计方案

## 变更概述

**变更时间**: 2025-07-19 18:50
**变更类型**: 架构设计 / 新功能开发
**影响范围**: 新增 @rolitt/storage 包，文件上传系统架构
**变更状态**: 📋 设计完成，待实施

## 🎯 设计目标

基于项目现有的插拔式包架构，设计一个完全解耦的 Cloudflare R2 文件上传系统，遵循"less is more"原则，提供类型安全、功能完整的文件存储解决方案。

## 🏗️ 技术实现

### 1. 包架构设计

```
packages/storage/                    # @rolitt/storage
├── src/
│   ├── index.ts                    # 主导出文件
│   ├── config/
│   │   ├── index.ts               # 配置管理
│   │   └── types.ts               # 配置类型定义
│   ├── core/
│   │   ├── client.ts              # R2 客户端封装
│   │   ├── uploader.ts            # 上传核心逻辑
│   │   └── validator.ts           # 文件验证器
│   ├── types/
│   │   ├── index.ts               # 类型导出
│   │   ├── upload.ts              # 上传相关类型
│   │   └── storage.ts             # 存储相关类型
│   ├── utils/
│   │   ├── file-utils.ts          # 文件处理工具
│   │   ├── url-utils.ts           # URL 生成工具
│   │   └── security.ts            # 安全相关工具
│   ├── hooks/                     # React Hooks (可选)
│   │   ├── useFileUpload.ts       # 文件上传 Hook
│   │   └── useStorageUrl.ts       # 存储 URL Hook
│   ├── components/                # UI 组件 (可选)
│   │   ├── FileUploader.tsx       # 文件上传组件
│   │   └── ImageUploader.tsx      # 图片上传组件
│   └── api/                       # API 路由处理器
│       ├── upload.ts              # 上传 API 处理
│       └── signed-url.ts          # 签名 URL 生成
├── package.json
├── tsconfig.json
├── README.md
└── CHANGELOG.md
```

### 2. 核心功能特性

#### 类型安全的配置系统
```typescript
type StorageConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region?: string;
  publicUrl?: string;
  maxFileSize?: number;
  allowedTypes?: string[];
};
```

#### 多种上传模式支持
- **直接上传**: 服务端直接上传到 R2
- **预签名 URL**: 客户端直接上传（推荐）
- **分片上传**: 大文件分片处理
- **批量上传**: 多文件并行处理

#### 完整的文件验证
- 文件类型验证（MIME type + 文件扩展名）
- 文件大小限制
- 文件内容安全检查
- 自定义验证规则

#### 智能文件处理
- 自动文件重命名（防冲突）
- 图片自动压缩和格式转换
- 文件元数据提取
- 缩略图生成

### 3. API 设计

#### 核心 API
```typescript
// 主要导出接口
export class StorageClient {
  upload(file: File, options?: UploadOptions): Promise<UploadResult>;
  uploadMultiple(files: File[], options?: UploadOptions): Promise<UploadResult[]>;
  generateSignedUrl(key: string, options?: SignedUrlOptions): Promise<string>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}

// React Hooks
export function useFileUpload(config?: UploadConfig): {
  upload: (file: File) => Promise<UploadResult>;
  uploading: boolean;
  progress: number;
  error: Error | null;
};
```

#### Next.js API 路由集成
```typescript
// API 路由处理器
export function createUploadHandler(config: StorageConfig): NextApiHandler;
export function createSignedUrlHandler(config: StorageConfig): NextApiHandler;
```

### 4. 安全性设计

#### 访问控制
- 基于用户角色的上传权限
- 文件访问权限控制
- 临时访问链接生成

#### 内容安全
- 文件类型白名单
- 恶意文件检测
- 内容扫描集成

#### 速率限制
- 用户级别的上传频率限制
- 文件大小和数量限制
- IP 级别的防护

### 5. 集成方案

#### 与现有认证系统集成
```typescript
// 与 Supabase Auth 集成
type AuthenticatedUploadOptions = UploadOptions & {
  userId?: string;
  userRole?: 'admin' | 'user';
  permissions?: string[];
};
```

#### 与数据库集成
```typescript
// 文件记录存储到 PostgreSQL
type FileRecord = {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
};
```

#### 与现有包系统集成
- 复用 `@rolitt/shared` 的类型定义
- 集成 `@rolitt/auth` 的认证机制
- 使用统一的错误处理模式

## 📊 监控和日志

### 上传监控
- 上传成功率统计
- 上传速度监控
- 错误率追踪

### 存储监控
- 存储空间使用情况
- 带宽使用统计
- 成本分析

### 日志记录
- 详细的上传日志
- 错误日志和堆栈跟踪
- 性能指标记录

## 🎨 使用示例

### 基础使用
```typescript
import { StorageClient } from '@rolitt/storage';

const storage = new StorageClient({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  bucketName: process.env.CLOUDFLARE_BUCKET_NAME!,
});

// 上传文件
const result = await storage.upload(file, {
  folder: 'user-avatars',
  resize: { width: 200, height: 200 },
  format: 'webp'
});
```

### React 组件使用
```typescript
import { useFileUpload } from '@rolitt/storage';

function AvatarUploader() {
  const { upload, uploading, progress } = useFileUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  });

  const handleUpload = async (file: File) => {
    const result = await upload(file);
    console.log('Uploaded:', result.url);
  };

  return (
    <FileUploader
      onUpload={handleUpload}
      loading={uploading}
      progress={progress}
    />
  );
}
```

## 🔄 开发和部署流程

### 开发阶段
- 独立包开发，不影响主应用
- 完整的单元测试和集成测试
- TypeScript 严格模式验证

### 集成阶段
- 通过 workspace 引用集成到主应用
- 渐进式功能启用
- 向后兼容性保证

### 部署阶段
- 支持 Railway、Vercel、Cloudflare Workers
- 环境变量统一管理
- 生产环境优化

## 📈 扩展性考虑

### 多云支持
- 抽象存储接口，支持 AWS S3、Azure Blob
- 统一的 API 接口
- 配置驱动的存储选择

### 功能扩展
- CDN 集成
- 图片处理服务
- 视频处理支持

### 性能优化
- 边缘缓存策略
- 智能压缩算法
- 并发上传优化

## 📋 实施计划

### 第一阶段：基础架构（1-2天）
- [ ] 创建 `packages/storage` 包结构
- [ ] 实现核心 StorageClient 类
- [ ] 配置 TypeScript 和构建系统
- [ ] 基础类型定义

### 第二阶段：核心功能（2-3天）
- [ ] 实现文件上传功能
- [ ] 文件验证和安全检查
- [ ] 预签名 URL 生成
- [ ] 错误处理和重试机制

### 第三阶段：React 集成（1-2天）
- [ ] 实现 useFileUpload Hook
- [ ] 创建 FileUploader 组件
- [ ] 图片上传专用组件
- [ ] 进度和状态管理

### 第四阶段：API 集成（1天）
- [ ] Next.js API 路由处理器
- [ ] 与现有认证系统集成
- [ ] 数据库记录管理
- [ ] 权限控制实现

### 第五阶段：测试和文档（1天）
- [ ] 单元测试和集成测试
- [ ] API 文档编写
- [ ] 使用示例和最佳实践
- [ ] 性能基准测试

## 🔍 验证标准

### 功能验证
- [ ] 文件上传成功率 > 99%
- [ ] 支持多种文件格式
- [ ] 文件大小限制正确执行
- [ ] 安全验证有效防护

### 性能验证
- [ ] 上传速度满足预期
- [ ] 内存使用合理
- [ ] 并发处理能力
- [ ] 错误恢复机制

### 集成验证
- [ ] 与现有系统无冲突
- [ ] TypeScript 类型检查通过
- [ ] 构建和部署正常
- [ ] 文档完整准确

## 🚨 风险评估

### 技术风险
- **低风险**: 基于成熟的 Cloudflare R2 API
- **中风险**: 文件处理和安全验证复杂性
- **缓解措施**: 充分测试和渐进式部署

### 集成风险
- **低风险**: 独立包设计，影响范围可控
- **缓解措施**: 完整的向后兼容性保证

### 维护风险
- **低风险**: 遵循项目现有架构模式
- **缓解措施**: 完整的文档和测试覆盖

## 📚 相关资源

- [Cloudflare R2 API 文档](https://developers.cloudflare.com/r2/api/)
- [项目包架构规范](../tasks/package/PACKAGE_ARCHITECTURE_REFACTOR.md)
- [TypeScript 配置指南](../tsconfig.json)
- [现有包参考](../packages/)

## 🎯 后续优化

### 短期优化（1个月内）
- 性能监控和优化
- 用户反馈收集和改进
- 文档完善和示例补充

### 中期优化（3个月内）
- 多云存储支持
- 高级图片处理功能
- 批量操作优化

### 长期优化（6个月内）
- AI 驱动的内容分析
- 自动化成本优化
- 企业级功能扩展

## 📞 联系方式

如有问题或建议，请:
- 提交 GitHub Issue
- 联系项目维护团队
- 参与技术讨论会议

---

**设计版本**: v1.0
**创建时间**: 2025-07-29 18:50
**设计团队**: Rolitt 开发团队
**状态**: 设计完成，等待实施确认
