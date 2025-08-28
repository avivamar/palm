#!/bin/bash

# GTM 多平台分析工具集成设置脚本
# 作者:/* Thepalmistrylife Development Team
# 日期: $(date +%Y-%m-%d)

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 脚本配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🚀 GTM 多平台分析工具集成设置${NC}"
echo "========================================"
echo ""

# 检查环境
check_environment() {
    echo -e "${BLUE}📋 检查环境...${NC}"
    
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        echo -e "${RED}❌ 错误：未在项目根目录运行脚本${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 环境检查通过${NC}"
    echo ""
}

# 获取GTM ID
get_gtm_id() {
    echo -e "${BLUE}📝 配置 Google Tag Manager${NC}"
    echo "----------------------------------------"
    
    if [ -z "$GTM_ID" ]; then
        echo "请输入你的 GTM 容器 ID (格式: GTM-XXXXXXX):"
        read -p "GTM ID: " GTM_ID
    fi
    
    if [[ ! $GTM_ID =~ ^GTM-[A-Z0-9]+$ ]]; then
        echo -e "${YELLOW}⚠️  GTM ID 格式可能不正确，但继续设置...${NC}"
    fi
    
    echo -e "${GREEN}✅ GTM ID: $GTM_ID${NC}"
    echo ""
}

# 获取各分析工具的配置
get_analytics_configs() {
    echo -e "${BLUE}🔧 配置分析工具${NC}"
    echo "----------------------------------------"
    
    # Microsoft Clarity
    echo "Microsoft Clarity Project ID (可选):"
    read -p "Clarity ID: " CLARITY_ID
    
    # PostHog
    echo "PostHog Project Key (可选):"
    read -p "PostHog Key: " POSTHOG_KEY
    echo "PostHog Host (默认: https://app.posthog.com):"
    read -p "PostHog Host: " POSTHOG_HOST
    POSTHOG_HOST=${POSTHOG_HOST:-"https://app.posthog.com"}
    
    # TikTok Pixel
    echo "TikTok Pixel ID (可选):"
    read -p "TikTok Pixel ID: " TIKTOK_PIXEL_ID
    
    # Umami
    echo "Umami Website ID (可选):"
    read -p "Umami Website ID: " UMAMI_WEBSITE_ID
    echo "Umami URL (可选):"
    read -p "Umami URL: " UMAMI_URL
    
    # Rybbit
    echo "Rybbit ID (可选):"
    read -p "Rybbit ID: " RYBBIT_ID
    
    echo -e "${GREEN}✅ 分析工具配置完成${NC}"
    echo ""
}

# 更新环境变量
update_env_variables() {
    echo -e "${BLUE}📝 更新环境变量${NC}"
    echo "----------------------------------------"
    
    ENV_FILE="$PROJECT_ROOT/.env.local"
    
    # 备份现有的 .env.local
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ 备份现有环境变量文件${NC}"
    fi
    
    # 添加 GTM 配置
    echo "" >> "$ENV_FILE"
    echo "# Google Tag Manager - 添加于 $(date)" >> "$ENV_FILE"
    echo "NEXT_PUBLIC_GTM_ID=$GTM_ID" >> "$ENV_FILE"
    
    # 添加其他分析工具配置
    echo "" >> "$ENV_FILE"
    echo "# 分析工具配置 - 添加于 $(date)" >> "$ENV_FILE"
    
    [ ! -z "$CLARITY_ID" ] && echo "NEXT_PUBLIC_CLARITY_ID=$CLARITY_ID" >> "$ENV_FILE"
    [ ! -z "$POSTHOG_KEY" ] && echo "NEXT_PUBLIC_POSTHOG_KEY=$POSTHOG_KEY" >> "$ENV_FILE"
    [ ! -z "$POSTHOG_HOST" ] && echo "NEXT_PUBLIC_POSTHOG_HOST=$POSTHOG_HOST" >> "$ENV_FILE"
    [ ! -z "$TIKTOK_PIXEL_ID" ] && echo "NEXT_PUBLIC_TIKTOK_PIXEL_ID=$TIKTOK_PIXEL_ID" >> "$ENV_FILE"
    [ ! -z "$UMAMI_WEBSITE_ID" ] && echo "NEXT_PUBLIC_UMAMI_WEBSITE_ID=$UMAMI_WEBSITE_ID" >> "$ENV_FILE"
    [ ! -z "$UMAMI_URL" ] && echo "NEXT_PUBLIC_UMAMI_URL=$UMAMI_URL" >> "$ENV_FILE"
    [ ! -z "$RYBBIT_ID" ] && echo "NEXT_PUBLIC_RYBBIT_ID=$RYBBIT_ID" >> "$ENV_FILE"
    
    echo -e "${GREEN}✅ 环境变量已更新${NC}"
    echo ""
}

