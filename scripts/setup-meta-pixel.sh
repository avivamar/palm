#!/bin/bash

# Meta Pixel 自动配置脚本

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Meta Pixel 自动配置${NC}"
echo "========================================"

# 检查项目根目录
PROJECT_ROOT=$(pwd)
SRC_DIR="$PROJECT_ROOT/src"

# 获取Meta Pixel ID
get_pixel_id() {
    echo -e "${BLUE}📱 Meta Pixel ID 配置${NC}"
    echo "----------------------------------------"
    
    # 检查是否已有Pixel ID
    if [ -f ".env.local" ] && grep -q "NEXT_PUBLIC_META_PIXEL_ID" ".env.local"; then
        existing_id=$(grep "NEXT_PUBLIC_META_PIXEL_ID" ".env.local" | cut -d'=' -f2)
        echo -e "${YELLOW}发现现有的Pixel ID: $existing_id${NC}"
        read -p "是否使用现有的Pixel ID? (y/N): " use_existing
        
        if [[ $use_existing =~ ^[Yy]$ ]]; then
            PIXEL_ID="$existing_id"
            return 0
        fi
    fi
    
    echo -e "${YELLOW}请输入您的Meta Pixel ID:${NC}"
    echo "💡 您可以在 Facebook Business Manager > Events Manager 中找到它"
    echo "   格式通常类似: 123456789012345"
    echo ""
    read -p "Meta Pixel ID: " PIXEL_ID
    
    if [ -z "$PIXEL_ID" ]; then
        echo -e "${RED}❌ Pixel ID不能为空${NC}"
        exit 1
    fi
    
    echo ""
}

# 创建或更新环境变量
setup_env_variables() {
    echo -e "${BLUE}🔧 配置环境变量${NC}"
    echo "----------------------------------------"
    
    # 创建或更新.env.local
    if [ ! -f ".env.local" ]; then
        echo "# Meta Pixel Configuration" > .env.local
        echo "NEXT_PUBLIC_META_PIXEL_ID=$PIXEL_ID" >> .env.local
        echo -e "${GREEN}✅ 创建.env.local并添加Meta Pixel ID${NC}"
    else
        # 检查是否已存在
        if grep -q "NEXT_PUBLIC_META_PIXEL_ID" ".env.local"; then
            # 更新现有行
            sed -i.bak "s/NEXT_PUBLIC_META_PIXEL_ID=.*/NEXT_PUBLIC_META_PIXEL_ID=$PIXEL_ID/" .env.local
            echo -e "${GREEN}✅ 更新.env.local中的Meta Pixel ID${NC}"
        else
            # 添加新行
            echo "" >> .env.local
            echo "# Meta Pixel Configuration" >> .env.local
            echo "NEXT_PUBLIC_META_PIXEL_ID=$PIXEL_ID" >> .env.local
            echo -e "${GREEN}✅ 在.env.local中添加Meta Pixel ID${NC}"
        fi
    fi
    
    echo ""
}

# 创建Meta Pixel组件
create_pixel_component() {
    echo -e "${BLUE}🧩 创建Meta Pixel组件${NC}"
    echo "----------------------------------------"
    
    COMPONENT_FILE="$SRC_DIR/components/MetaPixel.tsx"
    
    # 创建components目录（如果不存在）
    mkdir -p "$SRC_DIR/components"
    
    cat > "$COMPONENT_FILE" << 'EOF'
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    fbq: any
  }
}

interface MetaPixelProps {
  pixelId: string
}

