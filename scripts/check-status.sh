#!/bin/bash

# 🔍 Quick Status Check - Stripe Webhook Fix
# 快速状态检查 - Stripe Webhook 修复

echo "🔍 检查 Stripe Webhook 修复状态..."
echo ""

# 检查关键文件是否存在
echo "📁 检查核心修复文件:"

files=(
    "src/libs/DB.ts"
    "src/app/api/webhooks/stripe/route.ts"
    "src/app/actions/preorderActions.ts"
    "src/app/actions/paymentActions.ts"
    "src/libs/webhook-logger.ts"
    "src/libs/Env.ts"
    "src/components/pre-order/ProductSelection.tsx"
    "src/app/api/webhook/health/route.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (缺失)"
    fi
done

echo ""

# 检查新增工具
echo "🛠️ 检查新增工具:"

tools=(
    "scripts/check-env.js"
    "scripts/verify-fixes.js"
    "scripts/commit-fixes.sh"
    "WEBHOOK_FIX_SUMMARY.md"
    "DEPLOYMENT_GUIDE.md"
    "QUICK_REFERENCE.md"
)

for tool in "${tools[@]}"; do
    if [ -f "$tool" ]; then
        echo "✅ $tool"
    else
        echo "❌ $tool (缺失)"
    fi
done

echo ""

# 检查重复文件是否已删除
echo "🗑️ 检查清理状态:"
if [ ! -f "src/app/api/webhook/stripe/route.ts" ]; then
    echo "✅ 重复的 webhook 路由已删除"
else
    echo "⚠️  重复的 webhook 路由仍存在 (需要删除)"
fi

echo ""

# 检查package.json是否包含新脚本
echo "📦 检查 package.json 脚本:"
if grep -q "check-env" package.json; then
    echo "✅ check-env 脚本已添加"
else
    echo "❌ check-env 脚本缺失"
fi

if grep -q "verify-fixes" package.json; then
    echo "✅ verify-fixes 脚本已添加"
else
    echo "❌ verify-fixes 脚本缺失"
fi

echo ""

# 检查Git状态
echo "📝 Git 状态:"
if git diff --quiet && git diff --cached --quiet; then
    echo "✅ 没有未提交的更改"
else
    echo "⚠️  有未提交的更改"
    echo "   运行: ./scripts/commit-fixes.sh 来提交修复"
fi

echo ""

# 环境变量快速检查
echo "🔧 环境变量快速检查:"
if [ -n "$STRIPE_SECRET_KEY" ]; then
    echo "✅ STRIPE_SECRET_KEY 已设置"
else
    echo "⚠️  STRIPE_SECRET_KEY 未设置"
fi

if [ -n "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ]; then
    echo "✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 已设置"
else
    echo "⚠️  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 未设置"
fi

echo ""

# 总结状态
echo "📊 总体状态:"
missing_core_files=0
for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        ((missing_core_files++))
    fi
done

missing_tools=0
for tool in "${tools[@]}"; do
    if [ ! -f "$tool" ]; then
        ((missing_tools++))
    fi
done

if [ $missing_core_files -eq 0 ] && [ $missing_tools -eq 0 ]; then
    echo "🎉 所有修复文件就绪!"
    echo ""
    echo "📋 下一步:"
    echo "   1. 提交修复: ./scripts/commit-fixes.sh"
    echo "   2. 检查环境: npm run check-env"
    echo "   3. 部署应用: vercel deploy --prod"
    echo "   4. 验证修复: npm run verify-fixes"
else
    echo "⚠️  修复不完整:"
    echo "   - 缺失核心文件: $missing_core_files"
    echo "   - 缺失工具文件: $missing_tools"
    echo ""
    echo "请确保所有修复文件都已正确创建。"
fi

echo ""
echo "📚 参考文档:"
echo "   - 快速参考: QUICK_REFERENCE.md"
echo "   - 修复总结: WEBHOOK_FIX_SUMMARY.md"
echo "   - 部署指南: DEPLOYMENT_GUIDE.md"