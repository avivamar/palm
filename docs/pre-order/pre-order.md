非常关键的问题！你问的是：

💡 在 A 步骤（官网填写邮箱）中，这个邮箱到底是给 Klaviyo 还是 Stripe？

✅ 正确答案是：

两个系统都需要，但主流程先给 Stripe，随后再同步给 Klaviyo。

⸻

🎯 为什么这样设计最合理？

系统	角色	是否必须	为什么
Stripe	⚙️ 订单核心系统	✅ 必须	支付收据 / 付款 metadata / Webhook 唯一关联点
Klaviyo	📩 邮件营销系统	✅ 推荐	自动发送“预约确认邮件” / “分享任务邮件”等营销流程

所以正确流程是：

⸻

✅ 冷启动推荐流程图（完整流转）

flowchart TD
    %% 前端用户交互
    subgraph frontend ["🎨 前端用户交互"]
        direction TB
        A1["🛍️ 用户在 Rolitt 预售页面<br/>选择颜色 + 输入邮箱"]
        A2{"🛒 点击'预订/支付'按钮"}
        B4["💳 跳转至 Stripe 托管支付页面<br/>（输入信用卡 / PayPal 等）"]

        A1 --> A2 --> B4
    end

    %% 后端 API 处理
    subgraph backend_api ["⚙️ 后端 API 处理"]
        direction TB
        B1["📡 调用后端 API<br/>POST /api/payments/create-intent"]
        B2["👤 查找/创建 Stripe Customer"]
        B3["🎫 创建 Stripe Checkout Session<br/>包含 color, email 等 metadata"]

        B1 --> B2 --> B3
    end

    %% Stripe Webhook 事件
    subgraph webhook ["⚡ Stripe Webhook 异步事件"]
        direction TB
        C1["📥 事件：payment_intent.created<br/>→ 捕获潜在客户"]
        C2["✅ 事件：payment_intent.succeeded<br/>→ 支付成功确认"]
        C3["🎯 事件：checkout.session.completed<br/>→ 最终支付完成确认"]
    end

    %% 数据库操作
    subgraph database ["🗄️ Firestore 数据库操作"]
        direction TB
        D1["📝 写入订单记录<br/>preorders/{intent_id}<br/>状态: created"]
        D2["🔄 更新订单状态<br/>→ succeeded 确认已支付"]
        D3["📋 补充完整信息<br/>customer_details, 语言环境等"]
        F1["💾 Firestore 数据中心<br/>preorders/{id}<br/>文档结构完整"]

        D1 --> D2 --> D3 --> F1
    end

    %% Klaviyo 营销自动化
    subgraph klaviyo ["📧 Klaviyo 营销自动化"]
        direction TB
        E1["📤 推送事件<br/>Pre-order Success"]
        E2["📤 推送事件<br/>Pre-order Started<br/>（用于 abandoned cart 营销）"]
        G1["🎉 触发感谢邮件 Flow"]
        G2["⏰ 触发催付提醒 Flow"]

        E1 --> G1
        E2 --> G2
    end

    %% 业务应用出口
    subgraph applications ["📊 业务应用出口"]
        direction TB
        H1["🔍 订单管理系统<br/>查看状态"]
        H2["📈 数据分析系统<br/>追踪转化"]
        H3["✉️ 用户收到<br/>感谢/确认邮件"]
        H4["🔔 用户收到<br/>提醒/优惠邮件"]
    end

    %% 流程连接
    A2 --> B1
    B3 -->|"返回 sessionId"| A2

    B3 -.-> C1
    B4 -.-> C2
    B4 -.-> C3

    C1 --> D1
    C2 --> D2
    C3 --> D3

    D2 --> E1
    D1 --> E2

    F1 --> H1
    F1 --> H2
    G1 --> H3
    G2 --> H4

⸻

