#!/bin/bash

# DNS优化脚本 - 修复SPF重复和添加Amazon SES支持
# 基于ChatGPT分析的建议进行优化

ZONE_ID="5a543f071db6884ca6ff442328a8529e"
API_TOKEN="XDnRO_pVethMsqGoINViAZ868VgtkRY2WjUAnHxy"
DOMAIN="rolitt.com"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 DNS优化工具 - 基于ChatGPT分析${NC}"
echo "========================================"

# API请求函数
cf_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X $method "https://api.cloudflare.com/client/v4$endpoint" \
             -H "Authorization: Bearer $API_TOKEN" \
             -H "Content-Type: application/json" \
             --data "$data"
    else
        curl -s -X $method "https://api.cloudflare.com/client/v4$endpoint" \
             -H "Authorization: Bearer $API_TOKEN" \
             -H "Content-Type: application/json"
    fi
}

# 获取所有SPF记录
get_spf_records() {
    cf_api "GET" "/zones/$ZONE_ID/dns_records?name=$DOMAIN&type=TXT" | \
    python3 -c "
import sys, json
data = json.load(sys.stdin)
for record in data['result']:
    if 'v=spf1' in record['content']:
        print(f\"{record['id']}:{record['content']}\")
"
}

# 删除DNS记录
delete_record() {
    local record_id=$1
    cf_api "DELETE" "/zones/$ZONE_ID/dns_records/$record_id"
}

# 创建新的SPF记录
create_spf_record() {
    local content=$1
    cf_api "POST" "/zones/$ZONE_ID/dns_records" \
           "{\"type\":\"TXT\",\"name\":\"$DOMAIN\",\"content\":\"$content\",\"ttl\":1}"
}

echo -e "${BLUE}🔍 分析当前SPF记录${NC}"
echo "========================================"

# 获取当前SPF记录
spf_records=$(get_spf_records)
echo -e "${YELLOW}当前SPF记录:${NC}"
echo "$spf_records" | while IFS=':' read -r id content; do
    echo "  ID: $id"
    echo "  内容: $content"
    echo ""
done

# 计算SPF记录数量
spf_count=$(echo "$spf_records" | wc -l | tr -d ' ')
echo -e "${BLUE}发现 $spf_count 条SPF记录${NC}"

if [ "$spf_count" -gt 1 ]; then
    echo -e "${RED}❌ 检测到SPF记录重复问题${NC}"
    echo -e "${YELLOW}⚠️  多条SPF记录会导致邮件验证失败${NC}"
    echo ""
    
    echo -e "${BLUE}🔧 开始修复SPF记录${NC}"
    echo "========================================"
    
    # 删除所有现有SPF记录
    echo -e "${YELLOW}🗑️  删除现有SPF记录...${NC}"
    echo "$spf_records" | while IFS=':' read -r id content; do
        if [ -n "$id" ]; then
            echo "删除记录 ID: $id"
            delete_result=$(delete_record "$id")
            success=$(echo "$delete_result" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', False))")
            if [ "$success" = "True" ]; then
                echo -e "${GREEN}✅ 删除成功${NC}"
            else
                echo -e "${RED}❌ 删除失败: $delete_result${NC}"
            fi
        fi
    done
    
    echo ""
    echo -e "${BLUE}📝 创建优化的SPF记录${NC}"
    
    # 创建新的合并SPF记录
    # 包含: Zoho + Cloudflare + Klaviyo + Amazon SES
    NEW_SPF="v=spf1 include:zohomail.com include:_spf.mx.cloudflare.net include:_spf.klaviyo.com include:amazonses.com ~all"
    
    echo -e "${YELLOW}新SPF记录内容:${NC}"
    echo "$NEW_SPF"
    echo ""
    
    create_result=$(create_spf_record "$NEW_SPF")
    success=$(echo "$create_result" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', False))")
    
    if [ "$success" = "True" ]; then
        echo -e "${GREEN}✅ 新SPF记录创建成功${NC}"
        echo ""
        echo -e "${BLUE}📋 优化内容说明:${NC}"
        echo "• include:zohomail.com - Zoho邮件服务"
        echo "• include:_spf.mx.cloudflare.net - Cloudflare邮件"
        echo "• include:_spf.klaviyo.com - Klaviyo营销邮件"
        echo "• include:amazonses.com - Amazon SES发信服务"
        echo "• ~all - 软失败模式"
    else
        echo -e "${RED}❌ 创建失败: $create_result${NC}"
    fi
    
else
    echo -e "${GREEN}✅ SPF记录数量正常${NC}"
    
    # 检查是否包含Amazon SES
    if echo "$spf_records" | grep -q "amazonses.com"; then
        echo -e "${GREEN}✅ 已包含Amazon SES支持${NC}"
    else
        echo -e "${YELLOW}⚠️  缺少Amazon SES支持${NC}"
        echo -e "${BLUE}🔧 添加Amazon SES支持...${NC}"
        
        # 获取当前SPF记录内容
        current_spf=$(echo "$spf_records" | cut -d':' -f2-)
        current_id=$(echo "$spf_records" | cut -d':' -f1)
        
        # 在~all前添加amazonses.com
        new_spf=$(echo "$current_spf" | sed 's/ ~all/ include:amazonses.com ~all/')
        
        echo -e "${YELLOW}更新SPF记录:${NC}"
        echo "原内容: $current_spf"
        echo "新内容: $new_spf"
        
        # 更新记录
        update_result=$(cf_api "PUT" "/zones/$ZONE_ID/dns_records/$current_id" \
                       "{\"type\":\"TXT\",\"name\":\"$DOMAIN\",\"content\":\"$new_spf\",\"ttl\":1}")
        
        success=$(echo "$update_result" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', False))")
        
        if [ "$success" = "True" ]; then
            echo -e "${GREEN}✅ SPF记录更新成功${NC}"
        else
            echo -e "${RED}❌ 更新失败: $update_result${NC}"
        fi
    fi
fi

echo ""
echo -e "${BLUE}🎉 DNS优化完成${NC}"
echo "========================================"
echo -e "${YELLOW}⏰ 等待15-30分钟让DNS传播，然后运行验证${NC}"
echo ""
echo "验证命令:"
echo "  ./scripts/verify-fix.sh"
echo "  ./scripts/check-spf-propagation.sh" 