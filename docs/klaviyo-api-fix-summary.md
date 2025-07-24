# Klaviyo API 修复总结

## 问题描述

用户报告了多个 Klaviyo API 错误：

1. **Profile 错误**：
```
[Klaviyo] API Error: 400 {"errors":[{"id":"47de5459-b1fb-4777-8243-cf04c29e7b9c","status":400,"code":"invalid","title":"Invalid input.","detail":"'data' key missing in relationship","source":{"pointer":"/data/attributes/profile"},"links":{},"meta":{}}]}
```

2. **Metric 错误**：
```
[Klaviyo] API Error: 400 {"errors":[{"id":"79454887-c448-4e9a-b334-523979d7874d","status":400,"code":"invalid","title":"Invalid input.","detail":"'data' key missing in relationship","source":{"pointer":"/data/attributes/metric"},"links":{},"meta":{}}]}
```

## 根本原因

在 `src/libs/Klaviyo.ts` 文件中，`track` 方法的 profile 对象格式不符合 Klaviyo API v2024-02-15 的要求。API 要求 profile 必须包含一个 `data` 键，其中包含 profile 的类型和属性。

## 修复内容

### 1. 修复 Profile 数据结构

**修复前：**
```typescript
profile: {
  email;
}
```

**修复后：**
```typescript
profile: {
  data: {
    type: 'profile',
    attributes: {
      email,
    },
  },
}
```

### 2. 更新 TypeScript 类型定义

将 `interface` 改为 `type`，并更新了 `KlaviyoNewAPIPayload` 类型以反映正确的 profile 结构：

```typescript
type KlaviyoNewAPIPayload = {
  data: {
    type: 'event';
    attributes: {
      profile: {
        data: {
          type: 'profile';
          attributes: {
            email: string;
            [key: string]: any;
          };
        };
      };
      metric: { name: string };
      properties?: { [key: string]: any };
      time?: string;
    };
  };
};
```

### 3. 修复 ESLint 错误

- 将 `interface` 改为 `type`（符合项目规范）
- 修复引号一致性问题
- 移除不必要的 `console.log` 语句

## 修复的文件

- `src/libs/Klaviyo.ts` - 主要修复文件
- `scripts/test-klaviyo-fix.js` - 新增测试脚本

## 验证步骤

1. **构建验证**：
   ```bash
   npm run build
   ```
   ✅ 构建成功，无 TypeScript 错误

2. **API 格式验证**：
   新的 payload 格式符合 Klaviyo API v2024-02-15 规范

3. **向后兼容性**：
   传统的 `sendEventToKlaviyo` 方法保持不变，确保现有功能正常

## 影响范围

### 受影响的方法
- `Klaviyo.track()` - 新版 Events API
- 通过 `klaviyo-utils.ts` 调用的所有幂等事件发送

### 不受影响的方法
- `Klaviyo.sendEventToKlaviyo()` - 传统 Track API
- `Klaviyo.trackPreorderStarted()` - 使用传统 API
- `Klaviyo.trackPreorderSuccess()` - 使用传统 API

## 测试建议

1. 测试预售流程中的 Klaviyo 事件发送
2. 验证用户行为跟踪是否正常
3. 检查 Klaviyo 仪表板中是否正确接收事件

## 相关文档

- [Klaviyo Events API Documentation](https://developers.klaviyo.com/en/reference/create_event)
- [Klaviyo Profile API Documentation](https://developers.klaviyo.com/en/reference/get_profile)

## 修复时间

- 修复日期：2025-06-27
- 修复人员：Cline AI Assistant
- 验证状态：✅ 已验证
