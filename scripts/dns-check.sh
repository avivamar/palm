#!/bin/bash

# DNS配置检查脚本 - rolitt.com
# 用途：检查和验证DNS记录配置
# 作者：技术团队
# 日期：2025-01-28

DOMAIN="rolitt.com"
SEND_DOMAIN="send.rolitt.com"
MAIL_DOMAIN="mail.rolitt.com"

echo "🔍 DNS配置检查开始 - $(date)"
echo "========================================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_record() {
    local record_type=$1
    local record_name=$2
    local description=$3
    
    echo -e "\n${BLUE}📋 检查 $description${NC}"
    echo "查询: $record_type $record_name"
    echo "----------------------------------------"
    
    result=$(dig +short $record_type $record_name)
    if [ -z "$result" ]; then
        echo -e "${RED}❌ 未找到记录${NC}"
        return 1
    else
        echo -e "${GREEN}✅ 记录存在:${NC}"
        echo "$result" | sed 's/^/    /'
        return 0
    fi
}

# 分析DMARC记录
analyze_dmarc() {
    echo -e "\n${BLUE}🔍 DMARC记录分析${NC}"
    echo "----------------------------------------"
    
    dmarc_record=$(dig +short TXT _dmarc.$DOMAIN | tr -d '"')
    if [ -z "$dmarc_record" ]; then
        echo -e "${RED}❌ DMARC记录不存在${NC}"
        return 1
    fi
    
    echo "当前DMARC记录:"
    echo "    $dmarc_record"
    echo ""
    
    # 检查关键参数
    if echo "$dmarc_record" | grep -q "adkim=s"; then
        echo -e "${YELLOW}⚠️  DKIM对齐: 严格模式 (可能导致失败)${NC}"
        echo -e "    ${YELLOW}建议: 改为 adkim=r (宽松模式)${NC}"
    elif echo "$dmarc_record" | grep -q "adkim=r"; then
        echo -e "${GREEN}✅ DKIM对齐: 宽松模式${NC}"
    fi
    
    if echo "$dmarc_record" | grep -q "p=none"; then
        echo -e "${YELLOW}ℹ️  策略: 监控模式 (p=none)${NC}"
        echo -e "    ${YELLOW}建议: 稳定后升级到 p=quarantine${NC}"
    fi
}

# 分析SPF记录
analyze_spf() {
    echo -e "\n${BLUE}🔍 SPF记录分析${NC}"
    echo "----------------------------------------"
    
    spf_record=$(dig +short TXT $DOMAIN | grep "v=spf1" | tr -d '"')
    if [ -z "$spf_record" ]; then
        echo -e "${RED}❌ SPF记录不存在${NC}"
        return 1
    fi
    
    echo "当前SPF记录:"
    echo "    $spf_record"
    echo ""
    
    # 检查包含的服务
    services=("zohomail.com" "_spf.mx.cloudflare.net" "sendgrid.net" "_spf.klaviyo.com")
    
    for service in "${services[@]}"; do
        if echo "$spf_record" | grep -q "$service"; then
            echo -e "${GREEN}✅ 包含: $service${NC}"
        else
            echo -e "${YELLOW}⚠️  缺失: $service${NC}"
        fi
    done
    
    # 检查结尾
    if echo "$spf_record" | grep -q "~all"; then
        echo -e "${GREEN}✅ 软失败模式: ~all${NC}"
    elif echo "$spf_record" | grep -q "-all"; then
        echo -e "${YELLOW}⚠️  硬失败模式: -all${NC}"
    fi
}

# 主检查流程
main() {
    echo -e "${BLUE}🌐 域名: $DOMAIN${NC}"
    echo ""
    
    # 1. 检查DMARC记录
    check_record "TXT" "_dmarc.$DOMAIN" "DMARC记录"
    analyze_dmarc
    
    # 2. 检查SPF记录
    check_record "TXT" "$DOMAIN" "SPF记录"
    analyze_spf
    
    # 3. 检查DKIM记录
    check_record "TXT" "mtd1._domainkey.$SEND_DOMAIN" "DKIM记录 (send域名)"
    
    # 4. 检查发送域名
    echo -e "\n${BLUE}📧 邮件发送域名检查${NC}"
    echo "----------------------------------------"
    
    # 检查send子域名
    send_ip=$(dig +short A $SEND_DOMAIN)
    if [ -n "$send_ip" ]; then
        echo -e "${GREEN}✅ $SEND_DOMAIN 解析到: $send_ip${NC}"
    else
        echo -e "${YELLOW}⚠️  $SEND_DOMAIN 未配置A记录${NC}"
    fi
    
    # 5. 生成推荐配置
    echo -e "\n${BLUE}💡 推荐的DNS配置更新${NC}"
    echo "========================================"
    
    echo -e "\n${YELLOW}1. 立即修复DMARC记录:${NC}"
    echo "记录类型: TXT"
    echo "主机名: _dmarc"
    echo "值: v=DMARC1; p=none; rua=mailto:support@rolitt.com; ruf=mailto:support@rolitt.com; sp=none; adkim=r; aspf=r; pct=100"
    
    echo -e "\n${YELLOW}2. 优化SPF记录:${NC}"
    echo "记录类型: TXT"
    echo "主机名: @"
    echo "值: v=spf1 include:zohomail.com include:_spf.mx.cloudflare.net include:_spf.klaviyo.com ~all"
    
    # 6. 验证命令
    echo -e "\n${BLUE}🔧 验证命令 (配置更新后运行)${NC}"
    echo "========================================"
    echo "dig TXT _dmarc.$DOMAIN"
    echo "dig TXT $DOMAIN"
    echo "nslookup -type=TXT _dmarc.$DOMAIN"
    echo ""
    
    # 7. 在线工具推荐
    echo -e "${BLUE}🌐 在线验证工具${NC}"
    echo "========================================"
    echo "DMARC检查: https://mxtoolbox.com/dmarc.aspx"
    echo "SPF检查: https://mxtoolbox.com/spf.aspx"
    echo "DKIM检查: https://mxtoolbox.com/dkim.aspx"
    echo "邮件测试: https://www.mail-tester.com/"
}

# 执行检查
main

echo -e "\n${GREEN}🎉 DNS检查完成!${NC}"
echo -e "${YELLOW}建议: 保存此报告并按推荐配置更新DNS记录${NC}"
echo "========================================" 