# 创建GTM组件
create_gtm_component() {
    echo -e "${BLUE}🔧 创建 GTM 组件${NC}"
    echo "----------------------------------------"
    
    ANALYTICS_DIR="$PROJECT_ROOT/src/components/analytics"
    mkdir -p "$ANALYTICS_DIR"
    
    # GTM 容器组件
    cat > "$ANALYTICS_DIR/GTMContainer.tsx" << 'EOF'
'use client'

import Script from 'next/script'
import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer: any[]
  }
}

interface GTMContainerProps {
  gtmId: string
}

export function GTMContainer({ gtmId }: GTMContainerProps) {
  useEffect(() => {
    // 初始化 dataLayer
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
    }
  }, [])

  if (!gtmId) {
    console.warn('GTM ID not provided')
    return null
  }

  return (
    <>
      {/* GTM Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
      
      {/* GTM NoScript */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}
EOF

    # 统一追踪组件
    cat > "$ANALYTICS_DIR/UnifiedTracking.tsx" << 'EOF'
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export const UnifiedTracking = () => {
  const pathname = usePathname()

  useEffect(() => {
    // 页面浏览事件
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        page_path: pathname,
        page_title: document.title,
        timestamp: new Date().toISOString()
      })
    }
  }, [pathname])

  return null
}

// 事件追踪Hook
export const useUnifiedTracking = () => {
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...parameters,
        timestamp: new Date().toISOString()
      })
    }
  }

  const trackPurchase = (transactionId: string, value: number, currency = 'USD', items: any[] = []) => {
    trackEvent('purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    })
  }

  const trackAddToCart = (itemId: string, itemName: string, value: number, currency = 'USD') => {
    trackEvent('add_to_cart', {
      item_id: itemId,
      item_name: itemName,
      value: value,
      currency: currency
    })
  }

  const trackLead = (form_name: string, content: Record<string, any> = {}) => {
    trackEvent('generate_lead', {
      form_name: form_name,
      ...content
    })
  }

  return {
    trackEvent,
    trackPurchase,
    trackAddToCart,
    trackLead
  }
}
EOF

    # 同意管理组件
    cat > "$ANALYTICS_DIR/ConsentManager.tsx" << 'EOF'
'use client'

import { useEffect, useState } from 'react'

interface ConsentState {
  analytics: boolean
  marketing: boolean
  personalization: boolean
}

export const ConsentManager = () => {
  const [consent, setConsent] = useState<ConsentState | null>(null)

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent')
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent)
        setConsent({
          analytics: parsed === true || parsed.analytics === true,
          marketing: parsed === true || parsed.marketing === true,
          personalization: parsed === true || parsed.personalization === true,
        })
      } catch (e) {
        console.error('Error parsing consent:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (consent && typeof window !== 'undefined' && window.dataLayer) {
      // 更新 GTM 同意状态
      window.dataLayer.push({
        event: 'consent_update',
        analytics_storage: consent.analytics ? 'granted' : 'denied',
        ad_storage: consent.marketing ? 'granted' : 'denied',
        personalization_storage: consent.personalization ? 'granted' : 'denied'
      })
    }
  }, [consent])

  return null
}
EOF

    echo -e "${GREEN}✅ GTM 组件已创建${NC}"
    echo ""
}

