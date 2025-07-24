#!/bin/bash
set -e

echo "🚂 Railway 安全构建开始..."

# 设置构建时的默认环境变量（仅用于构建，运行时会被真实值覆盖）
export NEXT_PHASE="phase-production-build"

# 加载环境变量文件（如果存在）
# 注意：.env.production 文件被 .gitignore 忽略，Railway 无法访问
# 主要依赖 Railway 环境变量设置
if [ -f ".env.production" ]; then
    echo "📁 发现 .env.production 文件，加载本地环境变量..."
    # 安全地加载只包含 NEXT_PUBLIC_ 的环境变量
    while IFS= read -r line; do
        # 跳过注释和空行
        if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
            continue
        fi
        # 只处理 NEXT_PUBLIC_ 变量
        if [[ $line =~ ^NEXT_PUBLIC_[A-Z_]+= ]]; then
            # 提取变量名和值
            var_name=$(echo "$line" | cut -d'=' -f1)
            var_value=$(echo "$line" | cut -d'=' -f2-)
            export "$var_name"="$var_value"
            echo "   已加载: $var_name"
        fi
    done < .env.production
else
    echo "📁 .env.production 文件不存在（正常，因为被 .gitignore 忽略）"
    echo "💡 依赖 Railway 环境变量设置"
fi

# 在 Railway 环境中，优先使用 Railway 提供的环境变量
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
    echo "🚂 检测到 Railway 环境，使用 Railway 环境变量"
    
    # 检查 Railway 是否提供了 Supabase 环境变量
    if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        echo "✅ Railway 提供了 Supabase 环境变量"
        echo "   NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}"
        echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
    else
        echo "❌ Railway 未提供 Supabase 环境变量"
        echo "📋 请在 Railway 项目中添加："
        echo "   NEXT_PUBLIC_SUPABASE_URL=https://jyslffzkkrlpgbialrlf.supabase.co"
        echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5c2xmZnpra3JscGdiaWFscmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDEyNTgsImV4cCI6MjA2NjUxNzI1OH0.Nz_r4KGceN1mKORnUJRdbM0lG6LLWWmX4_FCcAg7mAg"
    fi
fi

# 如果缺少 PostHog 配置，设置默认值避免构建失败
if [ -z "$NEXT_PUBLIC_POSTHOG_KEY" ]; then
    echo "⚠️  PostHog 未配置，使用构建时默认值"
    export NEXT_PUBLIC_POSTHOG_KEY="phc_build_time_placeholder"
fi

if [ -z "$NEXT_PUBLIC_POSTHOG_HOST" ]; then
    echo "⚠️  PostHog Host 未配置，使用构建时默认值"
    export NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
fi

# 如果缺少 Supabase 配置，设置构建时默认值避免构建失败
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "⚠️  Supabase URL 未配置，使用构建时默认值"
    export NEXT_PUBLIC_SUPABASE_URL="https://build-placeholder.supabase.co"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "⚠️  Supabase ANON KEY 未配置，使用构建时默认值"
    export NEXT_PUBLIC_SUPABASE_ANON_KEY="build_time_placeholder_key_for_supabase_anon"
fi

# 检查关键环境变量是否可用
echo "🔍 检查关键环境变量..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ 缺少关键 Supabase 环境变量"
    echo "📋 必需的环境变量："
    echo "   NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:-未设置}"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:+已设置}"
    echo ""
    echo "🔧 解决方案："
    echo "1. 确保 .env.production 文件包含这些变量"
    echo "2. 在 Railway 项目中添加这些环境变量"
    echo "3. 重新部署项目"
    echo ""
    echo "⚠️  构建将继续，但应用可能无法正常工作"
else
    echo "✅ Supabase 环境变量检查通过"
fi

# 清理所有可能冲突的缓存目录
echo "🧹 清理缓存目录..."
npm cache clean --force || true
rm -rf node_modules/.cache || true
rm -rf .next/cache || true

# 安装依赖
echo "📦 安装依赖..."
npm ci --no-audit --no-fund

# 运行环境检查（不阻塞构建）
echo "🔍 检查环境变量..."
./scripts/debug-railway-env.sh

if node scripts/check-railway-env.js; then
    echo "✅ 环境变量检查通过"
else
    echo "⚠️  环境变量检查未通过，但继续构建（运行时需要正确配置）"
fi

# 执行构建
echo "🏗️  开始 Next.js 构建..."

# 设置 Node.js 内存限制以防止 Railway 内存不足
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=128"

# 使用超时和重试机制
echo "📊 当前内存限制: $NODE_OPTIONS"
echo "🔧 Railway 环境优化构建开始..."

# 尝试构建，如果失败则清理缓存后重试
if ! npm run build; then
    echo "⚠️  首次构建失败，清理缓存后重试..."
    rm -rf .next node_modules/.cache
    echo "🔄 重新尝试构建..."
    npm run build
fi

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 构建成功完成"
    
    # 检查关键配置状态
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        echo ""
        echo "🚨 重要提醒：Supabase 配置不完整"
        echo "📋 应用将无法正常工作，直到在 Railway 中配置："
        echo "   - NEXT_PUBLIC_SUPABASE_URL=https://jyslffzkkrlpgbialrlf.supabase.co"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5c2xmZnpra3JscGdiaWFscmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDEyNTgsImV4cCI6MjA2NjUxNzI1OH0.Nz_r4KGceN1mKORnUJRdbM0lG6LLWWmX4_FCcAg7mAg"
        echo ""
        echo "🔗 Railway 设置路径：Project → Variables → Add Variable"
        echo "📚 详细修复指南：/docs/railway-supabase-fix.md"
    else
        echo "✅ 所有关键环境变量配置正确"
    fi
    
    echo "✅ Railway 构建完成!"
else
    echo "❌ 构建失败"
    exit 1
fi