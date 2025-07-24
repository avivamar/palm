# 分析工具集成系统

基于 Google 最佳实践的 Next.js 分析工具集成解决方案，遵循性能优化和用户体验最佳实践。

## 🏗️ 架构设计

### 组件结构

```
src/components/analytics/
├── AnalyticsProvider.tsx      # 统一提供者组件
├── services/                  # 分析服务组件
│   ├── GoogleAnalytics.tsx    # Google Analytics (afterInteractive)
│   ├── MetaPixel.tsx          # Meta Pixel (lazyOnload)
│   ├── ClarityService.tsx     # Microsoft Clarity (afterInteractive)
│   ├── TikTokPixel.tsx        # TikTok Pixel (lazyOnload)
│   └── KlaviyoService.tsx     # Klaviyo (条件加载)
├── hooks/                     # 分析 Hooks
│   ├── useAnalytics.ts        # 统一分析接口
│   └── useTracking.ts         # 自动追踪功能
├── types/                     # 类型定义
│   └── analytics.ts           # 分析相关类型
└── README.md                  # 使用文档
```

### 加载策略

根据 Next.js Script 组件的三种策略进行分类：

1. **beforeInteractive**: 关键脚本，页面交互前执行
   - 用于必须在页面交互前加载的关键脚本
   - 例如：polyfills、关键的第三方库

2. **afterInteractive** (默认): 页面交互后执行
   - 用于重要但非阻塞的分析脚本
   - 例如：Google Analytics、Microsoft Clarity

3. **lazyOnload**: 延迟加载，适用于非关键脚本
   - 用于营销和转化追踪脚本，延迟3秒加载
   - 例如：Meta Pixel、TikTok Pixel、Klaviyo

## 🚀 快速开始

### 1. 环境变量配置

在 `.env.local` 文件中添加以下环境变量：

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Meta Pixel
NEXT_PUBLIC_META_PIXEL_ID=123456789012345

# Microsoft Clarity
NEXT_PUBLIC_CLARITY_PROJECT_ID=abcdefghij

# TikTok Pixel
NEXT_PUBLIC_TIKTOK_PIXEL_ID=C4A1B2C3D4E5F6G7H8I9J0

# Klaviyo
# 客户端公共密钥（6位字符的Company ID，用于前端脚本）
NEXT_PUBLIC_KLAVIYO_COMPANY_ID=ABC123
# 服务端私有API密钥（用于服务端API调用）
KLAVIYO_API_KEY=pk_your_private_api_key_here
# 邮件列表ID
KLAVIYO_LIST_ID=your_list_id_here
```

### 2. 在布局中集成

在 `app/[locale]/layout.tsx` 中添加 `AnalyticsProvider`：

```tsx
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <AnalyticsProvider />
      </body>
    </html>
  );
}
```

### 3. 在组件中使用

```tsx
import { useAnalytics } from '@/components/analytics/hooks/useAnalytics';
import { useTracking } from '@/components/analytics/hooks/useTracking';

function MyComponent() {
  const { trackEvent, trackPurchase, trackButtonClick } = useAnalytics();
  const { enableAllTracking } = useTracking();

  // 启用自动追踪
  useEffect(() => {
    const cleanup = enableAllTracking();
    return cleanup;
  }, [enableAllTracking]);

  // 手动追踪事件
  const handleClick = () => {
    trackButtonClick('cta-button', 'hero-section');
  };

  return <button onClick={handleClick}>点击我</button>;
}
```

## 📊 可用的追踪功能

### 自动追踪

- **页面浏览**: 自动追踪路由变化
- **滚动深度**: 追踪 25%, 50%, 75%, 90%, 100% 滚动深度
- **页面停留时间**: 追踪 30s, 1m, 2m, 5m 停留时间
- **链接点击**: 自动追踪所有链接点击
- **按钮点击**: 自动追踪按钮和可点击元素
- **表单交互**: 追踪表单开始和提交事件

### 手动追踪

```tsx
// 基础事件追踪
trackEvent({
  name: 'custom_event',
  parameters: {
    category: 'user_interaction',
    action: 'click'
  }
});

// 电商事件追踪
trackPurchase('order-123', 99.99, 'USD', [
  {
    item_id: 'product-001',
    item_name: 'Product Name',
    category: 'Electronics',
    quantity: 1,
    price: 99.99
  }
]);

// 转化事件追踪
trackAddToCart('product-001', 'Product Name', 99.99, 'USD');

// 媒体事件追踪
trackVideoPlay('Product Demo Video', 120);

// 表单事件追踪
trackFormSubmit('newsletter-signup', true);
```

## 🔧 高级配置

### 条件加载

Klaviyo 服务支持基于用户同意的条件加载：

```tsx
// 用户同意营销 cookies 后才加载
localStorage.setItem('marketing-consent', 'true');

// 或在特定页面自动加载
// /newsletter, /subscribe 页面会自动加载
```

### 错误处理

所有分析服务都包含错误处理和降级方案：

```tsx
// 服务会自动处理加载失败的情况
// 并在控制台输出警告信息
if (!pixelId) {
  console.warn('Analytics: Pixel ID is not provided');
  return null;
}
```

### 调试模式

在开发环境中启用调试模式：

```bash
NEXT_PUBLIC_DEBUG_ANALYTICS=true
```

## 🎯 最佳实践

### 1. 性能优化

- ✅ 使用 Next.js Script 组件
- ✅ 根据重要性选择正确的加载策略
- ✅ 非关键脚本延迟3秒加载
- ✅ 使用动态导入和条件加载
- ✅ 避免阻塞主线程

### 2. 用户体验

- ✅ 尊重用户的 cookie 偏好
- ✅ 提供清晰的隐私政策
- ✅ 支持用户选择退出
- ✅ 最小化数据收集

### 3. 开发体验

- ✅ 统一的 API 接口
- ✅ TypeScript 类型安全
- ✅ 完整的错误处理
- ✅ 详细的文档和示例

### 4. 监控和维护

- ✅ 定期检查 Core Web Vitals
- ✅ 监控脚本加载性能
- ✅ 验证事件追踪准确性
- ✅ 保持依赖项更新

## 🔍 故障排除

### 常见问题

1. **脚本未加载**
   - 检查环境变量是否正确设置
   - 确认网络连接正常
   - 查看浏览器控制台错误信息

2. **事件未追踪**
   - 确认分析工具已正确初始化
   - 检查事件参数格式
   - 验证用户是否同意 cookies

3. **性能问题**
   - 使用 Bundle Analyzer 检查包大小
   - 确认使用了正确的加载策略
   - 检查是否有重复的脚本加载

### 调试工具

```tsx
// 检查分析工具是否已加载
console.log('Google Analytics:', window.gtag);
console.log('Meta Pixel:', window.fbq);
console.log('Clarity:', window.clarity);
console.log('TikTok Pixel:', window.ttq);
console.log('Klaviyo:', window.klaviyo);
```

## 📚 相关资源

- [Next.js Script 组件文档](https://nextjs.org/docs/app/api-reference/components/script)
- [Google Analytics 4 文档](https://developers.google.com/analytics/devguides/collection/ga4)
- [Meta Pixel 文档](https://developers.facebook.com/docs/meta-pixel)
- [Microsoft Clarity 文档](https://docs.microsoft.com/en-us/clarity/)
- [TikTok Pixel 文档](https://ads.tiktok.com/help/article?aid=10000357)
- [Klaviyo 文档](https://developers.klaviyo.com/en/docs)

## 🤝 贡献

如果您发现问题或有改进建议，请创建 Issue 或提交 Pull Request。

## 📄 许可证

本项目采用 MIT 许可证。
