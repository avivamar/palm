# Klaviyo 事件推送结构 JSON Schema

本文档定义了 Rolitt 项目中所有 Klaviyo 事件的标准结构和 JSON Schema。

## 基础事件结构

### KlaviyoEventPayload (传统 Track API)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Klaviyo Event Payload",
  "properties": {
    "event": {
      "type": "string",
      "description": "事件名称",
      "examples": ["Rolitt Preorder Started", "Rolitt Preorder Success"]
    },
    "customer_properties": {
      "type": "object",
      "properties": {
        "$email": {
          "type": "string",
          "format": "email",
          "description": "客户邮箱地址"
        }
      },
      "required": ["$email"],
      "additionalProperties": true
    },
    "properties": {
      "type": "object",
      "description": "事件属性",
      "additionalProperties": true
    },
    "time": {
      "type": "integer",
      "description": "事件时间戳（可选）"
    }
  },
  "required": ["event", "customer_properties"]
}
```

### KlaviyoNewAPIPayload (新版 Events API)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Klaviyo New API Event Payload",
  "properties": {
    "data": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "const": "event"
        },
        "attributes": {
          "type": "object",
          "properties": {
            "metric": {
              "type": "object",
              "properties": {
                "data": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string",
                      "const": "metric"
                    },
                    "attributes": {
                      "type": "object",
                      "properties": {
                        "name": {
                          "type": "string",
                          "description": "事件名称"
                        }
                      },
                      "required": ["name"]
                    }
                  },
                  "required": ["type", "attributes"]
                }
              },
              "required": ["data"]
            },
            "profile": {
              "type": "object",
              "properties": {
                "data": {
                  "type": "object",
                  "properties": {
                    "type": {
                      "type": "string",
                      "const": "profile"
                    },
                    "attributes": {
                      "type": "object",
                      "properties": {
                        "email": {
                          "type": "string",
                          "format": "email"
                        }
                      },
                      "required": ["email"]
                    }
                  },
                  "required": ["type", "attributes"]
                }
              },
              "required": ["data"]
            },
            "properties": {
              "type": "object",
              "additionalProperties": true
            },
            "time": {
              "type": "string",
              "format": "date-time"
            }
          },
          "required": ["metric", "profile"]
        }
      },
      "required": ["type", "attributes"]
    }
  },
  "required": ["data"]
}
```

## Rolitt 预售事件 Schema

### 1. Rolitt Preorder Started

**事件名称**: `Rolitt Preorder Started`

**触发时机**: 用户开始预购流程时

**Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Rolitt Preorder Started Event",
  "properties": {
    "event": {
      "type": "string",
      "const": "Rolitt Preorder Started"
    },
    "customer_properties": {
      "type": "object",
      "properties": {
        "$email": {
          "type": "string",
          "format": "email",
          "description": "客户邮箱"
        }
      },
      "required": ["$email"]
    },
    "properties": {
      "type": "object",
      "properties": {
        "color": {
          "type": "string",
          "description": "选择的颜色",
          "examples": ["khaki", "black", "white"]
        },
        "preorder_id": {
          "type": "string",
          "description": "预购订单ID"
        },
        "preorder_number": {
          "type": "string",
          "description": "预购订单号",
          "pattern": "^ROL-\\d+$",
          "examples": ["ROL-1721463810"]
        },
        "locale": {
          "type": "string",
          "description": "用户语言设置",
          "examples": ["en", "zh-HK", "zh-CN"]
        },
        "source": {
          "type": "string",
          "description": "事件来源",
          "default": "Stripe Checkout",
          "examples": ["Stripe Checkout", "Direct"]
        }
      },
      "required": ["color", "preorder_id"]
    }
  },
  "required": ["event", "customer_properties", "properties"]
}
```

**示例数据**:
```json
{
  "event": "Rolitt Preorder Started",
  "customer_properties": {
    "$email": "user@example.com"
  },
  "properties": {
    "color": "khaki",
    "preorder_id": "abc123def456",
    "preorder_number": "ROL-1721463810",
    "locale": "zh-HK",
    "source": "Stripe Checkout"
  }
}
```

### 2. Rolitt Preorder Success

**事件名称**: `Rolitt Preorder Success`

**触发时机**: 预购支付成功时

**Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Rolitt Preorder Success Event",
  "properties": {
    "event": {
      "type": "string",
      "const": "Rolitt Preorder Success"
    },
    "customer_properties": {
      "type": "object",
      "properties": {
        "$email": {
          "type": "string",
          "format": "email",
          "description": "客户邮箱"
        }
      },
      "required": ["$email"]
    },
    "properties": {
      "type": "object",
      "properties": {
        "color": {
          "type": "string",
          "description": "选择的颜色",
          "examples": ["khaki", "black", "white"]
        },
        "preorder_id": {
          "type": "string",
          "description": "预购订单ID"
        },
        "preorder_number": {
          "type": "string",
          "description": "预购订单号",
          "pattern": "^ROL-\\d+$",
          "examples": ["ROL-1721463810"]
        },
        "locale": {
          "type": "string",
          "description": "用户语言设置",
          "examples": ["en", "zh-HK", "zh-CN"]
        },
        "amount": {
          "type": "number",
          "description": "支付金额（美元）",
          "minimum": 0,
          "examples": [99.00]
        },
        "currency": {
          "type": "string",
          "description": "货币代码",
          "examples": ["usd", "hkd"]
        },
        "session_id": {
          "type": "string",
          "description": "Stripe 会话ID",
          "examples": ["cs_test_abc123"]
        },
        "payment_intent_id": {
          "type": "string",
          "description": "Stripe 支付意图ID",
          "examples": ["pi_test_xyz789"]
        },
        "source": {
          "type": "string",
          "description": "事件来源",
          "default": "Stripe Webhook",
          "examples": ["Stripe Webhook"]
        }
      },
      "required": ["color", "preorder_id", "amount", "currency"]
    }
  },
  "required": ["event", "customer_properties", "properties"]
}
```