预售业务流程市场容易理解版本
flowchart TD
    %% 用户行为路径
    subgraph user ["👤 用户行为路径"]
        direction TB
        A1["🌐 用户访问 Rolitt 预售页面"]
        A2["📝 填写邮箱 + 选择颜色"]
        A3["🛒 点击'立即预订'按钮"]
        A4["🔒 跳转至 Stripe 安全支付页面"]
        B1["💳 支付完成"]

        A1 --> A2 --> A3 --> A4 --> B1
    end

    %% 数据捕获与处理
    subgraph data ["📊 数据捕获与处理"]
        direction TB
        M1["📥 捕获潜在客户<br/>email + color"]
        M2["💾 写入 Firestore 预购表<br/>状态: created"]
        M4["✅ 更新 Firestore 订单<br/>状态: succeeded"]

        M1 --> M2
        M2 -.-> M4
    end

    %% Klaviyo 事件追踪
    subgraph klaviyo ["📧 Klaviyo 事件追踪"]
        direction TB
        M3["📤 推送事件<br/>'Rolitt Preorder Started'"]
        M5["📤 推送事件<br/>'Rolitt Preorder Success'"]

        M3 -.-> M5
    end

    %% 营销自动化流程
    subgraph automation ["🤖 营销自动化流程"]
        direction TB
        K1["🟡 启动 Flow<br/>预售未支付提醒<br/>× 2 天"]
        K2["🟢 启动 Flow<br/>感谢邮件 + 物流说明<br/>+ 社媒 CTA"]
    end

    %% 用户分群
    subgraph segments ["🎯 用户生命周期分群"]
        direction TB
        U1["❌ 加入 Segment<br/>'放弃预购'"]
        U2["✅ 加入 Segment<br/>'成功预购'"]
    end

    %% 精准再营销
    subgraph retargeting ["📣 精准再营销"]
        direction TB
        R1["🎯 Meta/Google Ads<br/>再投放<br/>（包含颜色偏好）"]
        R2["📬 后续营销邮件<br/>推荐配件/延伸故事"]
    end

    %% Webhook 处理
    subgraph webhook ["⚡ Webhook 处理"]
        direction TB
        B2["🔔 Stripe 通知 Webhook"]
    end

    %% 连接线
    A2 --> M1
    M1 --> M2
    M2 --> M3

    B1 --> B2
    B2 --> M4
    M4 --> M5

    M3 --> K1
    M5 --> K2

    K1 --> U1
    K2 --> U2

    U1 --> R1
    U2 --> R2

    %% 样式定义
    classDef userFlow fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000
    classDef dataFlow fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000
    classDef klaviyoFlow fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    classDef automationFlow fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    classDef segmentFlow fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    classDef retargetFlow fill:#fff8e1,stroke:#ffa000,stroke-width:2px,color:#000
    classDef webhookFlow fill:#efebe9,stroke:#5d4037,stroke-width:2px,color:#000

    %% 应用样式
    class A1,A2,A3,A4,B1 userFlow
    class M1,M2,M4 dataFlow
    class M3,M5 klaviyoFlow
    class K1,K2 automationFlow
    class U1,U2 segmentFlow
    class R1,R2 retargetFlow
    class B2 webhookFlow

✅ 代码结构参考说明：

Step A：用户填写邮箱（前端）

const handleCheckout = async () => {
  await fetch("/api/checkout", {
    method: "POST",
    body: JSON.stringify({ email, color }),
  });
};

⸻

Step B：后端 Checkout API → Stripe

const session = await stripe.checkout.sessions.create({
  customer_email: email, // ✅ 用于 Stripe 发票和元数据
  metadata: {
    color: color,
    email: email
  }
});

⸻

Step C：支付成功后 → Stripe Webhook

// /api/stripe-webhook.ts

if (event.type === "checkout.session.completed") {
  const session = event.data.object;
  const email = session.customer_email;
  const color = session.metadata.color;

  // ✅ 写入 Firestore / Google Sheet

  // ✅ 推送到 Klaviyo（Profile 更新）
  await fetch("https://a.klaviyo.com/api/profiles/", {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        type: "profile",
        attributes: {
          email: email,
          properties: {
            yoyo_color: color,
            stripe_order_id: session.id
          }
        }
      }
    })
  });
}

⸻

🧩 FAQ：是否需要在表单提交时先发给 Klaviyo？

如果你希望：
	•	还没付款的用户也能进入「预约邮件 Flow」
	•	在 Stripe 前就开始营销漏斗引导（如放弃付款的提醒）

那么你可以在用户点击「立即预订」时，并发一份数据发给 Klaviyo Profile 创建接口。

⸻

✅ 推荐双轨机制（稳妥且营销友好）：

动作	发往 Stripe	发往 Klaviyo
用户填写邮箱 + 颜色 → 提交预约按钮	✅ 是，进入 metadata + customer_email	✅ 是，创建或更新 profile，设定 status = “预订中”
支付成功（Webhook）	✅ 是，支付状态变更	✅ 是，更新 profile，设定 status = “已支付” + 激活 Flow

⸻

🔚 总结一句话：

✅ 邮箱必须传给 Stripe → 用于付款记录 + Webhook事件唯一标识
✅ 也推荐同步给 Klaviyo → 启动邮件营销自动流程、追踪行为路径
✅ 最好统一以邮箱作为整个冷启动用户识别主键

⸻
