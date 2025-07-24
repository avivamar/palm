#!/bin/bash

# 修复BIMI配置 - 更新DMARC策略和logo URL
# BIMI需要DMARC策略为quarantine或reject才能生效

ZONE_ID="5a543f071db6884ca6ff442328a8529e"
API_TOKEN="XDnRO_pVethMsqGoINViAZ868VgtkRY2WjUAnHxy"
DOMAIN="rolitt.com"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 修复BIMI配置 - DMARC策略更新${NC}"
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

# 检查当前DMARC配置
check_current_dmarc() {
    echo -e "${BLUE}🔍 检查当前DMARC配置${NC}"
    echo "----------------------------------------"
    
    current_dmarc=$(dig +short TXT _dmarc.$DOMAIN | tr -d '"')
    
    if [ -n "$current_dmarc" ]; then
        echo -e "${YELLOW}当前DMARC记录:${NC}"
        echo "$current_dmarc"
        
        if echo "$current_dmarc" | grep -q "p=none"; then
            echo -e "${RED}❌ DMARC策略为'none' - BIMI无法生效${NC}"
            echo -e "${YELLOW}💡 需要更新为'quarantine'或'reject'${NC}"
            return 1
        elif echo "$current_dmarc" | grep -q "p=quarantine\|p=reject"; then
            echo -e "${GREEN}✅ DMARC策略已正确设置${NC}"
            return 0
        fi
    else
        echo -e "${RED}❌ 未找到DMARC记录${NC}"
        return 1
    fi
    
    echo ""
}

