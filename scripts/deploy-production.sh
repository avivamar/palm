#!/bin/bash

# 🚀 生产环境部署脚本
# 修复 Admin 访问控制问题后的重新部署

set -e

echo "🔧 开始生产环境部署..."

# 检查必要的环境变量
echo "✅ 检查环境变量配置..."
if ! grep -q "ADMIN_ACCESS_ENABLED.*true" wrangler.workers.toml; then
    echo "❌ 错误: wrangler.workers.toml 中未找到 ADMIN_ACCESS_ENABLED=true"
    exit 1
fi

echo "✅ 环境变量配置正确"

# 构建项目
echo "🏗️  构建项目..."
npm run build

# 部署到 Cloudflare Workers
echo "🚀 部署到 Cloudflare Workers..."
npx wrangler pages deploy .worker-next/ --project-name=rolitt --env=production

echo "✅ 部署完成！"
echo ""
echo "🔍 验证步骤："
echo "1. 访问 https://www.rolitt.com/admin"
echo "2. 检查是否可以正常访问 Admin 后台"
echo "3. 如果仍然无法访问，请检查以下内容："
echo "   - 确认你的 IP 地址是否在允许列表中（如果设置了 ADMIN_ALLOWED_IPS）"
echo "   - 确认没有设置 ADMIN_MAINTENANCE_MODE=true"
echo "   - 检查浏览器控制台是否有错误信息"
echo ""
echo "📝 如需调试，可以查看部署日志："
echo "npx wrangler pages deployment list --project-name=rolitt"