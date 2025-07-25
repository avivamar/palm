
Palm AI 是一个基于手掌图像 + 个人出生信息（日期、时辰）分析用户个性、健康趋势、运势周期和潜力的 AI 产品。
结合东方掌纹学、西方星座塔罗学，以及大模型智能解析，输出简版与完整版报告，采用订阅制逐步建立用户留存。

项目整体说明 @readme.md
开发规范：@claude.md


### **🎯 代码库核心功能**

#### **💼 业务核心功能**
- **🛍️ 预订系统**: 完整的产品预订流程，支持多颜色选择和规格配置
- **💳 支付处理**: Stripe 异步支付架构，支持多种支付方式和订阅模式
- **🎯 推荐营销**: 智能推荐系统，支持多级推荐奖励和精准营销
- **📦 Shopify 集成**: 完整的订单同步、产品管理、库存控制和实时数据同步
- **📧 营销自动化**: Klaviyo 集成，自动化邮件营销和用户行为追踪
- **📈 数据分析**: 多平台分析工具集成，实时业务洞察

#### **🔧 技术核心功能**
- **🔐 双认证系统**: Supabase Auth (主系统) + Firebase Auth (容灾备份)
- **📊 管理后台**: 订单管理、用户管理、webhook 日志监控和系统健康检查
- **🖼️ 图片管理**: 智能图片上传、压缩、CDN 分发和多格式支持
- **📧 邮件模板**: 支持 6 种邮件类型和 4 种语言的专业邮件模板系统
- **📝 内容管理**: 支持 Notion 和 Markdown 的博客系统
- **🌍 国际化**: 支持英语、西班牙语、日语、繁体中文的完整本地化

## **🏗️ 技术架构**

### **📦 Monorepo 包管理架构**

**8 个独立功能包，模块化设计，独立开发和部署**：

- **`@rolitt/payments`**: 支付系统包 - Stripe 集成、订阅管理、异步支付处理
- **`@rolitt/referral`**: 推荐系统包 - 多级推荐、奖励计算、营销追踪
- **`@rolitt/image-upload`**: 图片上传包 - 智能压缩、CDN 分发、多格式支持
- **`@rolitt/auth`**: 认证系统包 - 双认证架构、会话管理、权限控制
- **`@rolitt/email`**: 邮件模板包 - 多语言模板、自动化发送、模板管理
- **`@rolitt/shopify`**: Shopify 集成包 - 订单同步、库存管理、产品同步
- **`@rolitt/admin`**: 管理系统包 - 后台管理、数据监控、系统配置
- **`@rolitt/shared`**: 共享组件库 - 通用组件、工具函数、类型定义
- **`@rolitt/ai-core`**: AI 核心包 - 模型管理、推理引擎、数据处理

⸻

🧠 Palm AI 手掌识别项目整体方案书

⸻

🎯 项目定位

Palm AI 是一个基于手掌图像 + 个人出生信息（日期、时辰）分析用户个性、健康趋势、运势周期和潜力的 AI 产品。
结合东方掌纹学、西方星座塔罗学，以及大模型智能解析，输出简版与完整版报告，采用订阅制逐步建立用户留存。

⸻

🧱 项目目标
	•	利用掌纹分析和 AI 模型提供创新的“命理 + 健康 + 个性”评估服务@packages/palm
	•	使用 OpenAI / Claude / Gemini 等大模型提升内容生成质量与信任感 @packages/ai-core
	•	以 简版报告免费 + 完整报告付费 模式，快速转化付费用户
	•	强化订阅与分享裂变机制，实现用户留存与增长闭环

⸻

🧩 用户业务流程（核心业务流程图）

[1] 用户访问落地页
     ↓
[2] 上传手掌照片(@packages/image-upload) + 填写生日信息
     ↓
[3] 触发 AI(@packages/ai-core) 生成简版报告（60s 内完成）
     ↓
[4] 吸引用户点击 “查看更多” → 售卖完整版报告
     ↓
[5] 支付(stripe)  $19.9 解锁完整版 Web 报告
     ↓
[6] 引导订阅（月/年付）查看每日掌纹变化 + 生活指引
     ↓