# 更新DMARC策略
update_dmarc_policy() {
    echo -e "${BLUE}📝 更新DMARC策略${NC}"
    echo "----------------------------------------"
    
    # 新的DMARC记录 - 使用quarantine策略
    NEW_DMARC="v=DMARC1; p=quarantine; rua=mailto:support@rolitt.com; ruf=mailto:support@rolitt.com; sp=quarantine; adkim=s; aspf=r; pct=100"
    
    echo -e "${YELLOW}新DMARC记录:${NC}"
    echo "$NEW_DMARC"
    echo ""
    
    # 获取现有DMARC记录
    existing_record=$(cf_api "GET" "/zones/$ZONE_ID/dns_records?name=_dmarc.$DOMAIN&type=TXT")
    record_count=$(echo "$existing_record" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data['result']))")
    
    if [ "$record_count" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  更新现有DMARC记录${NC}"
        record_id=$(echo "$existing_record" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['result'][0]['id'])")
        
        # 更新记录
        response=$(cf_api "PUT" "/zones/$ZONE_ID/dns_records/$record_id" \
                   "{\"type\":\"TXT\",\"name\":\"_dmarc.$DOMAIN\",\"content\":\"$NEW_DMARC\",\"ttl\":1}")
        
        success=$(echo "$response" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', False))")
        
        if [ "$success" = "True" ]; then
            echo -e "${GREEN}✅ DMARC记录更新成功${NC}"
        else
            echo -e "${RED}❌ DMARC记录更新失败${NC}"
            echo "错误信息: $response"
            return 1
        fi
    else
        echo -e "${RED}❌ 未找到现有DMARC记录${NC}"
        return 1
    fi
    
    echo ""
}

# 更新BIMI记录使用正确的logo URL
update_bimi_record() {
    echo -e "${BLUE}🎨 更新BIMI记录${NC}"
    echo "----------------------------------------"
    
    # 使用可用的logo URL
    LOGO_URL="https://cdn.rolitt.com/rolitt-logo-yellow-background.svg"
    BIMI_CONTENT="v=BIMI1; l=$LOGO_URL;"
    
    echo -e "${YELLOW}验证logo可访问性:${NC}"
    http_status=$(curl -s -o /dev/null -w "%{http_code}" "$LOGO_URL")
    
    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✅ Logo文件可访问: $LOGO_URL${NC}"
        
        # 检查文件大小
        content_length=$(curl -s -I "$LOGO_URL" | grep -i "content-length" | cut -d' ' -f2 | tr -d '\r\n')
        if [ -n "$content_length" ]; then
            size_kb=$((content_length / 1024))
            echo "   文件大小: ${size_kb}KB"
            
            if [ $size_kb -lt 32 ]; then
                echo -e "${GREEN}   ✅ 文件大小符合BIMI要求${NC}"
            else
                echo -e "${YELLOW}   ⚠️  文件大小超过建议值${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Logo文件无法访问 (HTTP $http_status)${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${YELLOW}新BIMI记录:${NC}"
    echo "$BIMI_CONTENT"
    echo ""
    
    # 获取现有BIMI记录
    existing_record=$(cf_api "GET" "/zones/$ZONE_ID/dns_records?name=default._bimi.$DOMAIN&type=TXT")
    record_count=$(echo "$existing_record" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data['result']))")
    
    if [ "$record_count" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  更新现有BIMI记录${NC}"
        record_id=$(echo "$existing_record" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['result'][0]['id'])")
        
        # 更新记录
        response=$(cf_api "PUT" "/zones/$ZONE_ID/dns_records/$record_id" \
                   "{\"type\":\"TXT\",\"name\":\"default._bimi.$DOMAIN\",\"content\":\"$BIMI_CONTENT\",\"ttl\":1}")
        
        success=$(echo "$response" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', False))")
        
        if [ "$success" = "True" ]; then
            echo -e "${GREEN}✅ BIMI记录更新成功${NC}"
        else
            echo -e "${RED}❌ BIMI记录更新失败${NC}"
            echo "错误信息: $response"
            return 1
        fi
    else
        # 创建新记录
        response=$(cf_api "POST" "/zones/$ZONE_ID/dns_records" \
                   "{\"type\":\"TXT\",\"name\":\"default._bimi.$DOMAIN\",\"content\":\"$BIMI_CONTENT\",\"ttl\":1}")
        
        success=$(echo "$response" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', False))")
        
        if [ "$success" = "True" ]; then
            echo -e "${GREEN}✅ BIMI记录创建成功${NC}"
        else
            echo -e "${RED}❌ BIMI记录创建失败${NC}"
            echo "错误信息: $response"
            return 1
        fi
    fi
    
    echo ""
}

# 验证配置
verify_configuration() {
    echo -e "${BLUE}🔍 验证配置${NC}"
    echo "----------------------------------------"
    
    echo -e "${YELLOW}等待DNS传播 (30秒)...${NC}"
    sleep 30
    
    # 检查DMARC
    echo -e "${YELLOW}检查DMARC记录:${NC}"
    dmarc_result=$(dig +short TXT _dmarc.$DOMAIN | tr -d '"')
    
    if [ -n "$dmarc_result" ]; then
        echo -e "${GREEN}✅ DMARC记录:${NC}"
        echo "   $dmarc_result"
        
        if echo "$dmarc_result" | grep -q "p=quarantine\|p=reject"; then
            echo -e "${GREEN}   ✅ DMARC策略正确 (支持BIMI)${NC}"
        else
            echo -e "${RED}   ❌ DMARC策略仍为none${NC}"
        fi
    else
        echo -e "${RED}❌ DMARC记录未找到${NC}"
    fi
    
    echo ""
    
    # 检查BIMI
    echo -e "${YELLOW}检查BIMI记录:${NC}"
    bimi_result=$(dig +short TXT default._bimi.$DOMAIN | tr -d '"')
    
    if [ -n "$bimi_result" ]; then
        echo -e "${GREEN}✅ BIMI记录:${NC}"
        echo "   $bimi_result"
    else
        echo -e "${RED}❌ BIMI记录未找到${NC}"
    fi
    
    echo ""
}

# 显示后续步骤
show_next_steps() {
    echo -e "${BLUE}📋 后续步骤${NC}"
    echo "========================================"
    echo ""
    echo -e "${YELLOW}1. 等待DNS完全传播 (15-30分钟)${NC}"
    echo "   - DMARC策略更新需要时间生效"
    echo "   - BIMI显示可能需要24-48小时"
    echo ""
    echo -e "${YELLOW}2. 测试BIMI显示${NC}"
    echo "   - 从rolitt.com域名发送邮件到Gmail"
    echo "   - 确保邮件通过DMARC验证"
    echo "   - 检查Gmail中是否显示logo"
    echo ""
    echo -e "${YELLOW}3. 配置邮件模板logo (立即可用)${NC}"
    echo "   - Zoho Mail: 添加邮件签名logo"
    echo "   - Klaviyo: 更新邮件模板"
    echo "   - Amazon SES: 使用带logo的模板"
    echo ""
    echo -e "${BLUE}💡 重要提示:${NC}"
    echo "   - DMARC策略从'none'改为'quarantine'可能影响邮件投递"
    echo "   - 建议先监控邮件投递率"
    echo "   - 如有问题可以暂时改回'none'并使用邮件模板logo"
    echo ""
    echo -e "${GREEN}🎉 BIMI现在应该可以在Gmail和Yahoo Mail中显示了！${NC}"
}

# 主函数
main() {
    if ! check_current_dmarc; then
        echo -e "${YELLOW}⚠️  需要更新DMARC策略以支持BIMI${NC}"
        echo ""
        
        read -p "是否继续更新DMARC策略为'quarantine'? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            update_dmarc_policy || exit 1
        else
            echo -e "${YELLOW}跳过DMARC更新，仅更新BIMI记录${NC}"
        fi
    fi
    
    update_bimi_record || exit 1
    verify_configuration
    show_next_steps
    
    echo ""
    echo -e "${GREEN}🎉 BIMI配置修复完成！${NC}"
    echo "========================================"
}

# 执行主程序
main 