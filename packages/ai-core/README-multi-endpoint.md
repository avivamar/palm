# OpenAI Multi-Endpoint Support 🚀

@rolitt/ai-core 现在支持 OpenAI 多endpoint配置，提供高可用性、自动故障转移和负载均衡功能。

## ✨ 主要特性

- 🔄 **自动故障转移**: 当主要endpoint失败时自动切换到备用endpoint
- ⚖️ **负载均衡**: 基于优先级和权重的智能负载分配
- 🛡️ **熔断器模式**: 自动隔离不健康的endpoint，并定期尝试恢复
- ⏱️ **速率限制**: 每个endpoint独立的RPS控制
- 📊 **健康检查**: 实时监控所有endpoint的健康状态
- 🔧 **向后兼容**: 完全兼容现有的单endpoint配置

## 📋 快速开始

### 1. 环境变量配置

```bash
# .env.local
# 主要 API (优先级 1)
OPENAI_API_KEY_1=sk-your-official-openai-key
OPENAI_BASE_URL_1=https://api.openai.com/v1
OPENAI_PRIORITY_1=1
OPENAI_MAX_RPS_1=100

# 代理 API (优先级 2)
OPENAI_API_KEY_2=your-proxy-api-key
OPENAI_BASE_URL_2=https://your-proxy-api.com/v1
OPENAI_PRIORITY_2=2
OPENAI_MAX_RPS_2=50

# 备用 API (优先级 3)
OPENAI_API_KEY_3=your-backup-api-key
OPENAI_BASE_URL_3=https://backup-api.com/v1
OPENAI_PRIORITY_3=3
OPENAI_MAX_RPS_3=20

# 全局配置
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_FALLBACK_ENABLED=true
OPENAI_MAX_RETRIES=3
OPENAI_BACKOFF_MS=1000
OPENAI_CIRCUIT_BREAKER=true
```

### 2. 代码集成

#### 自动配置（推荐）
```typescript
import { 
  OpenAIEnhancedService,
  createOpenAIConfigFromEnv 
} from '@rolitt/ai-core';

// 自动从环境变量创建配置
const config = createOpenAIConfigFromEnv();
if (config) {
  const service = new OpenAIEnhancedService();
  await service.initialize(config);
  
  // 使用服务
  const response = await service.generateText("Hello, world!");
  console.log(response);
}
```

#### 手动配置
```typescript
import { 
  OpenAIEnhancedService,
  createOpenAIMultiConfig 
} from '@rolitt/ai-core';

const config = createOpenAIMultiConfig('my-openai-setup', [
  {
    apiKey: 'sk-official-key',
    baseUrl: 'https://api.openai.com/v1',
    priority: 1,
    maxRPS: 100,
  },
  {
    apiKey: 'proxy-key',
    baseUrl: 'https://proxy-api.com/v1',  
    priority: 2,
    maxRPS: 50,
  }
], {
  model: 'gpt-4-turbo-preview',
  maxRetries: 3,
  backoffMs: 1000,
});

const service = new OpenAIEnhancedService();
await service.initialize(config);
```

## 🔧 配置选项

### Endpoint 配置
```typescript
type ProviderEndpoint = {
  url: string;           // API endpoint URL
  apiKey: string;        // API密钥
  priority: number;      // 优先级 (1-10, 1=最高)
  maxRPS?: number;       // 每秒最大请求数
  timeout?: number;      // 请求超时时间(ms)
  weight?: number;       // 负载均衡权重
  enabled: boolean;      // 是否启用
  healthCheck?: string;  // 健康检查endpoint
};
```

### 故障转移配置
```typescript
type FallbackConfig = {
  enabled: boolean;      // 是否启用故障转移
  maxRetries: number;    // 最大重试次数
  backoffMs: number;     // 重试延迟(ms)
  circuitBreaker: boolean; // 是否启用熔断器
};
```

## 📊 监控和调试

### 健康检查
```typescript
const service = new OpenAIEnhancedService();
await service.initialize(config);

// 获取详细健康信息
const health = await service.getDetailedHealth();
console.log(`健康endpoints: ${health.healthy}/${health.total}`);

health.endpoints.forEach(ep => {
  console.log(`${ep.url}: ${ep.healthy ? '✅' : '❌'} (${ep.responseTime}ms)`);
});
```

### 统计信息
```typescript
const modelInfo = service.getModelInfo();
console.log('服务统计:', modelInfo.statistics);
```

