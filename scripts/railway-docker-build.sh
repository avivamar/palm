#!/bin/bash

# Railway Docker 构建脚本
# 提供更强的错误处理和重试机制

set -e

echo "🚀 Starting Railway Docker build process..."

# 函数：重试机制
retry_command() {
    local cmd="$1"
    local max_attempts=3
    local delay=10
    
    for attempt in $(seq 1 $max_attempts); do
        echo "🔄 Attempt $attempt/$max_attempts: $cmd"
        if eval "$cmd"; then
            echo "✅ Command succeeded: $cmd"
            return 0
        else
            echo "❌ Command failed: $cmd (attempt $attempt/$max_attempts)"
            if [ $attempt -lt $max_attempts ]; then
                echo "⏳ Waiting ${delay}s before retry..."
                sleep $delay
                delay=$((delay * 2))  # 指数退避
            fi
        fi
    done
    
    echo "💥 Command failed after $max_attempts attempts: $cmd"
    return 1
}

# 检查必要的环境变量
echo "🔍 Checking environment..."
if [ -z "$RAILWAY_ENVIRONMENT" ]; then
    echo "⚠️  RAILWAY_ENVIRONMENT not set, setting to 1"
    export RAILWAY_ENVIRONMENT=1
fi

# 设置 Node.js 环境
echo "📦 Setting up Node.js environment..."
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=3072"

# 检查 package.json 是否存在
if [ ! -f "package.json" ]; then
    echo "💥 package.json not found!"
    exit 1
fi

# 清理缓存
echo "🧹 Cleaning up caches..."
rm -rf .next/cache/* 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf /tmp/nextjs* 2>/dev/null || true

# 安装依赖
echo "📦 Installing dependencies..."
retry_command "npm ci --frozen-lockfile --prefer-offline --no-audit --no-fund"

# 构建包
echo "🔨 Building packages..."
npm run packages:build || echo "⚠️  No packages to build"

# 生成 Prisma 客户端
if [ -f "prisma/schema.prisma" ]; then
    echo "🗄️  Generating Prisma client..."
    retry_command "npx prisma generate"
fi

# 构建应用
echo "🏗️  Building Next.js application..."
retry_command "npm run build"

# 验证构建产物
echo "🔍 Verifying build artifacts..."
if [ ! -f ".next/standalone/server.js" ]; then
    echo "💥 Standalone server.js not found!"
    exit 1
fi

if [ ! -d ".next/static" ]; then
    echo "💥 Static files not found!"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build artifacts:"
ls -la .next/standalone/
ls -la .next/static/

echo "🚀 Railway Docker build process completed!"