#!/bin/bash

echo "🚂 Railway 环境变量调试脚本"
echo "================================"
echo ""

# 显示构建环境信息
echo "📋 构建环境信息:"
echo "  NODE_ENV: ${NODE_ENV:-未设置}"
echo "  NEXT_PHASE: ${NEXT_PHASE:-未设置}"
echo "  RAILWAY_ENVIRONMENT: ${RAILWAY_ENVIRONMENT:-未设置}"
echo "  RAILWAY_SERVICE_NAME: ${RAILWAY_SERVICE_NAME:-未设置}"
echo "  RAILWAY_PROJECT_NAME: ${RAILWAY_PROJECT_NAME:-未设置}"
echo ""

# 检查 Supabase 环境变量的存在性和值
echo "🔍 Supabase 环境变量检查:"
echo "  NEXT_PUBLIC_SUPABASE_URL:"
if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "    ✅ 已设置: $NEXT_PUBLIC_SUPABASE_URL"
    if echo "$NEXT_PUBLIC_SUPABASE_URL" | grep -q "placeholder\|build-placeholder"; then
        echo "    ⚠️  警告: 这是占位符值，不是真实的 Supabase URL"
    fi
else
    echo "    ❌ 未设置或为空"
fi

echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY:"
if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "    ✅ 已设置: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:30}..."
    if echo "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | grep -q "placeholder\|build-placeholder"; then
        echo "    ⚠️  警告: 这是占位符值，不是真实的 Supabase Key"
    fi
else
    echo "    ❌ 未设置或为空"
fi

echo ""

# 显示所有 NEXT_PUBLIC_* 环境变量
echo "🌍 所有 NEXT_PUBLIC_* 环境变量:"
env | grep "^NEXT_PUBLIC_" | sort || echo "  未找到 NEXT_PUBLIC_* 变量"

echo ""

# 显示 Railway 特定的环境变量
echo "🚂 Railway 特定环境变量:"
env | grep "^RAILWAY_" | sort || echo "  未找到 RAILWAY_* 变量"

echo ""

# 提供修复建议
echo "🔧 修复建议:"
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "  1. 登录 Railway 控制台"
    echo "  2. 选择你的项目 → 进入服务设置"
    echo "  3. 点击 'Variables' 选项卡"
    echo "  4. 添加环境变量:"
    echo "     - 名称: NEXT_PUBLIC_SUPABASE_URL"
    echo "     - 值: https://jyslffzkkrlpgbialrlf.supabase.co"
    echo "     - 名称: NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "     - 值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5c2xmZnpra3JscGdiaWFscmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDEyNTgsImV4cCI6MjA2NjUxNzI1OH0.Nz_r4KGceN1mKORnUJRdbM0lG6LLWWmX4_FCcAg7mAg"
    echo "  5. 保存并重新部署"
else
    echo "  ✅ Supabase 环境变量已正确设置"
fi

echo ""
echo "================================"
echo "🏁 调试完成"