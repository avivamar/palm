#!/bin/bash

echo "🔍 Railway 环境变量检查"

# 检查关键环境变量
check_env_var() {
    local var_name=$1
    local var_value=${!var_name}
    local is_required=${2:-false}
    
    if [ -n "$var_value" ]; then
        echo "✅ $var_name: 已设置"
        return 0
    else
        if [ "$is_required" = "true" ]; then
            echo "❌ $var_name: 未设置 (必需)"
            return 1
        else
            echo "⚠️  $var_name: 未设置 (可选)"
            return 0
        fi
    fi
}

echo "📋 检查必需的环境变量..."
error_count=0

# 必需的环境变量
check_env_var "NEXT_PUBLIC_SUPABASE_URL" true || ((error_count++))
check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" true || ((error_count++))
check_env_var "DATABASE_URL" true || ((error_count++))

echo ""
echo "📋 检查可选的环境变量..."

# 可选但推荐的环境变量
check_env_var "NEXT_PUBLIC_POSTHOG_KEY" false
check_env_var "NEXT_PUBLIC_POSTHOG_HOST" false
check_env_var "STRIPE_SECRET_KEY" false
check_env_var "STRIPE_PUBLISHABLE_KEY" false
check_env_var "RAILWAY_PUBLIC_DOMAIN" false
check_env_var "REDIS_URL" false

echo ""
echo "🌐 Railway 特定环境变量..."
check_env_var "RAILWAY_ENVIRONMENT" false
check_env_var "RAILWAY_PROJECT_ID" false
check_env_var "RAILWAY_SERVICE_ID" false

echo ""
if [ $error_count -eq 0 ]; then
    echo "✅ 所有必需的环境变量都已正确设置"
    exit 0
else
    echo "❌ 发现 $error_count 个缺失的必需环境变量"
    echo ""
    echo "🔧 请在 Railway 项目中设置缺失的环境变量："
    echo "   1. 访问 Railway 项目仪表板"
    echo "   2. 进入 Variables 选项卡"
    echo "   3. 添加缺失的环境变量"
    echo "   4. 重新部署项目"
    exit 1
fi