# 更新Layout文件
update_layout() {
    echo -e "${BLUE}🔧 更新 Layout 文件${NC}"
    echo "----------------------------------------"
    
    LAYOUT_FILE="$PROJECT_ROOT/src/app/[locale]/layout.tsx"
    
    if [ ! -f "$LAYOUT_FILE" ]; then
        echo -e "${RED}❌ Layout 文件未找到: $LAYOUT_FILE${NC}"
        return 1
    fi
    
    # 备份原文件
    cp "$LAYOUT_FILE" "$LAYOUT_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    
    # 检查是否已经包含GTM
    if grep -q "GTMContainer" "$LAYOUT_FILE"; then
        echo -e "${YELLOW}⚠️  Layout 文件已包含 GTM 组件${NC}"
        return 0
    fi
    
    # 创建更新后的 layout 文件
    cat > "$LAYOUT_FILE.new" << 'EOF'
import type { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';

import { AnimationProvider } from '@/components/AnimationContext';
import CookieBanner from '@/components/CookieBanner';
import { OrganizationJsonLd } from '@/components/JsonLd';
import { MetaPixel } from '@/components/MetaPixel';
import { Toaster } from '@/components/Toaster';
import { GTMContainer } from '@/components/analytics/GTMContainer';
import { UnifiedTracking } from '@/components/analytics/UnifiedTracking';
import { ConsentManager } from '@/components/analytics/ConsentManager';
import { routing } from '@/libs/i18nNavigation';
import '@/styles/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// ... 保留现有的 metadata 配置 ...

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locale || !routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* SEO: Organization structured data */}
        <OrganizationJsonLd lang={locale as any} />
        
        {/* Google Tag Manager */}
        <GTMContainer gtmId={process.env.NEXT_PUBLIC_GTM_ID!} />
        
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AnimationProvider>
              {children}
              <UnifiedTracking />
            </AnimationProvider>
            <Toaster />
            <CookieBanner />
            <ConsentManager />
          </ThemeProvider>
        </NextIntlClientProvider>
        
        {/* 保留现有的其他脚本 */}
        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!}
          dataLayerName="dataLayer"
        />
        
        <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID!} />
      </body>
    </html>
  );
}
EOF

    echo -e "${YELLOW}⚠️  Layout 文件已更新，请手动检查并合并更改${NC}"
    echo "   原文件备份: $LAYOUT_FILE.backup.*"
    echo "   新文件模板: $LAYOUT_FILE.new"
    echo ""
}

