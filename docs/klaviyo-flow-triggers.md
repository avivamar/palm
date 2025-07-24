# Klaviyo Flow 自动触发条件配置

本文档详细说明了 Rolitt 项目中 Klaviyo Flow 的自动触发条件配置，包括预售流程的各个阶段。

## Flow 概览

### 1. 预售开始 Flow (Preorder Started Flow)

**目的**: 当用户开始预售但尚未完成支付时，发送确认邮件和后续提醒

**触发事件**: `Rolitt Preorder Started`

#### 触发条件配置

```json
{
  "trigger": {
    "type": "event",
    "event_name": "Rolitt Preorder Started",
    "conditions": {
      "all": [
        {
          "field": "event.properties.preorder_id",
          "operator": "exists"
        },
        {
          "field": "event.properties.color",
          "operator": "exists"
        },
        {
          "field": "person.email",
          "operator": "is_set"
        }
      ]
    }
  },
  "flow_filters": {
    "all": [
      {
        "field": "event.properties.source",
        "operator": "equals",
        "value": "Stripe Checkout"
      }
    ]
  }
}
```

#### Flow 步骤

1. **立即发送**: 预售确认邮件
   - **延迟**: 0 分钟
   - **模板**: "Rolitt 预售确认 - 完成支付"
   - **个性化变量**:
     - `{{ event.properties.color }}` - 选择的颜色
     - `{{ event.properties.preorder_number }}` - 预售订单号
     - `{{ event.properties.locale }}` - 用户语言

2. **第一次提醒**: 支付提醒邮件
   - **延迟**: 30 分钟
   - **条件**: 如果用户尚未触发 "Rolitt Preorder Success" 事件
   - **模板**: "完成您的 Rolitt 预售订单"

3. **第二次提醒**: 最后机会邮件
   - **延迟**: 24 小时
   - **条件**: 如果用户尚未触发 "Rolitt Preorder Success" 事件
   - **模板**: "最后机会 - Rolitt 预售即将结束"

### 2. 预售成功 Flow (Preorder Success Flow)

**目的**: 当用户完成预售支付时，发送确认邮件和后续营销内容

**触发事件**: `Rolitt Preorder Success`

#### 触发条件配置

```json
{
  "trigger": {
    "type": "event",
    "event_name": "Rolitt Preorder Success",
    "conditions": {
      "all": [
        {
          "field": "event.properties.preorder_id",
          "operator": "exists"
        },
        {
          "field": "event.properties.amount",
          "operator": "greater_than",
          "value": 0
        },
        {
          "field": "event.properties.currency",
          "operator": "exists"
        },
        {
          "field": "person.email",
          "operator": "is_set"
        }
      ]
    }
  },
  "flow_filters": {
    "all": [
      {
        "field": "event.properties.source",
        "operator": "equals",
        "value": "Stripe Webhook"
      }
    ]
  }
}
```

#### Flow 步骤

1. **立即发送**: 支付成功确认邮件
   - **延迟**: 0 分钟
   - **模板**: "Rolitt 预售成功 - 支付确认"
   - **个性化变量**:
     - `{{ event.properties.color }}` - 选择的颜色
     - `{{ event.properties.preorder_number }}` - 预售订单号
     - `{{ event.properties.amount }}` - 支付金额
     - `{{ event.properties.currency }}` - 货币
     - `{{ event.properties.locale }}` - 用户语言

2. **产品更新**: 生产进度邮件
   - **延迟**: 7 天
   - **模板**: "您的 Rolitt 产品生产进度更新"

3. **发货通知**: 发货提醒邮件
   - **延迟**: 30 天（根据实际生产周期调整）
   - **模板**: "您的 Rolitt 产品即将发货"

4. **交叉销售**: 相关产品推荐
   - **延迟**: 60 天
   - **模板**: "探索更多 Rolitt 产品"

### 3. 预售失败 Flow (Preorder Failed Flow)

**目的**: 当预售支付失败时，发送支持邮件和重试引导

**触发事件**: `Rolitt Preorder Failed`

#### 触发条件配置

```json
{
  "trigger": {
    "type": "event",
    "event_name": "Rolitt Preorder Failed",
    "conditions": {
      "all": [
        {
          "field": "event.properties.preorder_id",
          "operator": "exists"
        },
        {
          "field": "event.properties.error_reason",
          "operator": "exists"
        },
        {
          "field": "person.email",
          "operator": "is_set"
        }
      ]
    }
  }
}
```

#### Flow 步骤

1. **立即发送**: 支付失败通知
   - **延迟**: 0 分钟
   - **模板**: "Rolitt 预售支付遇到问题"
   - **个性化变量**:
     - `{{ event.properties.color }}` - 选择的颜色
     - `{{ event.properties.error_reason }}` - 失败原因

2. **重试引导**: 重新尝试支付
   - **延迟**: 2 小时
   - **模板**: "重新完成您的 Rolitt 预售"

## Segment 自动创建配置

### 1. 预售客户 Segment

**名称**: "Rolitt 预售客户"

**条件**:
```json
{
  "definition": {
    "all": [
      {
        "field": "event.name",
        "operator": "equals",
        "value": "Rolitt Preorder Started"
      },
      {
        "field": "event.timestamp",
        "operator": "in_the_last",
        "value": 90,
        "unit": "days"
      }
    ]
  }
}
```

