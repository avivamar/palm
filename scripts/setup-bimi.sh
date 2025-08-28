#!/bin/bash

# BIMI (Brand Indicators for Message Identification) 配置脚本
# 为rolitt.com添加BIMI DNS记录以在邮件中显示logo

ZONE_ID="5a543f071db6884ca6ff442328a8529e"
API_TOKEN="XDnRO_pVethMsqGoINViAZ868VgtkRY2WjUAnHxy"
DOMAIN="rolitt.com"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🎨 BIMI配置工具 -/* Thepalmistrylife邮件品牌化${NC}"
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

# 检查logo文件
check_logo_files() {
    echo -e "${BLUE}🔍 检查Logo文件${NC}"
    echo "----------------------------------------"
    
    if [ -f "public/rolittlogoofBIMI.svg" ]; then
        echo -e "${GREEN}✅ 找到SVG logo: public/rolittlogoofBIMI.svg${NC}"
        
        # 检查文件大小
        size=$(stat -f%z "public/rolittlogoofBIMI.svg" 2>/dev/null || stat -c%s "public/rolittpalmlogo.svg" 2>/dev/null)
        size_kb=$((size / 1024))
        
        echo "   文件大小: ${size_kb}KB"
        
        if [ $size_kb -lt 32 ]; then
            echo -e "${GREEN}   ✅ 文件大小符合BIMI要求 (<32KB)${NC}"
        else
            echo -e "${YELLOW}   ⚠️  文件大小超过BIMI建议 (32KB)${NC}"
            echo -e "${YELLOW}   建议优化SVG文件大小${NC}"
        fi
    else
        echo -e "${RED}❌ 未找到SVG logo文件${NC}"
        echo "请确保 public/rolittlogoofBIMI.svg 文件存在"
        return 1
    fi
    
    echo ""
}

# 创建优化的BIMI SVG
create_bimi_logo() {
    echo -e "${BLUE}🎨 创建BIMI优化Logo${NC}"
    echo "----------------------------------------"
    
    # 创建目录
    mkdir -p public/assets/logo/
    
    # 复制并优化logo
    if [ -f "public/rolittpalmlogo.svg" ]; then
        cp "public/rolittpalmlogo.svg" "public/assets/logo/bimi-palmlogo.svg"
        echo -e "${GREEN}✅ 创建BIMI logo: public/assets/logo/bimi-palmlogo.svg${NC}"
        
        # 检查是否需要优化
        echo -e "${YELLOW}💡 BIMI Logo优化建议:${NC}"
        echo "   1. 确保logo为正方形比例"
        echo "   2. 使用简洁的设计，在小尺寸下清晰可见"
        echo "   3. 文件大小小于32KB"
        echo "   4. 使用HTTPS链接托管"
    else
        echo -e "${RED}❌ 源logo文件不存在${NC}"
        return 1
    fi
    
    echo ""
}

# 添加BIMI DNS记录
add_bimi_record() {
    echo -e "${BLUE}📝 添加BIMI DNS记录${NC}"
    echo "----------------------------------------"
    
    # BIMI记录内容
    # 注意：这里使用基础BIMI记录，不包含VMC证书
    BIMI_CONTENT="v=BIMI1; l=https://$DOMAIN/assets/logo/bimi-palmlogo.svg;"
    
    echo -e "${YELLOW}BIMI记录内容:${NC}"
    echo "$BIMI_CONTENT"
    echo ""
    
    # 检查是否已存在BIMI记录
    existing_record=$(cf_api "GET" "/zones/$ZONE_ID/dns_records?name=default._bimi.$DOMAIN&type=TXT")
    record_count=$(echo "$existing_record" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data['result']))")
    
    if [ "$record_count" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  发现现有BIMI记录${NC}"
        record_id=$(echo "$existing_record" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['result'][0]['id'])")
        
        # 更新现有记录
        response=$(cf_api "PUT" "/zones/$ZONE_ID/dns_records/$record_id" \
                   "{\"type\":\"TXT\",\"name\":\"default._bimi.$DOMAIN\",\"content\":\"$BIMI_CONTENT\",\"ttl\":1}")
        
        success=$(echo "$response" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('success', False))")
        
        if [ "$success" = "True" ]; then
            echo -e "${GREEN}✅ BIMI记录更新成功${NC}"
        else
            echo -e "${RED}❌ BIMI记录更新失败${NC}"
            echo "错误信息: $response"
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
        fi
    fi
    
    echo ""
}

# 验证BIMI配置
verify_bimi() {
    echo -e "${BLUE}🔍 验证BIMI配置${NC}"
    echo "----------------------------------------"
    
    # 检查DNS记录
    echo -e "${YELLOW}检查BIMI DNS记录:${NC}"
    bimi_result=$(dig +short TXT default._bimi.$DOMAIN | tr -d '"')
    
    if [ -n "$bimi_result" ]; then
        echo -e "${GREEN}✅ BIMI DNS记录存在:${NC}"
        echo "   $bimi_result"
    else
        echo -e "${RED}❌ BIMI DNS记录未找到${NC}"
        echo "   可能需要等待DNS传播 (15-30分钟)"
    fi
    
    echo ""
    
    # 检查logo文件可访问性
    echo -e "${YELLOW}检查Logo文件可访问性:${NC}"
    logo_url="https://$DOMAIN/assets/logo/bimi-palmlogo.svg"
    
    if command -v curl >/dev/null 2>&1; then
        http_status=$(curl -s -o /dev/null -w "%{http_code}" "$logo_url")
        
        if [ "$http_status" = "200" ]; then
            echo -e "${GREEN}✅ Logo文件可访问: $logo_url${NC}"
        else
            echo -e "${RED}❌ Logo文件无法访问 (HTTP $http_status)${NC}"
            echo -e "${YELLOW}   请确保文件已上传到网站并可通过HTTPS访问${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  无法检查文件可访问性 (curl未安装)${NC}"
        echo -e "${BLUE}   请手动验证: $logo_url${NC}"
    fi
    
    echo ""
}

# 显示后续步骤
show_next_steps() {
    echo -e "${BLUE}📋 后续步骤${NC}"
    echo "========================================"
    echo ""
    echo -e "${YELLOW}1. 上传Logo文件到网站${NC}"
    echo "   - 将 public/assets/logo/bimi-palmlogo.svg 上传到网站"
    echo "   - 确保可通过 https://$DOMAIN/assets/logo/bimi-palmlogo.svg 访问"
    echo ""
    echo -e "${YELLOW}2. 等待DNS传播${NC}"
    echo "   - BIMI DNS记录需要15-30分钟传播"
    echo "   - 运行验证命令: ./scripts/verify-bimi.sh"
    echo ""
    echo -e "${YELLOW}3. 测试邮件显示${NC}"
    echo "   - 发送测试邮件到Gmail/Yahoo"
    echo "   - 检查是否显示Rolitt logo"
    echo ""
    echo -e "${YELLOW}4. 配置邮件模板${NC}"
    echo "   - 在Zoho、Klaviyo、Amazon SES中添加logo"
    echo "   - 参考: scripts/email-branding-guide.md"
    echo ""
    echo -e "${BLUE}💡 提示: BIMI主要在Gmail和Yahoo Mail中显示${NC}"
    echo -e "${BLUE}   其他邮件客户端需要通过邮件模板添加logo${NC}"
}

# 主函数
main() {
    check_logo_files || exit 1
    create_bimi_logo || exit 1
    add_bimi_record
    verify_bimi
    show_next_steps
    
    echo ""
    echo -e "${GREEN}🎉 BIMI配置完成！${NC}"
    echo "========================================"
}

# 执行主程序
main 