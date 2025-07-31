#!/bin/bash

# BIMI验证脚本 - 检查BIMI配置状态
# 验证DNS记录、logo文件可访问性和邮件客户端支持

DOMAIN="rolitt.com"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 BIMI配置验证工具${NC}"
echo "========================================"

# 检查BIMI DNS记录
check_bimi_dns() {
    echo -e "${BLUE}📋 检查BIMI DNS记录${NC}"
    echo "----------------------------------------"
    
    # 检查default._bimi记录
    bimi_record=$(dig +short TXT default._bimi.$DOMAIN 2>/dev/null | tr -d '"')
    
    if [ -n "$bimi_record" ]; then
        echo -e "${GREEN}✅ BIMI DNS记录存在${NC}"
        echo "   记录: $bimi_record"
        
        # 解析BIMI记录
        if echo "$bimi_record" | grep -q "v=BIMI1"; then
            echo -e "${GREEN}   ✅ BIMI版本正确${NC}"
        else
            echo -e "${RED}   ❌ BIMI版本错误${NC}"
        fi
        
        # 提取logo URL
        logo_url=$(echo "$bimi_record" | sed -n 's/.*l=\([^;]*\).*/\1/p')
        if [ -n "$logo_url" ]; then
            echo -e "${GREEN}   ✅ Logo URL: $logo_url${NC}"
        else
            echo -e "${RED}   ❌ 未找到Logo URL${NC}"
        fi
        
        # 检查VMC证书
        if echo "$bimi_record" | grep -q "a="; then
            vmc_url=$(echo "$bimi_record" | sed -n 's/.*a=\([^;]*\).*/\1/p')
            echo -e "${YELLOW}   📜 VMC证书: $vmc_url${NC}"
        else
            echo -e "${YELLOW}   ⚠️  未配置VMC证书 (可选)${NC}"
        fi
    else
        echo -e "${RED}❌ BIMI DNS记录不存在${NC}"
        echo -e "${YELLOW}   运行配置命令: ./scripts/setup-bimi.sh${NC}"
        return 1
    fi
    
    echo ""
}

# 检查logo文件可访问性
check_logo_accessibility() {
    echo -e "${BLUE}🖼️  检查Logo文件可访问性${NC}"
    echo "----------------------------------------"
    
    # 从BIMI记录获取logo URL
    bimi_record=$(dig +short TXT default._bimi.$DOMAIN 2>/dev/null | tr -d '"')
    logo_url=$(echo "$bimi_record" | sed -n 's/.*l=\([^;]*\).*/\1/p')
    
    if [ -z "$logo_url" ]; then
        logo_url="https://$DOMAIN/assets/logo/bimi-palmlogo.svg"
        echo -e "${YELLOW}⚠️  从BIMI记录获取URL失败，使用默认URL${NC}"
    fi
    
    echo "检查URL: $logo_url"
    
    if command -v curl >/dev/null 2>&1; then
        # 检查HTTP状态
        http_status=$(curl -s -o /dev/null -w "%{http_code}" "$logo_url")
        
        if [ "$http_status" = "200" ]; then
            echo -e "${GREEN}✅ Logo文件可访问 (HTTP $http_status)${NC}"
            
            # 检查文件类型
            content_type=$(curl -s -I "$logo_url" | grep -i "content-type" | cut -d' ' -f2- | tr -d '\r\n')
            echo "   Content-Type: $content_type"
            
            if echo "$content_type" | grep -q "image/svg"; then
                echo -e "${GREEN}   ✅ 文件类型正确 (SVG)${NC}"
            else
                echo -e "${YELLOW}   ⚠️  文件类型可能不正确${NC}"
            fi
            
            # 检查文件大小
            content_length=$(curl -s -I "$logo_url" | grep -i "content-length" | cut -d' ' -f2 | tr -d '\r\n')
            if [ -n "$content_length" ]; then
                size_kb=$((content_length / 1024))
                echo "   文件大小: ${size_kb}KB"
                
                if [ $size_kb -lt 32 ]; then
                    echo -e "${GREEN}   ✅ 文件大小符合要求 (<32KB)${NC}"
                else
                    echo -e "${YELLOW}   ⚠️  文件大小超过建议值 (32KB)${NC}"
                fi
            fi
            
        elif [ "$http_status" = "404" ]; then
            echo -e "${RED}❌ Logo文件不存在 (HTTP 404)${NC}"
            echo -e "${YELLOW}   请确保文件已上传到: $logo_url${NC}"
        else
            echo -e "${RED}❌ Logo文件无法访问 (HTTP $http_status)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  无法检查文件可访问性 (curl未安装)${NC}"
    fi
    
    echo ""
}