# 创建GTM配置指南
create_gtm_config_guide() {
    echo -e "${BLUE}📚 创建 GTM 配置指南${NC}"
    echo "----------------------------------------"
    
    cat > "$PROJECT_ROOT/scripts/gtm-config-guide.md" << 'EOF'
# GTM 配置指南

## 🎯 GTM 容器设置步骤

### 1. 创建 GTM 容器
1. 访问 [Google Tag Manager](https://tagmanager.google.com)
2. 点击 "创建账户"
3. 输入账户名称和容器名称
4. 选择平台：Web
5. 记下容器 ID (GTM-XXXXXXX)

### 2. 基础配置

#### 内置变量启用
- Page URL
- Page Title
- Page Path
- Click Element
- Click Text
- Form Element

#### 触发器配置
1. **All Pages** (页面浏览)
2. **Contact Form Submit** (表单提交)
3. **Purchase** (购买事件)
4. **Add to Cart** (添加到购物车)

### 3. 标签配置

#### Microsoft Clarity
- 标签类型：自定义 HTML
- HTML: `<script>(function(c,l,a,r,i,t,y){...})(window, document, "clarity", "script", "{{Clarity ID}}");</script>`
- 触发器：All Pages

#### PostHog
- 标签类型：自定义 HTML
- HTML: PostHog 初始化代码
- 触发器：All Pages

#### TikTok Pixel
- 标签类型：TikTok Pixel (如果有模板) 或自定义 HTML
- 配置：Pixel ID
- 触发器：All Pages

#### Umami
- 标签类型：自定义 HTML
- HTML: `<script async defer data-website-id="{{Umami Website ID}}" src="{{Umami URL}}/umami.js"></script>`
- 触发器：All Pages

### 4. 变量配置

创建以下变量：
- Clarity ID: 常量变量
- PostHog Key: 常量变量
- TikTok Pixel ID: 常量变量
- Umami Website ID: 常量变量
- Umami URL: 常量变量

### 5. 事件追踪

#### 标准电子商务事件
- purchase
- add_to_cart
- begin_checkout
- generate_lead

#### 自定义事件
- contact_form_submit
- newsletter_signup
- video_play
- file_download

## 🧪 测试步骤

1. 启用 GTM 预览模式
2. 访问网站
3. 检查所有标签是否触发
4. 验证 dataLayer 事件
5. 确认各分析工具接收数据

## 📊 发布流程

1. 在预览模式下完成测试
2. 提交更改
3. 添加版本名称和描述
4. 发布容器
5. 验证生产环境

EOF

    echo -e "${GREEN}✅ GTM 配置指南已创建${NC}"
    echo ""
}

# 创建验证脚本
create_verification_script() {
    echo -e "${BLUE}🔧 创建验证脚本${NC}"
    echo "----------------------------------------"
    
    cat > "$PROJECT_ROOT/scripts/verify-gtm-analytics.sh" << 'EOF'
#!/bin/bash

# GTM 和分析工具验证脚本

echo "🔍 GTM 和分析工具验证"
echo "=========================="

# 检查环境变量
echo "📝 检查环境变量..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    
    if grep -q "NEXT_PUBLIC_GTM_ID" .env.local; then
        GTM_ID=$(grep "NEXT_PUBLIC_GTM_ID" .env.local | cut -d'=' -f2)
        echo "✅ GTM ID: $GTM_ID"
    else
        echo "❌ GTM ID 未配置"
    fi
else
    echo "❌ .env.local 文件不存在"
fi

# 检查组件文件
echo ""
echo "📁 检查组件文件..."
COMPONENTS=(
    "src/components/analytics/GTMContainer.tsx"
    "src/components/analytics/UnifiedTracking.tsx"
    "src/components/analytics/ConsentManager.tsx"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo "✅ $component"
    else
        echo "❌ $component"
    fi
done

# 检查 Layout 文件
echo ""
echo "🔧 检查 Layout 文件..."
LAYOUT_FILE="src/app/[locale]/layout.tsx"
if [ -f "$LAYOUT_FILE" ]; then
    if grep -q "GTMContainer" "$LAYOUT_FILE"; then
        echo "✅ Layout 文件包含 GTM 组件"
    else
        echo "⚠️  Layout 文件可能需要手动更新"
    fi
else
    echo "❌ Layout 文件不存在"
fi

echo ""
echo "📋 下一步操作："
echo "1. 启动开发服务器: npm run dev"
echo "2. 打开浏览器开发者工具"
echo "3. 检查 Network 标签中的 GTM 请求"
echo "4. 在 Console 中验证: console.log(window.dataLayer)"
echo "5. 使用 GTM 预览模式测试标签"

EOF

    chmod +x "$PROJECT_ROOT/scripts/verify-gtm-analytics.sh"
    echo -e "${GREEN}✅ 验证脚本已创建${NC}"
    echo ""
}

# 显示完成总结
show_completion_summary() {
    echo -e "${GREEN}🎉 GTM 多平台分析工具集成设置完成！${NC}"
    echo "========================================"
    echo ""
    echo -e "${BLUE}📋 已完成的设置：${NC}"
    echo "✅ 环境变量配置"
    echo "✅ GTM 组件创建"
    echo "✅ 统一追踪系统"
    echo "✅ 同意管理组件"
    echo "✅ 配置指南文档"
    echo "✅ 验证脚本"
    echo ""
    echo -e "${YELLOW}⚠️  手动操作要求：${NC}"
    echo "1. 检查并更新 Layout 文件"
    echo "2. 在 GTM 中配置标签和触发器"
    echo "3. 测试各分析工具"
    echo ""
    echo -e "${BLUE}📚 相关文件：${NC}"
    echo "- GTM 配置指南: scripts/gtm-config-guide.md"
    echo "- 详细集成指南: scripts/gtm-analytics-integration-guide.md"
    echo "- 验证脚本: scripts/verify-gtm-analytics.sh"
    echo ""
    echo -e "${BLUE}🚀 下一步操作：${NC}"
    echo "1. 运行: ./scripts/verify-gtm-analytics.sh"
    echo "2. 启动开发服务器: npm run dev"
    echo "3. 配置 GTM 容器 (参考 gtm-config-guide.md)"
    echo "4. 测试各分析工具的数据收集"
    echo ""
    echo -e "${GREEN}🎯 现在你可以通过 GTM 集中管理：${NC}"
    echo "• Microsoft Clarity"
    echo "• PostHog"
    echo "• TikTok Pixel"
    echo "• Umami"
    echo "• Rybbit"
    echo "• 以及现有的 GA4 和 Meta Pixel"
}

# 主函数
main() {
    check_environment
    get_gtm_id
    get_analytics_configs
    update_env_variables
    create_gtm_component
    update_layout
    create_gtm_config_guide
    create_verification_script
    show_completion_summary
}

# 执行主程序
main "$@" 