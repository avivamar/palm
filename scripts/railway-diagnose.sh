#!/bin/bash

echo "🔍 Railway 环境诊断脚本"
echo "=========================="

# 模拟 Railway 环境变量（如果未设置）
if [ -z "$RAILWAY_ENVIRONMENT" ]; then
    echo "⚠️  模拟 Railway 环境变量..."
    export RAILWAY_ENVIRONMENT="production"
    export RAILWAY_PROJECT_ID="local-test"
    export RAILWAY_SERVICE_ID="local-service"
    export RAILWAY_PUBLIC_DOMAIN="localhost:${PORT:-3000}"
    export RAILWAY_GIT_COMMIT_SHA="$(git rev-parse HEAD 2>/dev/null || echo 'local-commit')"
fi

# 设置 Railway 默认值
export PORT="${PORT:-8080}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export NODE_ENV="${NODE_ENV:-production}"

# 基本环境信息
echo "📋 基本环境信息:"
echo "   NODE_ENV: ${NODE_ENV}"
echo "   PORT: ${PORT}"
echo "   HOSTNAME: ${HOSTNAME}"
echo "   PWD: $(pwd)"

# Railway 特定环境变量
echo ""
echo "🚂 Railway 环境变量:"
echo "   RAILWAY_ENVIRONMENT: ${RAILWAY_ENVIRONMENT}"
echo "   RAILWAY_PROJECT_ID: ${RAILWAY_PROJECT_ID}"
echo "   RAILWAY_SERVICE_ID: ${RAILWAY_SERVICE_ID}"
echo "   RAILWAY_PUBLIC_DOMAIN: ${RAILWAY_PUBLIC_DOMAIN}"
echo "   RAILWAY_GIT_COMMIT_SHA: ${RAILWAY_GIT_COMMIT_SHA}"

# Supabase 环境变量检查
echo ""
echo "🗄️  Supabase 配置:"
echo "   NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:-未设置}"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:+已设置}"
echo "   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:+已设置}"

# 检查关键文件
echo ""
echo "📁 关键文件检查:"
if [ -f ".next/standalone/server.js" ]; then
    echo "   ✅ .next/standalone/server.js 存在"
    echo "      文件大小: $(ls -lh .next/standalone/server.js | awk '{print $5}')"
else
    echo "   ❌ .next/standalone/server.js 不存在"
fi

if [ -d ".next/standalone/public" ]; then
    echo "   ✅ .next/standalone/public 目录存在"
else
    echo "   ❌ .next/standalone/public 目录不存在"
fi

if [ -d ".next/standalone/.next/static" ]; then
    echo "   ✅ .next/standalone/.next/static 目录存在"
else
    echo "   ❌ .next/standalone/.next/static 目录不存在"
fi

# 网络检查
echo ""
echo "🌐 网络检查:"
if command -v netstat >/dev/null 2>&1; then
    echo "   监听端口:"
    netstat -tlnp 2>/dev/null | grep ":${PORT:-3000}" || echo "   端口 ${PORT:-3000} 未监听"
else
    echo "   netstat 不可用，跳过端口检查"
fi

# 进程检查
echo ""
echo "🔄 进程检查:"
if pgrep -f "node.*server.js" >/dev/null; then
    echo "   ✅ Node.js 服务器进程正在运行"
    echo "   进程信息:"
    ps aux | grep "node.*server.js" | grep -v grep
else
    echo "   ❌ 未找到 Node.js 服务器进程"
fi

# 内存和CPU使用情况
echo ""
echo "💾 系统资源:"
if command -v free >/dev/null 2>&1; then
    echo "   内存使用:"
    free -h
fi

if command -v top >/dev/null 2>&1; then
    echo "   CPU 负载:"
    if [[ "$(uname)" == "Darwin" ]]; then
        # macOS
        top -l 1 | head -n 10
    else
        # Linux
        top -bn1 | head -3
    fi
fi

echo ""
echo "=========================="
echo "诊断完成"

# 提供模拟 Railway 启动的选项
echo ""
echo "🚀 Railway 环境模拟选项:"
echo "1. 运行诊断: ./scripts/railway-diagnose.sh"
echo "2. 模拟 Railway 启动: RAILWAY_ENVIRONMENT=production PORT=8080 HOSTNAME=0.0.0.0 ./scripts/railway-start.sh"
echo "3. 测试构建: npm run build:railway"
echo "4. 完整测试: npm run build:railway && RAILWAY_ENVIRONMENT=production PORT=8080 HOSTNAME=0.0.0.0 ./scripts/railway-start.sh"

# 如果传入 --simulate 参数，则启动模拟环境
if [ "$1" = "--simulate" ]; then
    echo ""
    echo "🚀 启动 Railway 环境模拟..."
    echo "按 Ctrl+C 停止服务器"
    echo ""
    
    # 确保构建存在
    if [ ! -f ".next/standalone/server.js" ]; then
        echo "⚠️  未找到构建文件，先运行构建..."
        npm run build:railway
    fi
    
    # 启动模拟环境
    exec ./scripts/railway-start.sh
fi