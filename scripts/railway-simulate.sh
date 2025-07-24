#!/bin/bash
set -e

echo "🚂 Railway 环境模拟器"
echo "===================="

# 设置 Railway 环境变量
export RAILWAY_ENVIRONMENT="production"
export RAILWAY_PROJECT_ID="local-simulation"
export RAILWAY_SERVICE_ID="rolitt-main"
export RAILWAY_PUBLIC_DOMAIN="localhost:8080"
export RAILWAY_GIT_COMMIT_SHA="$(git rev-parse HEAD 2>/dev/null || echo 'local-commit')"

# 设置 Railway 默认配置
export NODE_ENV="production"
export PORT="8080"
export HOSTNAME="0.0.0.0"

# 设置内存限制（模拟 Railway 的资源限制）
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=128"

echo "🔧 模拟 Railway 环境配置:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   HOSTNAME: $HOSTNAME"
echo "   RAILWAY_ENVIRONMENT: $RAILWAY_ENVIRONMENT"
echo "   NODE_OPTIONS: $NODE_OPTIONS"

# 检查是否需要构建
if [ ! -f ".next/standalone/server.js" ]; then
    echo ""
    echo "📦 未找到构建文件，开始构建..."
    npm run build:railway
fi

# 运行诊断
echo ""
echo "🔍 运行环境诊断..."
./scripts/railway-diagnose.sh

# 启动服务器
echo ""
echo "🚀 启动 Railway 模拟环境..."
echo "服务器将在 http://localhost:8080 启动"
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
exec ./scripts/railway-start.sh