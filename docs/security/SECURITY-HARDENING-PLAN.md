# 🛡️ Rolitt 系统安全加固方案

## 🚨 威胁分析

**当前情况**：
- 检测到来自爱尔兰的 DDoS 攻击尝试
- Vercel 已成功拦截攻击
- 需要加强主动防御措施

## 🎯 安全加固策略

### 1. **API 速率限制 (Rate Limiting)**

#### 1.1 基于 IP 的限制
```typescript
// 使用 Redis 实现滑动窗口速率限制
type RateLimitConfig = {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
  blockDuration: number; // 封禁时长
};

// 不同 API 的限制策略
const rateLimits = {
  // 公开 API
  public: { windowMs: 60000, maxRequests: 60, blockDuration: 3600000 },

  // 认证 API
  auth: { windowMs: 60000, maxRequests: 10, blockDuration: 3600000 },

  // 支付 API
  payment: { windowMs: 60000, maxRequests: 5, blockDuration: 7200000 },

  // 管理员 API
  admin: { windowMs: 60000, maxRequests: 30, blockDuration: 1800000 }
};
```

#### 1.2 基于用户的限制
- 已登录用户：更宽松的限制
- 未登录用户：严格限制
- 新注册用户：渐进式提升限额

### 2. **多层身份验证**

#### 2.1 API 密钥验证
```typescript
// API 密钥中间件
export async function validateApiKey(request: Request) {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey || !isValidApiKey(apiKey)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 记录 API 使用情况
  await trackApiUsage(apiKey);
}
```

#### 2.2 JWT Token 验证增强
- 短期 Access Token (15分钟)
- 长期 Refresh Token (7天)
- Token 黑名单机制
- 设备指纹绑定

### 3. **请求验证和过滤**

#### 3.1 请求签名验证
```typescript
// HMAC 签名验证
function verifyRequestSignature(request: Request, secret: string) {
  const timestamp = request.headers.get('X-Timestamp');
  const signature = request.headers.get('X-Signature');

  // 防止重放攻击：时间戳必须在5分钟内
  if (!isTimestampValid(timestamp, 5 * 60 * 1000)) {
    return false;
  }

  // 验证签名
  const payload = `${request.method}:${request.url}:${timestamp}`;
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}
```

#### 3.2 输入验证
- Zod schema 严格验证
- SQL 注入防护
- XSS 过滤
- 文件上传限制

### 4. **地理位置和 IP 过滤**

#### 4.1 地理围栏
```typescript
// 基于 Cloudflare Workers 的地理过滤
const blockedCountries = ['XX', 'YY']; // 高风险国家代码
const allowedCountries = ['US', 'CA', 'GB', 'JP', 'HK']; // 主要市场

export function geoFilter(request: Request) {
  const country = request.headers.get('CF-IPCountry');

  // 黑名单模式
  if (blockedCountries.includes(country)) {
    return new Response('Access Denied', { status: 403 });
  }

  // 白名单模式（可选）
  // if (!allowedCountries.includes(country)) {
  //   return new Response('Service Unavailable', { status: 503 });
  // }
}
```

#### 4.2 IP 信誉检查
- 集成 IP 信誉数据库
- 自动封禁恶意 IP
- VPN/代理检测

### 5. **WAF 规则配置**

#### 5.1 Vercel WAF 规则
```json
{
  "rules": [
    {
      "name": "Block SQL Injection",
      "expression": "http.request.uri.query contains \"union select\" or http.request.uri.query contains \"drop table\"",
      "action": "block"
    },
    {
      "name": "Block XSS Attempts",
      "expression": "http.request.uri contains \"<script\" or http.request.body contains \"javascript:\"",
      "action": "challenge"
    },
    {
      "name": "Rate Limit by IP",
      "expression": "rate(60) > 100",
      "action": "block"
    }
  ]
}
```

#### 5.2 Cloudflare 集成（推荐）
- DDoS 防护
- Bot 管理
- 挑战页面
- 自定义规则

### 6. **API 安全头部**

```typescript
// 安全响应头中间件
export function securityHeaders(response: Response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Content-Security-Policy', 'default-src \'self\'');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  return response;
}
```

### 7. **监控和告警系统**

