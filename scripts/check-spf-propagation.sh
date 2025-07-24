#!/bin/bash

# SPF记录传播检查脚本
# 检查SPF记录是否已包含Klaviyo支持

DOMAIN="rolitt.com"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 SPF记录传播检查 - $(date)${NC}"
echo "========================================"

echo -e "${BLUE}📋 检查SPF记录传播状态${NC}"
echo "查询: $DOMAIN"
echo "----------------------------------------"

# 检查本地DNS
echo -e "${YELLOW}🌐 本地DNS查询:${NC}"
spf_local=$(dig +short TXT $DOMAIN | grep "v=spf1" | tr -d '"')
echo "$spf_local"

if echo "$spf_local" | grep -q "_spf.klaviyo.com"; then
    echo -e "${GREEN}✅ 本地DNS已包含Klaviyo支持${NC}"
    local_ok=true
else
    echo -e "${RED}❌ 本地DNS尚未更新${NC}"
    local_ok=false
fi

echo ""

# 检查Google DNS
echo -e "${YELLOW}🌐 Google DNS (8.8.8.8) 查询:${NC}"
spf_google=$(dig @8.8.8.8 +short TXT $DOMAIN | grep "v=spf1" | tr -d '"')
echo "$spf_google"

if echo "$spf_google" | grep -q "_spf.klaviyo.com"; then
    echo -e "${GREEN}✅ Google DNS已包含Klaviyo支持${NC}"
    google_ok=true
else
    echo -e "${RED}❌ Google DNS尚未更新${NC}"
    google_ok=false
fi

echo ""

# 检查Cloudflare DNS
echo -e "${YELLOW}🌐 Cloudflare DNS (1.1.1.1) 查询:${NC}"
spf_cf=$(dig @1.1.1.1 +short TXT $DOMAIN | grep "v=spf1" | tr -d '"')
echo "$spf_cf"

if echo "$spf_cf" | grep -q "_spf.klaviyo.com"; then
    echo -e "${GREEN}✅ Cloudflare DNS已包含Klaviyo支持${NC}"
    cf_ok=true
else
    echo -e "${RED}❌ Cloudflare DNS尚未更新${NC}"
    cf_ok=false
fi

echo ""
echo -e "${BLUE}📊 传播状态总结${NC}"
echo "========================================"

if [ "$local_ok" = true ] && [ "$google_ok" = true ] && [ "$cf_ok" = true ]; then
    echo -e "${GREEN}🎉 SPF记录已在所有DNS服务器传播完成！${NC}"
    echo -e "${GREEN}✅ 本地DNS: 已更新${NC}"
    echo -e "${GREEN}✅ Google DNS: 已更新${NC}"
    echo -e "${GREEN}✅ Cloudflare DNS: 已更新${NC}"
    echo ""
    echo -e "${BLUE}🎯 所有DNS修复已完成！${NC}"
    echo "- DMARC DKIM对齐问题已解决"
    echo "- SPF记录已包含Klaviyo支持"
    echo "- 24-48小时内邮件投递率将显著改善"
elif [ "$local_ok" = true ]; then
    echo -e "${YELLOW}⏰ SPF记录正在传播中...${NC}"
    echo -e "${GREEN}✅ 本地DNS: 已更新${NC}"
    echo -e "${RED}❌ Google DNS: 传播中${NC}"
    echo -e "${RED}❌ Cloudflare DNS: 传播中${NC}"
    echo ""
    echo -e "${BLUE}💡 建议: 10-15分钟后重新运行此脚本${NC}"
else
    echo -e "${RED}⏰ SPF记录仍在传播中...${NC}"
    echo -e "${RED}❌ 所有DNS服务器都在传播中${NC}"
    echo ""
    echo -e "${BLUE}💡 建议: 15-30分钟后重新运行此脚本${NC}"
fi

echo ""
echo -e "${BLUE}🔄 重新检查命令: ./scripts/check-spf-propagation.sh${NC}" 