## 🎯 使用场景

### 1. 官方API + 备用代理
```typescript
import { createOpenAIWithProxy } from '@rolitt/ai-core';

const config = createOpenAIWithProxy(
  'sk-official-key',      // 官方API key
  'proxy-key',           // 代理API key  
  'https://proxy.com/v1', // 代理URL
  {
    model: 'gpt-4-turbo-preview',
    proxyPriority: 2       // 代理优先级
  }
);
```

### 2. 负载均衡设置
```typescript
import { exampleConfigs } from '@rolitt/ai-core';

const config = exampleConfigs.loadBalanced([
  { key: 'sk-key-1', url: 'https://api1.com/v1' },
  { key: 'sk-key-2', url: 'https://api2.com/v1' },
  { key: 'sk-key-3', url: 'https://api3.com/v1' },
]);
```

### 3. 开发环境配置
```typescript
import { createDevelopmentConfig } from '@rolitt/ai-core';

const devConfig = createDevelopmentConfig();
// 自动使用 OPENAI_API_KEY，禁用故障转移，降低RPS
```

## ⚡ 性能优化

### 优先级策略
- **Priority 1**: 官方API或最可靠的endpoint
- **Priority 2**: 高质量代理或备用服务
- **Priority 3+**: 额外备用或测试endpoint

### 速率限制最佳实践
```typescript
const endpoints = [
  {
    // 官方API: 高速率
    maxRPS: 100,
    priority: 1,
  },
  {
    // 代理API: 中等速率
    maxRPS: 50,
    priority: 2,
  },
  {
    // 备用API: 低速率
    maxRPS: 20,
    priority: 3,
  }
];
```

## 🔄 故障转移流程

1. **请求endpoint选择**: 选择优先级最高的健康endpoint
2. **请求执行**: 发送请求到选定endpoint
3. **故障检测**: 如果请求失败，记录错误并标记endpoint
4. **熔断器检查**: 连续失败超过阈值时触发熔断器
5. **自动切换**: 选择下一个可用endpoint
6. **指数退避**: 重试时使用指数退避延迟
7. **健康恢复**: 定期尝试恢复不健康的endpoint

## 🧪 测试和验证

### 单元测试
```bash
npm run test packages/ai-core/src/providers/openai/multi-endpoint.test.ts
```

### 手动测试
```typescript
// 测试故障转移
const service = new OpenAIEnhancedService();
await service.initialize(config);

// 模拟endpoint失败
service.setEndpointHealth('https://api.openai.com/v1', false);

// 验证自动切换到备用endpoint
const response = await service.generateText("Test failover");
```

## 🔄 迁移指南

### 从单endpoint迁移
现有代码**无需修改**，OpenAIEnhancedService 完全向后兼容：

```typescript
// 原有代码 - 继续工作
const service = new OpenAIService();  // 或 OpenAIEnhancedService
await service.initialize({
  apiKey: 'sk-xxx',
  baseUrl: 'https://api.openai.com/v1'
});

// 新增多endpoint支持 - 只需更改配置
const multiConfig = createOpenAIConfigFromEnv();
if (multiConfig) {
  await service.initialize(multiConfig); // 自动检测并启用多endpoint模式
}
```

## 🚨 故障排除

### 常见问题

1. **所有endpoint都不可用**
   ```
   Error: No healthy endpoints available
   ```
   - 检查API密钥是否有效
   - 验证URL是否正确
   - 检查网络连接

2. **频繁切换endpoint**  
   - 降低熔断器敏感度
   - 增加重试次数
   - 检查endpoint稳定性

3. **配置验证失败**
   ```typescript
   const validation = validateOpenAIConfig(config);
   console.log(validation.errors);
   ```

### 调试模式
```bash
# 启用详细日志
DEBUG=openai:* npm run dev
```

## 📈 最佳实践

1. **优先级设置**: 主要服务设为1，备用服务递增
2. **速率限制**: 根据API提供商限制合理设置maxRPS
3. **超时配置**: 备用服务使用较短超时时间
4. **监控告警**: 定期检查endpoint健康状态
5. **成本优化**: 优先使用成本较低的endpoint
6. **安全考虑**: 使用HTTPS，妥善保管API密钥

## 🤝 贡献

欢迎提交 issue 和 pull request！

---

**Multi-endpoint support for @rolitt/ai-core - 让你的AI服务永不掉线! 🚀**