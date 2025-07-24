#!/bin/bash

# Vercel Admin 环境变量快速配置脚本
# 用于解决 Admin 后台访问问题

set -e

echo "🔧 Vercel Admin 环境变量配置脚本"
echo "=================================="
echo ""

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "请先安装: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI 已安装"

# 检查是否已登录
if ! vercel whoami &> /dev/null; then
    echo "❌ 未登录 Vercel"
    echo "请先登录: vercel login"
    exit 1
fi

echo "✅ 已登录 Vercel"
echo ""

# 读取本地环境变量
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local 文件不存在"
    exit 1
fi

echo "📋 配置 Admin 访问控制环境变量..."
echo ""

# 函数：安全设置环境变量
set_env_var() {
    local var_name="$1"
    local var_value="$2"
    
    echo "🔐 设置 ${var_name}..."
    
    # 检查变量是否已存在
    if vercel env ls production 2>/dev/null | grep -q "^${var_name}"; then
        echo "📝 ${var_name} 已存在，更新值..."
        # 先删除再添加
        vercel env rm "${var_name}" production --yes 2>/dev/null || true
        sleep 1
    fi
    
    # 添加新值
    if echo "${var_value}" | vercel env add "${var_name}" production 2>/dev/null; then
        echo "✅ ${var_name} 已设置为: ${var_value}"
    else
        echo "⚠️  ${var_name} 设置失败，可能已存在相同值"
    fi
}

# 设置 ADMIN_ACCESS_ENABLED
if grep -q "ADMIN_ACCESS_ENABLED=true" .env.local; then
    set_env_var "ADMIN_ACCESS_ENABLED" "true"
else
    echo "⚠️  本地 ADMIN_ACCESS_ENABLED 不是 true，跳过"
fi

# 设置其他 Admin 变量（如果存在）
admin_vars=("ADMIN_MAINTENANCE_MODE" "ADMIN_EMERGENCY_BYPASS" "ADMIN_ALLOWED_IPS")

for var in "${admin_vars[@]}"; do
    if grep -q "^${var}=" .env.local; then
        value=$(grep "^${var}=" .env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        set_env_var "${var}" "${value}"
    else
        echo "⚠️  ${var} 在本地环境中未找到，跳过"
    fi
done

echo ""
echo "🚀 触发重新部署..."
vercel deploy

echo ""
echo "✅ 配置完成！"
echo ""
echo "📝 验证步骤:"
echo "1. 等待部署完成（约 1-2 分钟）"
echo "2. 访问你的 Vercel 域名 + /admin"
echo "3. 检查是否能正常访问 Admin 后台"
echo ""
echo "🔍 如果仍然无法访问，请检查:"
echo "- Vercel Dashboard 中的环境变量设置"
echo "- 用户是否有 Admin 权限（在数据库中检查 user_roles 表）"
echo "- 浏览器控制台是否有错误信息"
echo ""
echo "📊 健康检查: https://your-domain.vercel.app/api/debug/health"
echo "🔐 Admin 后台: https://your-domain.vercel.app/admin"