[7] 用户推荐好友获赠报告积分（@packages/referral）


⸻

📦 产品核心模块

模块	功能描述
🖐️ 手掌图像上传模块@packages/image-upload	上传并预处理手掌图像（前端或后端 base64）
📅 出生信息输入	年月日+时辰/时区输入，增强模型分析可信度
🤖 AI 报告生成器@packages/ai-core	使用大模型生成个性化报告（OpenAI/Claude/Gemini）
💳 报告售卖系统@packages/payments	Stripe Checkout 集成，单次解锁或订阅
📤 报告下载模块	支持邮件发送@packages/email或 Web 查看
🧭 用户仪表盘	增加查看历史分析、订阅状态、个性建议
📢 Referral 系统@packages/referral	用户推荐朋友可解锁更多报告积分
📧 邮件营销	Klaviyo 营销触达 + 自动续费提醒


⸻

🧠 报告结构设计（JSON）

{
  "summary": {
    "overall": "你的手掌显示出稳定而细致的个性……",
    "health": "近期需注意心血管状况与睡眠周期。",
    "emotion": "情绪较为平稳，适合开展新关系。",
    "career": "职业发展处于拐点，建议在 8 月调整方向。"
  },
  "traits": [
    { "label": "主导性", "score": 7 },
    { "label": "情绪控制", "score": 5 },
    { "label": "执行力", "score": 9 }
  ],
  "insights": {
    "lucky_period": "2025年9月上旬",
    "avoid_decision": "本月不宜做重大财务决策",
    "tarot_hint": "节制 - 保持节奏，稳步推进"
  },
  "metadata": {
    "generated_at": "2025-07-21",
    "model": "gpt-4o + palm-custom-prompt",
    "language": "zh"
  }
}


⸻

💡 定价模型（建议）

产品层级	内容	价格
🎁 简版报告	个性简述 + 1 条建议	免费（引导注册）
💎 完整版报告	全面分析 + 未来趋势 + PDF 导出	$19.9 一次性
📆 月度订阅	每周/每日更新掌纹报告 + 星象建议 + 会员专属内容	$7.9/mo or $59/yr
🤝 邀请奖励	邀请好友注册并上传图像	获赠完整版或下次免费


⸻

🛠 技术架构（集成方向）

📦 技术模块对接：

系统模块	使用技术	说明
图像处理	Next.js Edge API / Vercel blob / base64	压缩裁切上传图像
AI 分析	@rolitt/palm-ai（自定义解耦包）	支持 OpenAI / Claude / Gemini
报告生成	Server Actions + Redis 缓存	控制成本，避免重复分析
PDF 报告	react-pdf or Puppeteer + Tailwind 风格	导出完整视觉风格报告
支付系统	Stripe Checkout + Webhooks	完整订单履约流程
用户认证	Supabase Auth + Firebase 容灾	集成现有认证架构
推荐系统	Next.js 中间件 + Referral Token	使用 URL token 实现


⸻

🌐 多语言支持策略

语言	市场
🇺🇸 English	美国/英国/加拿大主力市场
🇯🇵 日本語	日本市场：掌纹分析 + 东方命理融合
🇨🇳 中文（简/繁）	港澳台、新加坡、东南亚华人市场
🇰🇷 es 西班牙语（规划中）	可探索西班牙语掌纹学市场


⸻

📣 营销推广建议
	•	TikTok / Instagram 短视频广告：上传掌纹，60秒获知命运转折点
	•	Affiliate + Referral：邀请好友解锁完整报告
	•	Newsletter 营销：掌纹日历推送，驱动回访
	•	Reddit / Discord KOC 渗透：借助神秘命理文化吸引流量

⸻

📌 项目节奏建议

时间	里程碑
Week 1	Prompt 设计 + AI 接入模块完成 packages/ai-core 已经完成大部分功能
Week 2	上传分析 + 简版报告输出上线
Week 3	支付系统 + 完整报告售卖页上线
Week 4	SEO 落地页 + TikTok 广告上线
Week 5+	邀请机制、订阅功能、报告优化迭代