# 检查HTTPS配置
check_https() {
    echo -e "${BLUE}🔒 检查HTTPS配置${NC}"
    echo "----------------------------------------"
    
    if command -v curl >/dev/null 2>&1; then
        # 检查SSL证书
        ssl_info=$(curl -s -I "https://$DOMAIN" | head -1)
        
        if echo "$ssl_info" | grep -q "200"; then
            echo -e "${GREEN}✅ HTTPS配置正常${NC}"
        else
            echo -e "${RED}❌ HTTPS配置可能有问题${NC}"
            echo "   响应: $ssl_info"
        fi
        
        # 检查SSL证书有效性
        if command -v openssl >/dev/null 2>&1; then
            cert_info=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
            
            if [ -n "$cert_info" ]; then
                echo -e "${GREEN}✅ SSL证书有效${NC}"
                echo "$cert_info" | sed 's/^/   /'
            else
                echo -e "${YELLOW}⚠️  无法验证SSL证书${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  无法检查HTTPS配置 (curl未安装)${NC}"
    fi
    
    echo ""
}

# 检查邮件客户端支持
check_email_client_support() {
    echo -e "${BLUE}📧 邮件客户端BIMI支持状态${NC}"
    echo "----------------------------------------"
    
    echo -e "${GREEN}✅ 完全支持BIMI:${NC}"
    echo "   • Gmail (Web, Mobile)"
    echo "   • Yahoo Mail"
    echo "   • Apple Mail (iOS 16+)"
    echo "   • Fastmail"
    echo ""
    
    echo -e "${YELLOW}🔄 部分支持BIMI:${NC}"
    echo "   • Outlook.com (逐步推出)"
    echo "   • AOL Mail"
    echo ""
    
    echo -e "${RED}❌ 暂不支持BIMI:${NC}"
    echo "   • Outlook Desktop"
    echo "   • Thunderbird"
    echo "   • 大多数企业邮件客户端"
    echo ""
    
    echo -e "${BLUE}💡 建议:${NC}"
    echo "   • 对于不支持BIMI的客户端，使用邮件模板添加logo"
    echo "   • 参考: scripts/email-branding-guide.md"
    echo ""
}

# 测试建议
show_testing_guide() {
    echo -e "${BLUE}🧪 测试建议${NC}"
    echo "----------------------------------------"
    
    echo -e "${YELLOW}1. 发送测试邮件${NC}"
    echo "   • 从您的域名发送邮件到Gmail测试账户"
    echo "   • 确保邮件通过DMARC验证"
    echo "   • 检查是否显示Rolitt logo"
    echo ""
    
    echo -e "${YELLOW}2. 验证DMARC对齐${NC}"
    echo "   • 确保DKIM和SPF验证通过"
    echo "   • BIMI需要DMARC验证成功才能显示"
    echo "   • 运行: ./scripts/verify-fix.sh"
    echo ""
    
    echo -e "${YELLOW}3. 等待时间${NC}"
    echo "   • BIMI可能需要24-48小时才能在邮件中显示"
    echo "   • DNS传播需要15-30分钟"
    echo "   • 邮件客户端缓存可能需要更长时间"
    echo ""
    
    echo -e "${YELLOW}4. 故障排除${NC}"
    echo "   • 如果logo不显示，检查DMARC报告"
    echo "   • 确保邮件通过所有验证"
    echo "   • 尝试从不同发件人地址发送"
    echo ""
}

# BIMI工具推荐
show_bimi_tools() {
    echo -e "${BLUE}🛠️  BIMI工具和资源${NC}"
    echo "----------------------------------------"
    
    echo -e "${YELLOW}在线验证工具:${NC}"
    echo "   • BIMI Inspector: https://bimigroup.org/bimi-generator/"
    echo "   • MXToolbox BIMI: https://mxtoolbox.com/bimi.aspx"
    echo "   • PowerDMARC BIMI: https://powerdmarc.com/bimi-record-checker/"
    echo ""
    
    echo -e "${YELLOW}Logo优化工具:${NC}"
    echo "   • SVGOMG: https://jakearchibald.github.io/svgomg/"
    echo "   • SVG Optimizer: https://www.svgviewer.dev/svg-optimizer"
    echo ""
    
    echo -e "${YELLOW}VMC证书提供商:${NC}"
    echo "   • DigiCert: https://www.digicert.com/tls-ssl/verified-mark-certificates"
    echo "   • Entrust: https://www.entrust.com/digital-certificates/verified-mark"
    echo "   • 费用: 约$1500-3000/年"
    echo ""
}

# 主函数
main() {
    check_bimi_dns
    check_logo_accessibility
    check_https
    check_email_client_support
    show_testing_guide
    show_bimi_tools
    
    echo -e "${GREEN}🎉 BIMI验证完成！${NC}"
    echo "========================================"
    echo ""
    echo -e "${BLUE}下一步:${NC}"
    echo "1. 如果所有检查都通过，发送测试邮件验证显示效果"
    echo "2. 如果有问题，根据上述建议进行修复"
    echo "3. 配置其他邮件服务的模板logo"
}

# 执行主程序
main 