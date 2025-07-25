palm 项目业务核心在@packages/palm。在@src/app/[locale]/(marketing)创建 palm landingpage,其相应的组件可以放在@src/components/palm下，

⸻

🇺🇸 Palm AI 国际版落地页文案提案

📌 面向欧美用户，强调：
	•	科技+神秘感#
	•	隐私保护
	•	自我洞察与成长
	•	即时满足 + 社会分享欲望

⸻

🌟 Hero 区域：一句话价值主张 + 高转化 CTA

# What if your palm could reveal your personality, energy, and fate?

📸 Upload your palm. 🎂 Enter your birth date.  
🔮 Get a FREE personalized report powered by AI, astrology, and palmistry.

[Start My Free Reading] 🔥（主按钮）

👉 No signup needed · Private & Secure

📌 心理触发点：
	•	好奇（What if…）
	•	免费诱因（FREE）
	•	AI + 神秘文化结合（占星术 + 掌纹 + AI）
	•	“立即开始”风格按钮（减少跳出）

⸻

🧠 Section 2：How it works — 透明可信，建立信任

## How Palm AI Works

🔍 Step 1: Upload a clear photo of your palm  
📅 Step 2: Enter your birthday (for deeper insights)  
🧠 Step 3: AI scans palm lines, mounts & shapes  
🌌 Step 4: Blends palm features with astrological & personality logic  
📄 Step 5: Generates your personal insight report in seconds

🚫 We don’t store your photos. Everything is encrypted & deleted after analysis.

📌 加强隐私强调：欧美用户极度重视隐私

⸻

✨ Section 3：What you get – 免费 vs 完整版报告对比

## What's Inside Your Palm Report?

✅ **Free Sample Report Includes**:  
- Personality type (based on palm shape + energy lines)  
- Mental clarity and emotional status  
- Basic health snapshot

💎 **Unlock Full Report ($19.9 USD)**:  
- Career & relationship forecasts  
- Monthly luck & warning signals  
- Emotional triggers + energy healing advice  
- Cosmic alignment with your birth chart & palm marks

[See My Report] 🔮（再次 CTA）

📌 关键词：Forecast, Energy, Personality — 都是美国人买单的关键词
📌 避免使用“命理”“占卜”这类字眼，改为 psychological insight / cosmic map / energy flow 更具信任感

⸻

👀 Section 4：报告视觉 + 样例图（引导点击欲望）

## Real AI-Generated Reports

🧬 AI reads your:
- Life line
- Heart line
- Head line
- Mounts & zones
- Palm structure types

🎯 Example Insight:
> "Your palm shows you’re a deep thinker, emotionally reserved, but intensely intuitive. Expect a relationship shift within 3 weeks as Mercury aligns with your Venus mount."

[Get Your Free Sample Now]（按钮）


⸻

🛡️ Section 5：信任构建 + 隐私保障（极重要）

## Privacy First. Always.

🔐 Your photo is never stored.  
⚙️ AI runs locally in a secure, encrypted pipeline.  
🧠 Report generated once → not traceable.  
✅ GDPR & CCPA compliant.

We believe in private, personal insights — not data harvesting.

📌 对欧美用户强调隐私透明度是必需的

⸻

💳 Section 6：价格 & 信任机制

## Upgrade Anytime – No Pressure

🎁 Free Sample — no strings attached  
🔓 Full Report — $19.9 USD (One-time)  
🌀 Weekly Palm + Energy Reports — $9.9/month (Cancel anytime)

💳 Stripe · Apple Pay · Google Pay supported  
🔒 100% Secure Checkout · No recurring charges unless you opt in

📌 $19.9 在欧美为中低单价心理门槛，合理
📌 订阅服务明确写出「可取消」，用户更安心

⸻

📢 社会认同 + 分享（可选区）

## Join 48,000+ People Exploring Their Palms

🧡 “This was more accurate than my therapist.”  
💬 “It felt like the AI really saw who I am.”  
📷 85% of users shared their report with a friend.

👋 Discover the version of yourself hiding in your palm.


⸻

🧲 页面结尾 CTA

## Ready to Explore the Truth in Your Palm?

Upload your photo now. Get a free AI-powered insight in seconds.

[Start Free Reading]（主按钮）

🔒 Private · No Account Needed · Instant Result


⸻

✅ 技术落地建议（基于你现有系统）
	•	页面放在 app/(marketing)/palm-ai/page.tsx
	•	报告结构后端由 @rolitt/palm-ai 包生成（基于 OpenAI Vision + prompt logic）
	•	使用 Resend + Klaviyo 邮件触达付费用户
	•	Stripe Checkout 集成，设置 Webhook 获取订单状态

⸻

🎯 落地页设计风格建议（欧美风）
	•	色调：自然色系 + 紫/蓝 AI 辐射色（灵性 + 现代科技结合）
	•	字体：Serif + San Serif 混排（增添神秘感 +可读性）
	•	图像：真实案例展示 + 动态手掌线条识别动画
	•	组件：shadcn/ui + framer-motion 增强互动性

⸻

如果你需要我把这套内容直接转化为代码（Next.js 页模板）或想继续优化英文文案、A/B 测试逻辑，我可以继续。是否继续？