#!/bin/bash

# DNS修复验证脚本
# 检查DMARC和SPF记录是否已正确更新

DOMAIN="rolitt.com"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 DNS修复验证 - $(date)${NC}"
echo "========================================"

# 检查DMARC记录
echo -e "\n${BLUE}📋 检查DMARC记录${NC}"
echo "查询: _dmarc.$DOMAIN"
echo "----------------------------------------"

dmarc_result=$(dig +short TXT _dmarc.$DOMAIN | tr -d '"')
if [ -z "$dmarc_result" ]; then
    echo -e "${RED}❌ 未找到DMARC记录${NC}"
else
    echo -e "${GREEN}✅ DMARC记录存在:${NC}"
    echo "$dmarc_result"
    
    # 检查是否包含adkim=r
    if echo "$dmarc_result" | grep -q "adkim=r"; then
        echo -e "${GREEN}✅ DKIM对齐模式已修复 (adkim=r)${NC}"
    elif echo "$dmarc_result" | grep -q "adkim=s"; then
        echo -e "${RED}❌ 仍然是严格模式 (adkim=s) - 需要修改为 adkim=r${NC}"
    else
        echo -e "${YELLOW}⚠️  未找到adkim参数${NC}"
    fi
fi

# 检查SPF记录
echo -e "\n${BLUE}📋 检查SPF记录${NC}"
echo "查询: $DOMAIN"
echo "----------------------------------------"

spf_result=$(dig +short TXT $DOMAIN | grep "v=spf1" | tr -d '"')
if [ -z "$spf_result" ]; then
    echo -e "${RED}❌ 未找到SPF记录${NC}"
else
    echo -e "${GREEN}✅ SPF记录存在:${NC}"
    echo "$spf_result"
    
    # 检查是否包含klaviyo
    if echo "$spf_result" | grep -q "_spf.klaviyo.com"; then
        echo -e "${GREEN}✅ Klaviyo支持已添加${NC}"
    else
        echo -e "${RED}❌ 缺少Klaviyo支持 - 需要添加 include:_spf.klaviyo.com${NC}"
    fi
    
    # 检查其他必要的include
    if echo "$spf_result" | grep -q "zohomail.com"; then
        echo -e "${GREEN}✅ Zoho邮件支持正常${NC}"
    else
        echo -e "${YELLOW}⚠️  缺少Zoho邮件支持${NC}"
    fi
    
    if echo "$spf_result" | grep -q "_spf.mx.cloudflare.net"; then
        echo -e "${GREEN}✅ Cloudflare邮件支持正常${NC}"
    else
        echo -e "${YELLOW}⚠️  缺少Cloudflare邮件支持${NC}"
    fi
fi

# 总结
echo -e "\n${BLUE}📊 修复状态总结${NC}"
echo "========================================"

# 检查修复状态
dmarc_fixed=false
spf_fixed=false

if echo "$dmarc_result" | grep -q "adkim=r"; then
    dmarc_fixed=true
fi

if echo "$spf_result" | grep -q "_spf.klaviyo.com"; then
    spf_fixed=true
fi

if [ "$dmarc_fixed" = true ] && [ "$spf_fixed" = true ]; then
    echo -e "${GREEN}🎉 所有问题已修复！${NC}"
    echo -e "${GREEN}✅ DMARC DKIM对齐已设为宽松模式${NC}"
    echo -e "${GREEN}✅ SPF记录已包含Klaviyo支持${NC}"
    echo ""
    echo -e "${BLUE}📈 预期效果:${NC}"
    echo "- 24-48小时内DKIM对齐成功率提升到100%"
    echo "- 邮件投递率改善"
    echo "- 减少进入垃圾邮件文件夹"
elif [ "$dmarc_fixed" = true ]; then
    echo -e "${YELLOW}⚠️  部分修复完成${NC}"
    echo -e "${GREEN}✅ DMARC记录已修复${NC}"
    echo -e "${RED}❌ SPF记录仍需修复${NC}"
elif [ "$spf_fixed" = true ]; then
    echo -e "${YELLOW}⚠️  部分修复完成${NC}"
    echo -e "${RED}❌ DMARC记录仍需修复${NC}"
    echo -e "${GREEN}✅ SPF记录已修复${NC}"
else
    echo -e "${RED}❌ 问题尚未修复${NC}"
    echo ""
    echo -e "${BLUE}📋 需要执行的操作:${NC}"
    echo "1. 登录 https://dash.cloudflare.com"
    echo "2. 选择 rolitt.com 域名"
    echo "3. 进入 DNS Records 页面"
    echo "4. 参考 scripts/cloudflare-manual-fix.md 进行修改"
fi

echo ""
echo -e "${BLUE}🔄 如果刚刚修改了DNS记录，请等待15-30分钟后重新运行此脚本${NC}" 