### 2. 成功预售客户 Segment

**名称**: "Rolitt 成功预售客户"

**条件**:
```json
{
  "definition": {
    "all": [
      {
        "field": "event.name",
        "operator": "equals",
        "value": "Rolitt Preorder Success"
      },
      {
        "field": "event.timestamp",
        "operator": "in_the_last",
        "value": 365,
        "unit": "days"
      }
    ]
  }
}
```

### 3. 颜色偏好 Segments

#### Khaki 偏好客户
```json
{
  "name": "Rolitt Khaki 偏好客户",
  "definition": {
    "all": [
      {
        "field": "event.name",
        "operator": "equals",
        "value": "Rolitt Preorder Success"
      },
      {
        "field": "event.properties.color",
        "operator": "equals",
        "value": "khaki"
      }
    ]
  }
}
```

#### Black 偏好客户
```json
{
  "name": "Rolitt Black 偏好客户",
  "definition": {
    "all": [
      {
        "field": "event.name",
        "operator": "equals",
        "value": "Rolitt Preorder Success"
      },
      {
        "field": "event.properties.color",
        "operator": "equals",
        "value": "black"
      }
    ]
  }
}
```

### 4. 地区 Segments

#### 香港客户
```json
{
  "name": "Rolitt 香港客户",
  "definition": {
    "all": [
      {
        "field": "event.name",
        "operator": "equals",
        "value": "Rolitt Preorder Success"
      },
      {
        "field": "event.properties.locale",
        "operator": "equals",
        "value": "zh-HK"
      }
    ]
  }
}
```

#### 大陆客户
```json
{
  "name": "Rolitt 大陆客户",
  "definition": {
    "all": [
      {
        "field": "event.name",
        "operator": "equals",
        "value": "Rolitt Preorder Success"
      },
      {
        "field": "event.properties.locale",
        "operator": "equals",
        "value": "zh-CN"
      }
    ]
  }
}
```

## 高级 Flow 配置

### 1. 智能时间发送

```json
{
  "smart_send_time": {
    "enabled": true,
    "timezone_based": true,
    "optimal_hours": [9, 10, 11, 14, 15, 16, 19, 20],
    "avoid_weekends": false
  }
}
```

### 2. A/B 测试配置

```json
{
  "ab_test": {
    "enabled": true,
    "variants": [
      {
        "name": "Variant A - 标准模板",
        "percentage": 50,
        "template_id": "template_a"
      },
      {
        "name": "Variant B - 个性化模板",
        "percentage": 50,
        "template_id": "template_b"
      }
    ],
    "metric": "open_rate"
  }
}
```

### 3. 动态内容配置

```json
{
  "dynamic_content": {
    "color_specific": {
      "khaki": {
        "image_url": "https://example.com/khaki-product.jpg",
        "description": "经典卡其色，适合日常搭配"
      },
      "black": {
        "image_url": "https://example.com/black-product.jpg",
        "description": "经典黑色，百搭时尚"
      }
    },
    "locale_specific": {
      "zh-HK": {
        "currency_symbol": "HK$",
        "shipping_info": "香港地區免費送貨"
      },
      "zh-CN": {
        "currency_symbol": "¥",
        "shipping_info": "中国大陆包邮"
      },
      "en": {
        "currency_symbol": "$",
        "shipping_info": "Free shipping worldwide"
      }
    }
  }
}
```

## 实施步骤

### 1. 在 Klaviyo 后台创建 Flow

1. 登录 Klaviyo 后台
2. 导航到 "Flows" 页面
3. 点击 "Create Flow"
4. 选择 "Metric Triggered Flow"
5. 配置触发事件和条件

### 2. 设置邮件模板

1. 创建邮件模板
2. 添加个性化变量
3. 设置多语言版本
4. 测试模板渲染

### 3. 配置 Segments

1. 导航到 "Lists & Segments"
2. 创建新的 Segment
3. 设置筛选条件
4. 测试 Segment 逻辑

### 4. 测试和监控

1. 使用测试事件验证 Flow 触发
2. 检查邮件发送状态
3. 监控打开率和点击率
4. 根据数据优化 Flow

## 监控和优化

### 关键指标

- **Flow 触发率**: 事件触发 Flow 的成功率
- **邮件送达率**: 邮件成功送达的比例
- **打开率**: 邮件被打开的比例
- **点击率**: 邮件中链接被点击的比例
- **转化率**: Flow 带来的实际转化

### 优化建议

1. **个性化内容**: 根据用户偏好定制邮件内容
2. **发送时间优化**: 分析用户活跃时间，优化发送时机
3. **A/B 测试**: 持续测试不同的邮件模板和内容
4. **Segment 细分**: 创建更精准的用户群体
5. **跨渠道整合**: 结合 SMS、推送通知等多渠道营销

## 相关文档

- [Klaviyo Flow 文档](https://help.klaviyo.com/hc/en-us/sections/115005078647-Flows)
- [Klaviyo Segment 文档](https://help.klaviyo.com/hc/en-us/sections/115005078667-Segments)
- [Klaviyo 个性化文档](https://help.klaviyo.com/hc/en-us/sections/115005078687-Personalization)
