#!/bin/bash

# Cloudflare Pages 部署脚本

echo "🚀 开始 Cloudflare Pages 部署..."

# 1. 备份原始配置
echo "📦 备份原始配置..."
cp next.config.ts next.config.railway.ts

# 2. 使用 Cloudflare 配置
echo "⚙️ 切换到 Cloudflare 配置..."
cp next.config.cloudflare.ts next.config.ts

# 3. 设置环境变量
export CLOUDFLARE_BUILD=true

# 4. 构建静态站点
echo "🔨 构建静态站点..."
npm run build

# 5. 部署到 Cloudflare Pages
echo "🌐 部署到 Cloudflare Pages..."
npx wrangler pages deploy out --project-name=rolittmain

# 6. 恢复原始配置
echo "🔄 恢复原始配置..."
cp next.config.railway.ts next.config.ts
rm next.config.railway.ts

echo "✅ 部署完成！"