#!/bin/bash

# Cloudflare API DNS更新脚本 - rolitt.com
# 用途：通过API自动更新DMARC和SPF记录
# 使用前需要配置Cloudflare API Token

# 配置信息 (需要用户填写)
ZONE_ID="5a543f071db6884ca6ff442328a8529e"          # 在Cloudflare Dashboard右侧可以找到
API_TOKEN="XDnRO_pVethMsqGoINViAZ868VgtkRY2WjUAnHxy"        # 需要DNS编辑权限的API Token
DOMAIN="rolitt.com"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Cloudflare API DNS更新工具${NC}"
echo "========================================"

# 检查必要的配置
check_config() {
    if [ -z "$ZONE_ID" ] || [ -z "$API_TOKEN" ]; then
        echo -e "${RED}❌ 配置不完整！${NC}"
        echo ""
        echo "请编辑此脚本并填写以下信息："
        echo "1. ZONE_ID: 在Cloudflare Dashboard右侧找到Zone ID"
        echo "2. API_TOKEN: 创建具有DNS编辑权限的API Token"
        echo ""
        echo "📖 获取API Token步骤："
        echo "1. 登录 https://dash.cloudflare.com/profile/api-tokens"
        echo "2. 点击 'Create Token'"
        echo "3. 选择 'Custom token'"
        echo "4. 权限设置为: Zone:DNS:Edit, Zone:Zone:Read"
        echo "5. Zone Resources: Include - Specific zone - rolitt.com"
        exit 1
    fi
}

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

# 获取DNS记录ID
get_record_id() {
    local record_name=$1
    local record_type=$2
    
    cf_api "GET" "/zones/$ZONE_ID/dns_records?name=$record_name&type=$record_type" | \
    python3 -c "import sys, json; data = json.load(sys.stdin); print(data['result'][0]['id'] if data['result'] else '')"
}

# 更新DNS记录
update_dns_record() {
    local record_name=$1
    local record_type=$2
    local content=$3
    local description=$4
    
    echo -e "\n${BLUE}📝 更新 $description${NC}"
    echo "记录: $record_type $record_name"
    echo "内容: $content"
    
    # 获取记录ID
    record_id=$(get_record_id "$record_name" "$record_type")
    
    if [ -z "$record_id" ]; then
        echo -e "${RED}❌ 未找到现有记录，将创建新记录${NC}"
        
        # 创建新记录
        response=$(cf_api "POST" "/zones/$ZONE_ID/dns_records" \
                   "{\"type\":\"$record_type\",\"name\":\"$record_name\",\"content\":\"$content\",\"ttl\":1}")
    else
        echo -e "${YELLOW}🔄 更新现有记录 (ID: $record_id)${NC}"
        
        # 更新现有记录
        response=$(cf_api "PUT" "/zones/$ZONE_ID/dns_records/$record_id" \
                   "{\"type\":\"$record_type\",\"name\":\"$record_name\",\"content\":\"$content\",\"ttl\":1}")
    fi
    
    # 检查响应
    success=$(echo "$response" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', False))")
    
    if [ "$success" = "True" ]; then
        echo -e "${GREEN}✅ 更新成功${NC}"
    else
        echo -e "${RED}❌ 更新失败${NC}"
        echo "错误信息: $response"
    fi
}

# 验证API连接
verify_api() {
    echo -e "${BLUE}🔍 验证API连接${NC}"
    response=$(cf_api "GET" "/zones/$ZONE_ID")
    success=$(echo "$response" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', False))")
    
    if [ "$success" = "True" ]; then
        zone_name=$(echo "$response" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['result']['name'])")
        echo -e "${GREEN}✅ API连接成功，域名: $zone_name${NC}"
    else
        echo -e "${RED}❌ API连接失败${NC}"
        echo "错误信息: $response"
        exit 1
    fi
}

# 主要更新流程
main() {
    check_config
    verify_api
    
    echo -e "\n${BLUE}🎯 开始更新DNS记录${NC}"
    echo "========================================"
    
    # 更新DMARC记录
    DMARC_CONTENT="v=DMARC1; p=none; rua=mailto:support@rolitt.com; ruf=mailto:support@rolitt.com; sp=none; adkim=r; aspf=r; pct=100"
    update_dns_record "_dmarc.$DOMAIN" "TXT" "$DMARC_CONTENT" "DMARC记录"
    
    # 更新SPF记录
    SPF_CONTENT="v=spf1 include:zohomail.com include:_spf.mx.cloudflare.net include:_spf.klaviyo.com ~all"
    update_dns_record "$DOMAIN" "TXT" "$SPF_CONTENT" "SPF记录"
    
    echo -e "\n${GREEN}🎉 DNS更新完成！${NC}"
    echo "========================================"
    echo -e "${YELLOW}⏰ 等待15-30分钟让DNS传播，然后运行验证命令${NC}"
    echo ""
    echo "验证命令:"
    echo "  dig TXT _dmarc.$DOMAIN"
    echo "  dig TXT $DOMAIN"
    echo "  ./scripts/dns-check.sh"
}

# 使用说明
show_usage() {
    echo "使用方法:"
    echo "1. 编辑此脚本，填写ZONE_ID和API_TOKEN"
    echo "2. 运行: chmod +x scripts/cloudflare-api-update.sh"
    echo "3. 执行: ./scripts/cloudflare-api-update.sh"
    echo ""
    echo "如果不想使用API方式，请直接使用Web界面："
    echo "参考: scripts/cloudflare-quick-setup.md"
}

# 检查是否有帮助参数
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_usage
    exit 0
fi

# 执行主程序
main 