export function MetaPixel({ pixelId }: MetaPixelProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pixelId) return

    // 初始化Meta Pixel
    const initPixel = () => {
      if (typeof window !== 'undefined') {
        // 加载Facebook Pixel脚本
        const script = document.createElement('script')
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `
        document.head.appendChild(script)

        // 添加noscript标签
        const noscript = document.createElement('noscript')
        noscript.innerHTML = `
          <img height="1" width="1" style="display:none"
               src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />
        `
        document.head.appendChild(noscript)
      }
    }

    initPixel()
  }, [pixelId])

  useEffect(() => {
    // 路由变化时追踪页面浏览
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView')
    }
  }, [pathname, searchParams])

  return null
}

// 自定义Hook用于追踪事件
export function useMetaPixel() {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, parameters)
    }
  }

  const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, parameters)
    }
  }

  return {
    trackEvent,
    trackCustomEvent,
    // 常用事件的便捷方法
    trackPurchase: (value: number, currency = 'USD') => 
      trackEvent('Purchase', { value, currency }),
    trackAddToCart: (contentName: string, value?: number, currency = 'USD') =>
      trackEvent('AddToCart', { content_name: contentName, value, currency }),
    trackContact: () => trackEvent('Contact'),
    trackLead: () => trackEvent('Lead'),
    trackCompleteRegistration: () => trackEvent('CompleteRegistration'),
  }
}
EOF

    echo -e "${GREEN}✅ 创建Meta Pixel组件: $COMPONENT_FILE${NC}"
    echo ""
}

# 更新Layout文件
update_layout() {
    echo -e "${BLUE}📱 更新Layout文件${NC}"
    echo "----------------------------------------"
    
    LAYOUT_FILE="$SRC_DIR/app/[locale]/layout.tsx"
    
    if [ ! -f "$LAYOUT_FILE" ]; then
        echo -e "${RED}❌ 未找到Layout文件: $LAYOUT_FILE${NC}"
        return 1
    fi
    
    # 检查是否已经集成
    if grep -q "MetaPixel" "$LAYOUT_FILE"; then
        echo -e "${YELLOW}⚠️  Layout文件中已存在Meta Pixel集成${NC}"
        read -p "是否重新配置? (y/N): " reconfigure
        
        if [[ ! $reconfigure =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}跳过Layout更新${NC}"
            return 0
        fi
    fi
    
    # 备份原文件
    cp "$LAYOUT_FILE" "$LAYOUT_FILE.backup"
    
    # 添加MetaPixel导入
    if ! grep -q "import { MetaPixel }" "$LAYOUT_FILE"; then
        # 在其他导入后添加MetaPixel导入
        sed -i.tmp '/^import.*from.*$/a\
import { MetaPixel } from '"'"'@/components/MetaPixel'"'"';' "$LAYOUT_FILE"
    fi
    
    # 在body标签内添加MetaPixel组件
    if ! grep -q "<MetaPixel" "$LAYOUT_FILE"; then
        sed -i.tmp '/<GoogleAnalytics/a\
        \
        {/* Meta Pixel */}\
        <MetaPixel pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID!} />' "$LAYOUT_FILE"
    fi
    
    # 清理临时文件
    rm -f "$LAYOUT_FILE.tmp"
    
    echo -e "${GREEN}✅ 更新Layout文件并集成Meta Pixel${NC}"
    echo ""
}

# 创建使用示例
create_usage_examples() {
    echo -e "${BLUE}📚 创建使用示例${NC}"
    echo "----------------------------------------"
    
    EXAMPLE_FILE="$SRC_DIR/examples/meta-pixel-usage.tsx"
    mkdir -p "$SRC_DIR/examples"
    
    cat > "$EXAMPLE_FILE" << 'EOF'
// Meta Pixel 使用示例

import { useMetaPixel } from '@/components/MetaPixel'

export function ProductPage() {
  const { trackEvent, trackAddToCart, trackPurchase } = useMetaPixel()

  const handleAddToCart = (product: any) => {
    // 追踪添加到购物车事件
    trackAddToCart(product.name, product.price, 'USD')
  }

  const handlePurchase = (order: any) => {
    // 追踪购买事件
    trackPurchase(order.total, 'USD')
  }

  const handleContactForm = () => {
    // 追踪联系表单提交
    trackEvent('Contact')
  }

  const handleCustomEvent = () => {
    // 追踪自定义事件
    trackEvent('CustomEvent', {
      custom_parameter: 'value',
      user_type: 'premium'
    })
  }

  return (
    <div>
      <h1>产品页面</h1>
      <button onClick={handleAddToCart}>添加到购物车</button>
      <button onClick={handlePurchase}>立即购买</button>
      <button onClick={handleContactForm}>联系我们</button>
      <button onClick={handleCustomEvent}>自定义事件</button>
    </div>
  )
}

// 在联系表单中使用
export function ContactForm() {
  const { trackEvent } = useMetaPixel()

  const handleSubmit = async (formData: any) => {
    try {
      // 提交表单逻辑
      await submitForm(formData)
      
      // 追踪成功提交
      trackEvent('Lead', {
        content_name: 'Contact Form',
        content_category: 'Contact'
      })
    } catch (error) {
      console.error('Form submission failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
    </form>
  )
}

// 在购物车页面中使用
export function Cart() {
  const { trackEvent } = useMetaPixel()

  const handleCheckout = () => {
    trackEvent('InitiateCheckout', {
      content_ids: ['product1', 'product2'],
      content_type: 'product',
      value: 99.99,
      currency: 'USD'
    })
  }

  return (
    <div>
      {/* 购物车内容 */}
      <button onClick={handleCheckout}>结账</button>
    </div>
  )
}
EOF

    echo -e "${GREEN}✅ 创建使用示例: $EXAMPLE_FILE${NC}"
    echo ""
}

# 创建验证脚本
create_verification_script() {
    echo -e "${BLUE}🔍 创建验证脚本${NC}"
    echo "----------------------------------------"
    
    VERIFY_FILE="scripts/verify-meta-pixel.sh"
    
    cat > "$VERIFY_FILE" << 'EOF'
#!/bin/bash

# Meta Pixel 验证脚本

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Meta Pixel 验证${NC}"
echo "========================================"

# 检查本地环境变量
echo -e "${YELLOW}1. 检查环境变量${NC}"
if [ -f ".env.local" ] && grep -q "NEXT_PUBLIC_META_PIXEL_ID" ".env.local"; then
    pixel_id=$(grep "NEXT_PUBLIC_META_PIXEL_ID" ".env.local" | cut -d'=' -f2)
    echo -e "${GREEN}✅ Pixel ID: $pixel_id${NC}"
else
    echo -e "${RED}❌ 未找到Meta Pixel ID环境变量${NC}"
fi

# 检查组件文件
echo -e "${YELLOW}2. 检查组件文件${NC}"
if [ -f "src/components/MetaPixel.tsx" ]; then
    echo -e "${GREEN}✅ Meta Pixel组件已创建${NC}"
else
    echo -e "${RED}❌ Meta Pixel组件未找到${NC}"
fi

# 检查Layout集成
echo -e "${YELLOW}3. 检查Layout集成${NC}"
if [ -f "src/app/[locale]/layout.tsx" ] && grep -q "MetaPixel" "src/app/[locale]/layout.tsx"; then
    echo -e "${GREEN}✅ Layout已集成Meta Pixel${NC}"
else
    echo -e "${RED}❌ Layout未集成Meta Pixel${NC}"
fi

# 检查在线网站
echo -e "${YELLOW}4. 检查在线网站${NC}"
if command -v curl &> /dev/null; then
    if curl -s "https://www.rolitt.com" | grep -q "fbq\|connect.facebook.net"; then
        echo -e "${GREEN}✅ 网站上检测到Meta Pixel${NC}"
    else
        echo -e "${RED}❌ 网站上未检测到Meta Pixel${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  无法检查在线网站${NC}"
fi

echo ""
echo -e "${BLUE}💡 验证工具${NC}"
echo "1. Facebook Pixel Helper Chrome扩展"
echo "2. Facebook Events Manager实时事件"
echo "3. 浏览器开发者工具网络面板"
EOF

    chmod +x "$VERIFY_FILE"
    echo -e "${GREEN}✅ 创建验证脚本: $VERIFY_FILE${NC}"
    echo ""
}

# 显示后续步骤
show_next_steps() {
    echo -e "${BLUE}📋 配置完成 - 后续步骤${NC}"
    echo "========================================"
    echo ""
    echo -e "${GREEN}🎉 Meta Pixel已成功配置！${NC}"
    echo ""
    echo -e "${YELLOW}立即验证:${NC}"
    echo "1. 运行 ./scripts/verify-meta-pixel.sh"
    echo "2. 启动开发服务器: npm run dev"
    echo "3. 访问 http://localhost:3000"
    echo "4. 在浏览器开发者工具中检查网络请求"
    echo ""
    echo -e "${YELLOW}生产环境验证:${NC}"
    echo "1. 部署到生产环境"
    echo "2. 安装Facebook Pixel Helper Chrome扩展"
    echo "3. 访问 https://www.rolitt.com"
    echo "4. 检查Facebook Events Manager中的实时事件"
    echo ""
    echo -e "${YELLOW}推荐的测试事件:${NC}"
    echo "- PageView (页面浏览) - 自动追踪"
    echo "- Contact (联系我们表单)"
    echo "- Lead (潜在客户生成)"
    echo "- AddToCart (添加到购物车)"
    echo "- Purchase (购买完成)"
    echo ""
    echo -e "${BLUE}使用示例:${NC}"
    echo "查看 src/examples/meta-pixel-usage.tsx"
}

# 主函数
main() {
    get_pixel_id
    setup_env_variables
    create_pixel_component
    update_layout
    create_usage_examples
    create_verification_script
    show_next_steps
    
    echo ""
    echo -e "${GREEN}🎉 Meta Pixel配置完成！${NC}"
    echo "========================================"
}

# 执行主程序
main 