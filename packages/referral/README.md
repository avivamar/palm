# @rolitt/referral

为 Rolitt AI 伴侣打造的极简、可插拔推荐系统。遵循奥卡姆剃刀原理：少即是多。

## 🎯 核心理念

- **仅 3 个函数**：`generateLink()`、`setCookieHeader()`、`calculateReward()`
- **零依赖**：仅需 3 个对等依赖（React、React-DOM、TypeScript）
- **完全可选**：可启用/禁用而不影响核心系统
- **管理员可配置**：所有设置通过管理面板，无需代码更改

## 🚀 快速开始

```typescript
import { ReferralMVP } from '@rolitt/referral';

// 生成推荐链接
const link = ReferralMVP.generateLink('user123');
// 结果: "https://rolitt.com?ref=dXNlcjEyMw=="

// 在推荐点击时设置 Cookie
const cookieHeader = ReferralMVP.setCookieHeader('dXNlcjEyMw==', 30);
// 结果: "ref=dXNlcjEyMw==; Max-Age=2592000; HttpOnly; SameSite=Lax; Path=/"

// 计算奖励
const reward = await ReferralMVP.calculateReward('dXNlcjEyMw==', 10000, config);
// 结果: { referralCode: '...', discountAmount: 2000, referrerReward: 1000, type: 'percentage' }
```

## 📦 包结构

```
src/
├── index.ts           # 主要导出
├── mvp.ts            # 核心 3 个函数
├── admin/            # 管理面板组件
├── components/       # 用户界面组件
└── types.ts          # TypeScript 类型定义
```

## 🔧 配置

所有配置通过管理面板完成：

```typescript
type ReferralConfig = {
  enabled: boolean; // 启用/禁用系统
  rewardType: 'percentage' | 'fixed'; // 奖励计算类型
  rewardValue: number; // 奖励金额（百分比或固定值）
  cookieDays: number; // Cookie 过期天数
};
```

## 🎨 组件

### 管理组件
- `ReferralConfig` - 配置面板
- `ReferralStats` - 统计仪表板

### 用户组件
- `ReferralDashboard` - 用户推荐面板
- `ShareButtons` - 社交分享按钮

## 🔗 集成

### 最小集成（可选）
```typescript
// 在你的页面组件中
import { ReferralMVP } from '@rolitt/referral';

// 检查推荐参数
if (searchParams?.ref) {
  // 设置 Cookie 进行跟踪
  const cookieHeader = ReferralMVP.setCookieHeader(searchParams.ref);
  // 应用到响应
}
```

### 完整集成
```typescript
// 在结账流程中
const reward = await ReferralMVP.calculateReward(referralCode, amount, config);
if (reward) {
  // 应用折扣
  discounts: [{ amount_off: reward.discountAmount }];
}
```

## 📊 数据库架构

扩展现有的 `referrals` 表：

```sql
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS
  referral_code VARCHAR(255),
  referrer_user_id INTEGER REFERENCES users(id),
  referred_user_id INTEGER REFERENCES users(id),
  reward_amount INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending';
```

## ✅ 功能特性

- ✅ **可插拔**：可完全移除而不影响系统
- ✅ **可配置**：管理面板配置
- ✅ **安全**：Base64 编码，服务端验证
- ✅ **高性能**：< 50KB 包大小，< 100ms 操作
- ✅ **移动友好**：响应式设计，PWA 分享支持
- ✅ **国际化**：多语言支持

## 🧪 测试

```bash
npm run test          # 单元测试
npm run test:e2e      # 端到端测试
npm run type-check    # TypeScript 验证
```

## 📈 指标

系统跟踪：
- 推荐链接点击量
- 转化率
- 分发的奖励金额
- 系统使用统计

## 🛡️ 安全

- 推荐码是 base64 编码的用户 ID
- 所有奖励计算在服务端进行
- 管理配置需要身份验证
- Cookie 安全：HttpOnly、SameSite=Lax

## 🚀 性能

- 包大小：< 50KB 编译后
- 链接生成：< 100ms
- Cookie 操作：< 10ms
- 奖励计算：< 50ms

## 📱 社交分享

支持：
- Twitter/X 分享
- Facebook 分享
- WhatsApp 分享
- Instagram 故事
- 原生 Web Share API

## 🔄 迁移

此包设计为：
- **非破坏性**：现有系统继续工作
- **可逆**：可完全移除
- **渐进式**：逐步启用功能

## 📚 API 参考

### ReferralMVP.generateLink(userId, baseUrl?)
为给定用户生成推荐链接。

### ReferralMVP.setCookieHeader(ref, days?)
创建用于推荐跟踪的 Cookie 头字符串。

### ReferralMVP.calculateReward(code, amount, config)
根据配置计算折扣和推荐人奖励。

---

**用 ❤️ 为 Rolitt AI 伴侣构建**
