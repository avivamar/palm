好的！根据你给的项目架构和上下文（包括 Next.js, Shadcn-UI, TailwindCSS, 以及整个 rolitt 网站的现有结构），我为这次 AI 能力介绍 LandingPage 页面整理了一个完整的需求文档（包括开发需求、Cursor Prompt Guide）如下：

⸻

📌 Rolitt AI Landing Page 需求文档

🗂️ 1. 页面目标

设计并实现一个用于介绍 Rolitt AI 能力的 Landing Page，集成在现有的 Next.js 主站（rolittmain）中，使用 Shadcn-UI、TailwindCSS，并借鉴 reactbits.dev 动态技术栈（动画、交互、懒加载）。该页面需易于维护、可扩展，并与现有架构无缝衔接。

⸻

🖼️ 2. 页面结构（Section）

Section 名称	内容概述
HeroSection	标题、简短描述、背景动效、主CTA按钮
FeaturesSection	Rolitt AI 的核心能力（视觉AI、自然语言处理、机器人集成、智能交互）
TechStackSection	支撑 Rolitt AI 的核心技术（深度学习、计算机视觉、NLP等）
CustomerFeedbackSection	客户评价、成功案例（暂可用占位符数据）
CTASection	全页面多次CTA，如“了解更多”、“立即体验”
FooterSection	版权信息、隐私政策、社交媒体、现有footer组件复用

⸻

🛠️ 3. 技术要求

✅ Next.js 15（App Router）
✅ Shadcn-UI：用于按钮、卡片、模态等。
✅ TailwindCSS：页面布局、样式、响应式设计。
✅ Framer Motion：页面转场动画、组件进入动画。
✅ Lenis：平滑滚动。
✅ Next-intl：多语言支持（至少提供 en 和 zh 作为示例）。
✅ TypeScript：类型安全。
✅ 模块化组件：各Section单独组件放在 src/components/ui/ 目录下。

⸻

📂 4. 集成要求
	•	页面路径：/ai-landing（使用多语言路由，如 /en/ai-landing）。
	•	复用 StaticHero 的视频背景或参考交互逻辑（如已有的Hero动画）。
	•	使用 src/app/[locale]/(marketing)/ 结构存放页面文件。
	•	页面需要集成 Sentry（错误监控）、Facebook Pixel（转化跟踪）。
	•	保证与现有 Clerk 身份验证集成不冲突。
	•	代码需符合 ESLint 和 Prettier 规范。
	•	具备 Storybook 文档化能力（可在 stories 中写示例）。

⸻

📈 5. 交互要求
	•	懒加载（Intersection Observer）
	•	动态滚动（Lenis）
	•	动态渐入渐出动画（Framer Motion）
	•	CTA按钮 hover 态带有渐变色或发光效果（参考 reactbits.dev）
	•	HeroSection 背景动态（可与现有的 StaticHero 视频背景融合）
	•	Footer 复用主站 Footer 组件

⸻

🔑 6. Cursor Prompt Guide（给Cursor的提示词）

# Cursor AI Prompt Guide

You are helping implement a new AI Landing Page for Rolitt's Next.js main site. Please follow these instructions:

- **页面位置**: `src/app/[locale]/(marketing)/ai-landing/page.tsx`
- **拆分模块**: HeroSection, FeaturesSection, TechStackSection, CustomerFeedbackSection, CTASection, FooterSection
- **样式**: 使用TailwindCSS4，颜色保持与品牌主色（#EBFF7F），在需要渐变或动效时参考reactbits.dev
- **组件结构**: 统一放在 `src/components/ui/` 下，每个Section独立组件
- **多语言支持**: 使用 `next-intl` 包裹文本（示例：t("hero.title")）
- **动画**: 使用 Framer Motion（`motion.div`）和 Lenis 平滑滚动
- **代码风格**: TypeScript，保持模块化，注释清晰
- **Storybook**: 每个Section写好stories，方便后续演示和测试
- **Sentry、Facebook Pixel、Clerk**: 复用全局设置，不需要额外改动
- **HeroSection**: 可参考 `StaticHero` 组件做背景，但重点突出 AI 能力
- **FeaturesSection**: 三到四个AI核心能力（视觉AI、NLP、机器人集成、智能交互）
- **TechStackSection**: 介绍AI技术（深度学习、计算机视觉、NLP）
- **CustomerFeedbackSection**: 用静态假数据，可后续替换
- **CTASection**: 贯穿全页面多处CTA按钮
- **FooterSection**: 直接复用 `src/components/ui/footer`

Use consistent Tailwind spacing (py-16, px-4) and Tailwind colors. Keep file naming consistent. Document any reusable UI patterns.

⸻

📦 7. 交付物
	•	src/app/[locale]/(marketing)/ai-landing/page.tsx
	•	src/components/ui/HeroSection.tsx
	•	src/components/ui/FeaturesSection.tsx
	•	src/components/ui/TechStackSection.tsx
	•	src/components/ui/CustomerFeedbackSection.tsx
	•	src/components/ui/CTASection.tsx
	•	src/components/ui/FooterSection.tsx
	•	对应的 stories 文件夹下的示例
	•	ESLint、Prettier通过
	•	Storybook文档可预览
