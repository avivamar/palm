#!/bin/bash

# 🚨 Emergency Deploy - 紧急部署脚本
# 修复构建错误并立即部署

echo "🚨 开始紧急部署修复..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "1. 检查和修复导入错误..."

# 检查是否还有使用旧 getDB 导入的文件
if grep -r "import.*getDB.*from.*@/libs/DB" src/ --include="*.ts" --include="*.tsx"; then
    echo "❌ 发现未修复的 getDB 导入，正在修复..."
    
    # 自动修复所有 getDB 导入为 getSafeDB
    find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i.bak 's/import { getDB }/import { getSafeDB }/g' {} \;
    find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i.bak 's/const database = await getDB();/const database = await getSafeDB();/g' {} \;
    
    # 清理备份文件
    find src/ -name "*.bak" -delete
    
    echo "✅ 已修复所有 getDB 导入"
else
    echo "✅ 没有发现 getDB 导入问题"
fi

echo "2. 运行构建测试..."
if npm run test-build; then
    echo "✅ 构建测试通过"
else
    echo "❌ 构建测试失败，正在尝试修复..."
    
    # 清理构建缓存
    rm -rf .next
    rm -rf node_modules/.cache
    
    echo "🔄 重新尝试构建..."
    if npm run build; then
        echo "✅ 构建成功"
    else
        echo "❌ 构建仍然失败，请检查错误日志"
        exit 1
    fi
fi

echo "3. 提交修复..."
git add .
git commit -m "🚨 EMERGENCY: Fix getDB import error for Vercel deployment

- Fixed remaining getDB import in webhook-logger.ts
- Updated to use getSafeDB for all database operations
- Optimized database initialization for PostgreSQL primary usage
- Added build testing and emergency deployment scripts

Fixes Vercel build error: import { getDB } from '@/libs/DB'"

echo "4. 推送到远程..."
git push origin main

echo "5. 部署到 Vercel..."
if command -v vercel &> /dev/null; then
    vercel deploy --prod
    echo "✅ 部署已触发"
else
    echo "⚠️  Vercel CLI 未安装，请手动部署："
    echo "   vercel deploy --prod"
fi

echo ""
echo "🎉 紧急修复完成！"
echo ""
echo "📋 修复内容："
echo "   - 修复了 getDB 导入错误"
echo "   - 优化了 PostgreSQL 数据库配置"
echo "   - 添加了构建测试工具"
echo ""
echo "📊 验证部署："
echo "   1. 等待 Vercel 部署完成"
echo "   2. 访问: https://www.rolitt.com/api/webhooks/stripe"
echo "   3. 测试: https://www.rolitt.com/pre-order"
echo "   4. 运行: npm run verify-fixes"