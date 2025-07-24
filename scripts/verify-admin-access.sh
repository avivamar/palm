#!/bin/bash

# Admin 访问验证脚本
echo "🔍 Admin 访问状态验证"
echo "===================="
echo ""

# 检查 Vercel 环境变量
echo "📋 Vercel 生产环境中的 Admin 变量:"
vercel env ls production | grep ADMIN || echo "❌ 未找到 Admin 相关变量"
echo ""

# 检查本地环境变量
echo "📋 本地环境变量状态:"
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    
    if grep -q "ADMIN_ACCESS_ENABLED=true" .env.local; then
        echo "✅ ADMIN_ACCESS_ENABLED=true (本地)"
    else
        echo "⚠️  ADMIN_ACCESS_ENABLED 不是 true (本地)"
    fi
    
    # 检查其他 Admin 变量
    admin_vars=("ADMIN_MAINTENANCE_MODE" "ADMIN_EMERGENCY_BYPASS" "ADMIN_ALLOWED_IPS")
    for var in "${admin_vars[@]}"; do
        if grep -q "^${var}=" .env.local; then
            value=$(grep "^${var}=" .env.local | cut -d'=' -f2-)
            echo "📝 ${var}=${value} (本地)"
        else
            echo "⚪ ${var} 未设置 (本地)"
        fi
    done
else
    echo "❌ .env.local 文件不存在"
fi

echo ""
echo "🔗 快速测试链接:"
echo "- 健康检查: https://your-domain.vercel.app/api/debug/health"
echo "- Admin 调试: https://your-domain.vercel.app/api/debug/admin-access"
echo "- Admin 后台: https://your-domain.vercel.app/admin"
echo ""
echo "💡 如果 Admin 后台仍无法访问，请检查:"
echo "1. 用户是否有 Admin 权限（数据库 user_roles 表）"
echo "2. 是否已正确登录"
echo "3. 浏览器控制台是否有错误"