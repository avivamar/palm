#!/bin/bash

# Meta Pixel 配置检查和修复脚本

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Meta Pixel 配置检查${NC}"
echo "========================================"

# 检查项目根目录
PROJECT_ROOT=$(pwd)
SRC_DIR="$PROJECT_ROOT/src"

# 检查函数
check_package_installed() {
    echo -e "${BLUE}📦 检查react-facebook-pixel包${NC}"
    echo "----------------------------------------"
    
    if grep -q '"react-facebook-pixel"' package.json; then
        version=$(grep '"react-facebook-pixel"' package.json | sed 's/.*"react-facebook-pixel": "\([^"]*\)".*/\1/')
        echo -e "${GREEN}✅ react-facebook-pixel已安装 (版本: $version)${NC}"
        return 0
    else
        echo -e "${RED}❌ react-facebook-pixel未安装${NC}"
        return 1
    fi
    echo ""
}

# 检查环境变量
check_env_variables() {
    echo -e "${BLUE}🔧 检查环境变量${NC}"
    echo "----------------------------------------"
    
    env_files=(".env" ".env.local" ".env.production")
    found_env=false
    
    for env_file in "${env_files[@]}"; do
        if [ -f "$env_file" ]; then
            echo -e "${YELLOW}检查 $env_file${NC}"
            
            if grep -q "FACEBOOK_PIXEL_ID\|META_PIXEL_ID\|NEXT_PUBLIC_FACEBOOK_PIXEL_ID\|NEXT_PUBLIC_META_PIXEL_ID" "$env_file" 2>/dev/null; then
                echo -e "${GREEN}✅ 在 $env_file 中找到Meta Pixel ID配置${NC}"
                grep "FACEBOOK_PIXEL_ID\|META_PIXEL_ID\|NEXT_PUBLIC_FACEBOOK_PIXEL_ID\|NEXT_PUBLIC_META_PIXEL_ID" "$env_file" 2>/dev/null
                found_env=true
            fi
        fi
    done
    
    if [ "$found_env" = false ]; then
        echo -e "${RED}❌ 未找到Meta Pixel ID环境变量${NC}"
        echo -e "${YELLOW}💡 需要在.env.local中添加: NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id${NC}"
    fi
    
    echo ""
}

# 检查组件文件
check_pixel_component() {
    echo -e "${BLUE}🧩 检查Meta Pixel组件${NC}"
    echo "----------------------------------------"
    
    # 搜索可能的Meta Pixel组件
    pixel_files=$(find "$SRC_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs grep -l "facebook-pixel\|fbq\|ReactPixel" 2>/dev/null || true)
    
    if [ -n "$pixel_files" ]; then
        echo -e "${GREEN}✅ 找到Meta Pixel相关文件:${NC}"
        echo "$pixel_files"
    else
        echo -e "${RED}❌ 未找到Meta Pixel组件文件${NC}"
    fi
    
    echo ""
}

# 检查layout文件中的Pixel集成
check_layout_integration() {
    echo -e "${BLUE}📱 检查Layout中的Meta Pixel集成${NC}"
    echo "----------------------------------------"
    
    layout_files=("$SRC_DIR/app/layout.tsx" "$SRC_DIR/app/[locale]/layout.tsx")
    
    for layout_file in "${layout_files[@]}"; do
        if [ -f "$layout_file" ]; then
            echo -e "${YELLOW}检查 $layout_file${NC}"
            
            if grep -q "facebook-pixel\|fbq\|ReactPixel\|MetaPixel" "$layout_file"; then
                echo -e "${GREEN}✅ 在 $layout_file 中找到Meta Pixel集成${NC}"
            else
                echo -e "${RED}❌ 在 $layout_file 中未找到Meta Pixel集成${NC}"
            fi
        fi
    done
    
    echo ""
}

# 检查网站中的实际Pixel脚本
check_website_pixel() {
    echo -e "${BLUE}🌐 检查网站中的Meta Pixel脚本${NC}"
    echo "----------------------------------------"
    
    echo "正在检查 https://www.rolitt.com 上的Meta Pixel..."
    
    # 使用curl检查网站源码
    if command -v curl &> /dev/null; then
        pixel_found=$(curl -s "https://www.rolitt.com" | grep -o "fbq\|facebook-pixel\|connect.facebook.net" | head -1)
        
        if [ -n "$pixel_found" ]; then
            echo -e "${GREEN}✅ 在网站上检测到Meta Pixel脚本${NC}"
            echo "   检测到: $pixel_found"
        else
            echo -e "${RED}❌ 在网站上未检测到Meta Pixel脚本${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  curl未安装，无法检查在线网站${NC}"
    fi
    
    echo ""
}

# 检查Facebook Business Manager配置
check_facebook_business() {
    echo -e "${BLUE}🏢 Facebook Business Manager检查${NC}"
    echo "----------------------------------------"
    
    echo -e "${YELLOW}请手动检查以下项目:${NC}"
    echo "1. 登录 https://business.facebook.com"
    echo "2. 进入 Events Manager (事件管理器)"
    echo "3. 检查您的Pixel是否已创建并处于活跃状态"
    echo "4. 确认域名 rolitt.com 已验证并关联到Pixel"
    echo "5. 检查最近的Pixel事件活动"
    
    echo ""
}

# 生成配置建议
generate_recommendations() {
    echo -e "${BLUE}💡 配置建议${NC}"
    echo "========================================"
    
    echo -e "${YELLOW}1. 环境变量配置${NC}"
    echo "   在.env.local中添加:"
    echo "   NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id_here"
    echo ""
    
    echo -e "${YELLOW}2. 创建Meta Pixel组件${NC}"
    echo "   创建 src/components/MetaPixel.tsx"
    echo ""
    
    echo -e "${YELLOW}3. 在Layout中集成${NC}"
    echo "   在 src/app/[locale]/layout.tsx 中添加Meta Pixel组件"
    echo ""
    
    echo -e "${YELLOW}4. 测试和验证${NC}"
    echo "   - 使用Facebook Pixel Helper Chrome扩展"
    echo "   - 检查Facebook Events Manager中的实时事件"
    echo "   - 验证页面浏览和转化事件"
    echo ""
}

# 主函数
main() {
    check_package_installed
    check_env_variables
    check_pixel_component
    check_layout_integration
    check_website_pixel
    check_facebook_business
    generate_recommendations
    
    echo -e "${GREEN}🎉 Meta Pixel检查完成！${NC}"
    echo "========================================"
    echo ""
    echo -e "${BLUE}下一步:${NC}"
    echo "1. 运行 ./scripts/setup-meta-pixel.sh 来自动配置Meta Pixel"
    echo "2. 或者手动按照上述建议进行配置"
}

# 执行主程序
main 