#### 7.1 实时监控指标
- 每分钟请求数 (RPM)
- 错误率
- 响应时间
- 异常流量模式

#### 7.2 自动告警规则
```typescript
const alertRules = {
  // 流量突增
  trafficSpike: {
    threshold: 10000, // RPM
    duration: 5, // 分钟
    action: 'email + slack'
  },

  // 错误率过高
  errorRate: {
    threshold: 0.05, // 5%
    duration: 10, // 分钟
    action: 'pagerduty'
  },

  // 特定国家异常流量
  geoAnomaly: {
    countries: ['IE'], // 爱尔兰
    threshold: 1000, // RPM
    action: 'block + alert'
  }
};
```

### 8. **缓存策略**

#### 8.1 CDN 缓存
- 静态资源长期缓存
- API 响应短期缓存
- 地理分布式缓存

#### 8.2 应用层缓存
```typescript
// Redis 缓存热点数据
const cacheStrategy = {
  // 产品信息缓存30分钟
  products: { ttl: 1800 },

  // 用户会话缓存
  sessions: { ttl: 900 },

  // API 响应缓存
  apiResponses: { ttl: 60 }
};
```

### 9. **错误处理和信息泄露防护**

```typescript
// 统一错误处理，避免信息泄露
export function sanitizeError(error: Error, isDevelopment: boolean) {
  if (isDevelopment) {
    return {
      message: error.message,
      stack: error.stack
    };
  }

  // 生产环境：通用错误信息
  return {
    message: 'An error occurred',
    code: 'INTERNAL_ERROR',
    id: generateErrorId() // 用于日志追踪
  };
}
```

### 10. **日志和审计**

#### 10.1 详细日志记录
```typescript
type SecurityLog = {
  timestamp: Date;
  ip: string;
  country: string;
  userAgent: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  suspicious: boolean;
};
```

#### 10.2 审计追踪
- 所有管理员操作
- 支付相关操作
- 用户数据访问
- API 密钥使用

## 🚀 实施优先级

### Phase 1: 立即实施（1-2天）
1. ✅ API 速率限制
2. ✅ 安全响应头
3. ✅ 基础 IP 过滤
4. ✅ 错误信息净化

### Phase 2: 短期实施（1周）
1. ⏳ WAF 规则配置
2. ⏳ 请求签名验证
3. ⏳ 监控告警系统
4. ⏳ 地理围栏

### Phase 3: 中期实施（2-4周）
1. 📅 Cloudflare 集成
2. 📅 高级 Bot 检测
3. 📅 API 网关
4. 📅 分布式缓存

## 📊 性能影响评估

| 安全措施 | 性能影响 | 缓解策略 |
|---------|---------|---------|
| 速率限制 | 低 (<5ms) | Redis 缓存 |
| 签名验证 | 中 (10-20ms) | 异步验证 |
| 地理过滤 | 低 (<5ms) | Edge 计算 |
| WAF 规则 | 低 (<10ms) | CDN 集成 |

## 🔍 监控指标

### 关键安全指标 (KSI)
1. **攻击拦截率**: >99%
2. **误报率**: <0.1%
3. **API 可用性**: >99.9%
4. **平均响应时间**: <200ms

### 实时仪表板
- 全球流量热图
- 攻击类型分布
- API 使用统计
- 异常行为检测

## 💰 成本考虑

### 基础方案（当前）
- Vercel Pro: $20/月
- 基础 DDoS 防护
- 有限的 WAF 规则

### 推荐方案
- Vercel Enterprise: 定制价格
- Cloudflare Pro: $20/月
- Redis Cloud: $50/月
- 监控服务: $30/月
- **总计**: ~$100-200/月

### 企业方案
- Cloudflare Enterprise
- 专属 WAF
- 24/7 SOC 支持
- **总计**: $1000+/月

## 🎯 下一步行动

1. **立即行动**：
   - 实施基础速率限制
   - 配置安全头部
   - 启用详细日志

2. **本周完成**：
   - 评估 Cloudflare 集成
   - 设置监控告警
   - 制定应急预案

3. **长期规划**：
   - 定期安全审计
   - 渗透测试
   - 员工安全培训

---

**记住**：安全是一个持续的过程，而不是一次性的任务。定期审查和更新安全措施至关重要。
