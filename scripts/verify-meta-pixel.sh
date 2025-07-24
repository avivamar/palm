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
