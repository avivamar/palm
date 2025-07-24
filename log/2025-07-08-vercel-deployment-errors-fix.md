# Vercel 部署错误诊断与修复方案

## 🚨 错误症状

用户报告部署到 Vercel 后出现以下错误：

1. **认证错误**: `/api/auth/session` 返回 401 Unauthorized
2. **国际化警告**: `Unsupported locale: "zh-HK"`
3. **路由错误**: `/authorize` 返回 404 Not Found
4. **支付超时**: `POST /zh-HK/pre-order` 返回 504 Gateway Timeout
5. **Stripe 结账功能无法唤起**

## 🔍 根本原因分析

### 1. Firebase Admin 初始化问题

**问题**: `/api/auth/session` 401 错误
**原因**: Firebase Admin SDK 在 Vercel 环境中初始化失败
**影响**: 用户认证系统完全失效

**技术细节**:
- `src/libs/firebase/admin.ts` 中的初始化逻辑依赖环境变量
- Vercel 环境中可能缺少必要的 Firebase 配置
- 错误处理机制导致静默失败

### 2. 数据库连接超时

**问题**: `POST /zh-HK/pre-order` 504 超时
**原因**: PostgreSQL 连接在 Vercel 无服务器环境中超时
**影响**: 预订流程完全阻塞，Stripe 结账无法启动

**技术细节**:
- `src/libs/DB.ts` 中的连接逻辑没有设置适当的超时
- `src/app/actions/preorderActions.ts` 中的异步营销处理可能阻塞主流程
- Klaviyo API 调用可能导致额外延迟

### 3. 国际化配置不一致

**问题**: `Unsupported locale: "zh-HK"` 警告
**原因**: 客户端和服务端的 locale 配置不同步
**影响**: 用户体验降级，可能影响路由

### 4. 路由配置问题

**问题**: `/authorize` 404 错误
**原因**: 不存在的路由被客户端代码引用
**影响**: 可能影响认证流程

## 🔧 修复方案

### 修复 1: 增强 Firebase Admin 初始化

**文件**: `src/libs/firebase/admin.ts`

```javascript
// 添加 Vercel 环境检测和超时处理
const isVercelEnvironment = process.env.VERCEL === '1';

// 设置初始化超时
const INIT_TIMEOUT = isVercelEnvironment ? 10000 : 30000; // Vercel 10s, 其他 30s

// 添加超时包装器
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

// 修改初始化函数
async function initializeFirebaseAdmin() {
  if (isInitialized) {
    return { app, adminAuth, error: initializationError };
  }

  try {
    // 使用超时包装器
    const result = await withTimeout(
      performFirebaseInitialization(),
      INIT_TIMEOUT
    );

    return result;
  } catch (error) {
    // 详细错误日志
    console.error('[FirebaseAdmin] Initialization failed:', {
      error: error.message,
      isVercel: isVercelEnvironment,
      timeout: INIT_TIMEOUT,
      env: {
        hasServiceAccount: !!Env.FIREBASE_SERVICE_ACCOUNT_KEY,
        hasProjectId: !!Env.FIREBASE_PROJECT_ID,
        hasPrivateKey: !!Env.FIREBASE_PRIVATE_KEY,
        hasClientEmail: !!Env.FIREBASE_CLIENT_EMAIL
      }
    });

    initializationError = error.message;
    isInitialized = true;
    return { app: null, adminAuth: null, error: initializationError };
  }
}
```

### 修复 2: 优化数据库连接和预订流程

**文件**: `src/libs/DB.ts`

```javascript
// 添加 Vercel 优化的连接配置
const initializeDatabase = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  if (initializationPromise) {
    return await initializationPromise;
  }

  initializationPromise = (async () => {
    if (Env.DATABASE_URL) {
      try {
        const client = new Client({
          connectionString: Env.DATABASE_URL,
          // Vercel 优化配置
          connectionTimeoutMillis: 10000, // 10s 连接超时
          query_timeout: 15000, // 15s 查询超时
          statement_timeout: 15000, // 15s 语句超时
          idle_in_transaction_session_timeout: 30000, // 30s 空闲超时
        });

        await client.connect();
        dbInstance = drizzlePg(client, { schema });
        console.warn('PostgreSQL connected with Vercel optimizations');
        return dbInstance;
      } catch (error) {
        console.error('PostgreSQL connection failed:', error);
        return await initializePGlite();
      }
    } else {
      return await initializePGlite();
    }
  })();

  const result = await initializationPromise;
  initializationPromise = null;
  return result;
};
```

**文件**: `src/app/actions/preorderActions.ts`