**示例数据**:
```json
{
  "event": "Rolitt Preorder Success",
  "customer_properties": {
    "$email": "user@example.com"
  },
  "properties": {
    "color": "khaki",
    "preorder_id": "abc123def456",
    "preorder_number": "ROL-1721463810",
    "locale": "zh-HK",
    "amount": 99.00,
    "currency": "usd",
    "session_id": "cs_test_abc123",
    "payment_intent_id": "pi_test_xyz789",
    "source": "Stripe Webhook"
  }
}
```

### 3. Rolitt Preorder Failed

**事件名称**: `Rolitt Preorder Failed`

**触发时机**: 预购支付失败时

**Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Rolitt Preorder Failed Event",
  "properties": {
    "event": {
      "type": "string",
      "const": "Rolitt Preorder Failed"
    },
    "customer_properties": {
      "type": "object",
      "properties": {
        "$email": {
          "type": "string",
          "format": "email",
          "description": "客户邮箱"
        }
      },
      "required": ["$email"]
    },
    "properties": {
      "type": "object",
      "properties": {
        "color": {
          "type": "string",
          "description": "选择的颜色",
          "examples": ["khaki", "black", "white"]
        },
        "preorder_id": {
          "type": "string",
          "description": "预购订单ID"
        },
        "error_reason": {
          "type": "string",
          "description": "失败原因",
          "examples": ["Payment declined", "Insufficient funds", "Card expired"]
        },
        "locale": {
          "type": "string",
          "description": "用户语言设置",
          "examples": ["en", "zh-HK", "zh-CN"]
        },
        "source": {
          "type": "string",
          "description": "事件来源",
          "default": "Stripe Webhook",
          "examples": ["Stripe Webhook"]
        }
      },
      "required": ["color", "preorder_id"]
    }
  },
  "required": ["event", "customer_properties", "properties"]
}
```

**示例数据**:
```json
{
  "event": "Rolitt Preorder Failed",
  "customer_properties": {
    "$email": "user@example.com"
  },
  "properties": {
    "color": "khaki",
    "preorder_id": "abc123def456",
    "error_reason": "Payment declined",
    "locale": "zh-HK",
    "source": "Stripe Webhook"
  }
}
```

## 使用指南

### 1. 验证事件数据

使用 JSON Schema 验证库（如 `ajv`）来验证事件数据：

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

// 加载 schema
const preorderStartedSchema = { /* schema 内容 */ };
const validate = ajv.compile(preorderStartedSchema);

// 验证数据
const eventData = { /* 事件数据 */ };
const valid = validate(eventData);

if (!valid) {
  console.error('Event data validation failed:', validate.errors);
}
```

### 2. TypeScript 类型定义

```typescript
// 基于 Schema 生成的 TypeScript 类型
export type RolittPreorderStartedEvent = {
  event: 'Rolitt Preorder Started';
  customer_properties: {
    $email: string;
  };
  properties: {
    color: string;
    preorder_id: string;
    preorder_number?: string;
    locale?: string;
    source?: string;
  };
};

export type RolittPreorderSuccessEvent = {
  event: 'Rolitt Preorder Success';
  customer_properties: {
    $email: string;
  };
  properties: {
    color: string;
    preorder_id: string;
    preorder_number?: string;
    locale?: string;
    amount: number;
    currency: string;
    session_id?: string;
    payment_intent_id?: string;
    source?: string;
  };
};

export type RolittPreorderFailedEvent = {
  event: 'Rolitt Preorder Failed';
  customer_properties: {
    $email: string;
  };
  properties: {
    color: string;
    preorder_id: string;
    error_reason?: string;
    locale?: string;
    source?: string;
  };
};

export type RolittKlaviyoEvent
  = | RolittPreorderStartedEvent
    | RolittPreorderSuccessEvent
    | RolittPreorderFailedEvent;
```

### 3. 最佳实践

1. **数据验证**: 在发送事件前始终验证数据结构
2. **错误处理**: 实现重试机制和错误日志
3. **幂等性**: 使用唯一标识符防止重复发送
4. **监控**: 在 Klaviyo 后台监控事件发送状态
5. **测试**: 使用 Klaviyo 的测试环境验证事件结构

## 相关文档

- [Klaviyo Track API 文档](https://developers.klaviyo.com/en/reference/track)
- [Klaviyo Events API 文档](https://developers.klaviyo.com/en/reference/create_event)
- [JSON Schema 规范](https://json-schema.org/)