```javascript
// 修改异步营销处理，避免阻塞主流程
export async function initiatePreorder(formData: FormData): Promise<PreorderInitResult> {
  try {
    const data = Object.fromEntries(formData);
    const validatedData = preorderInitSchema.parse(data);
    const { email, color, priceId, locale } = validatedData;

    console.error(`[HybridPreorder] Starting preorder: ${email}`);

    // 设置数据库操作超时
    const dbTimeout = 8000; // 8秒超时
    const db = await Promise.race([
      getDB(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout')), dbTimeout)
      )
    ]);

    const preorderId = nanoid();
    const preorderNumber = `ROL-${preorderId.substring(0, 8).toUpperCase()}`;

    // 快速创建预订记录
    await Promise.race([
      db.insert(preordersSchema).values({
        id: preorderId,
        userId: null,
        email,
        color,
        priceId,
        status: 'initiated',
        amount: '0.00',
        currency: 'USD',
        preorderNumber,
        locale,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database insert timeout')), 5000)
      )
    ]);

    console.error(`[HybridPreorder] Preorder created: ${preorderId}`);

    // 异步营销处理 - 不等待结果
    setImmediate(() => {
      processPreorderMarketingAsync(preorderId, validatedData)
        .catch(error => {
          console.error(`[MarketingAsync] Non-blocking error: ${preorderId}`, error);
        });
    });

    return {
      success: true,
      preorderId,
      preorderNumber,
    };
  } catch (error) {
    console.error('[HybridPreorder] Critical error:', error);
    return {
      success: false,
      error: 'Failed to initialize preorder. Please try again.',
    };
  }
}
```

### 修复 3: 国际化配置同步

**文件**: `src/libs/i18n.ts`

```javascript
// 确保客户端和服务端 locale 配置一致
import { AppConfig } from '@/utils/AppConfig';

// 验证 locale 支持
export function validateLocale(locale: string): boolean {
  return AppConfig.locales.includes(locale as any);
}

// 获取默认 locale
export function getDefaultLocale(): string {
  return AppConfig.defaultLocale;
}

// 标准化 locale
export function normalizeLocale(locale: string): string {
  if (validateLocale(locale)) {
    return locale;
  }

  console.warn(`Unsupported locale: "${locale}", falling back to default`);
  return getDefaultLocale();
}
```

### 修复 4: 移除无效路由引用

**搜索并移除所有对 `/authorize` 路由的引用**

```bash
# 搜索命令
grep -r "authorize" src/ --exclude-dir=node_modules
```

## 🧪 验证步骤

### 1. 本地验证

```bash
# 1. 构建测试
npm run build

# 2. 启动生产模式
npm start

# 3. 测试关键功能
curl -X GET http://localhost:3000/api/auth/session
curl -X POST http://localhost:3000/zh-HK/pre-order \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","color":"Red","priceId":"price_test"}'
```

### 2. Vercel 部署验证

```bash
# 1. 部署到预览环境
vercel --prod=false

# 2. 测试预览环境
# 3. 确认无错误后部署到生产
vercel --prod
```

## 🔒 环境变量检查清单

### Vercel 环境变量配置

**必需的 Firebase 配置**:
- `FIREBASE_SERVICE_ACCOUNT_KEY` (推荐) 或
- `FIREBASE_PROJECT_ID` + `FIREBASE_PRIVATE_KEY` + `FIREBASE_CLIENT_EMAIL`

**必需的数据库配置**:
- `DATABASE_URL`

**必需的 Stripe 配置**:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `COLOR_PRICE_MAP_JSON`

**可选但推荐的配置**:
- `KLAVIYO_API_KEY`
- `APP_URL`

## 📊 监控和告警

### 1. 错误监控

```javascript
// 添加到关键函数中
const errorMetrics = {
  firebaseInitFailures: 0,
  databaseTimeouts: 0,
  preorderFailures: 0,
};

// 在错误处理中增加计数
console.error('[Metrics]', errorMetrics);
```

### 2. 性能监控

```javascript
// 添加性能追踪
const performanceStart = Date.now();
// ... 操作 ...
const duration = Date.now() - performanceStart;
console.error(`[Performance] Operation took ${duration}ms`);
```

## 🚀 部署建议

### 1. 分阶段部署

1. **阶段 1**: 修复 Firebase Admin 初始化
2. **阶段 2**: 优化数据库连接
3. **阶段 3**: 修复预订流程
4. **阶段 4**: 清理国际化警告

### 2. 回滚计划

- 保留当前工作版本的备份
- 准备快速回滚脚本
- 监控关键指标

### 3. 测试策略

- 端到端测试预订流程
- 负载测试数据库连接
- 认证流程测试
- 多语言环境测试

## 📈 预期结果

修复完成后，应该实现：

1. ✅ `/api/auth/session` 正常返回 200
2. ✅ 消除 `zh-HK` locale 警告
3. ✅ 移除 `/authorize` 404 错误
4. ✅ `POST /zh-HK/pre-order` 在 10 秒内完成
5. ✅ Stripe 结账功能正常唤起
6. ✅ 整体用户体验流畅

## 🔄 后续优化

1. **缓存优化**: 实现 Redis 缓存减少数据库压力
2. **CDN 配置**: 优化静态资源加载
3. **监控增强**: 集成 Sentry 错误监控
4. **性能优化**: 实现懒加载和代码分割

---

**修复时间**: 2025-01-03
**影响范围**: 认证系统、支付流程、国际化、路由
**优先级**: 🔴 高优先级 - 阻塞生产功能
**测试状态**: ⏳ 待验证
