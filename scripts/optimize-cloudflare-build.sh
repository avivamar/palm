#!/bin/bash

# Cloudflare Workers 体积优化脚本
# 删除不必要的大型文件以减少 Worker 体积

echo "🔧 优化 Cloudflare Workers 体积..."

# 检查 .open-next 目录是否存在
if [ ! -d ".open-next" ]; then
    echo "❌ .open-next 目录不存在，请先运行构建"
    exit 1
fi

# 记录优化前的大小
BEFORE_SIZE=$(du -s .open-next 2>/dev/null | cut -f1 || echo "0")

# 要删除的大型文件列表
FILES_TO_REMOVE=(
  ".open-next/server-functions/default/node_modules/next/dist/compiled/amphtml-validator/validator_wasm.js"
  ".open-next/server-functions/default/node_modules/next/dist/compiled/babel-packages/packages-bundle.js"
  ".open-next/server-functions/default/node_modules/next/dist/compiled/babel/bundle.js"
  ".open-next/server-functions/default/node_modules/terser-webpack-plugin/node_modules/terser/dist/bundle.min.js"
  ".open-next/server-functions/default/node_modules/next/dist/compiled/@next/font/dist/fontkit/index.js"
  ".open-next/server-functions/default/node_modules/uglify-js/lib/compress.js"
  ".open-next/server-functions/default/node_modules/next/dist/compiled/@edge-runtime/primitives/load.js"
  ".open-next/server-functions/default/node_modules/next/dist/compiled/edge-runtime/index.js"
)

# 要删除的大型目录列表
DIRS_TO_REMOVE=(
  ".open-next/server-functions/default/node_modules/next/dist/compiled/amphtml-validator"
  ".open-next/server-functions/default/node_modules/terser-webpack-plugin"
  ".open-next/server-functions/default/node_modules/uglify-js"
  ".open-next/server-functions/default/node_modules/next/dist/compiled/@edge-runtime/primitives"
  ".open-next/server-functions/default/node_modules/next/dist/compiled/edge-runtime"
)

TOTAL_SAVED=0

# 删除大型文件
for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    FILE_SIZE=$(du -k "$file" 2>/dev/null | cut -f1 || echo "0")
    rm -f "$file"
    TOTAL_SAVED=$((TOTAL_SAVED + FILE_SIZE))
    echo "✅ 删除文件: $file ($(echo $FILE_SIZE | awk '{printf "%.1f MB", $1/1024}'))"
  fi
done

# 删除大型目录
for dir in "${DIRS_TO_REMOVE[@]}"; do
  if [ -d "$dir" ]; then
    DIR_SIZE=$(du -sk "$dir" 2>/dev/null | cut -f1 || echo "0")
    rm -rf "$dir"
    TOTAL_SAVED=$((TOTAL_SAVED + DIR_SIZE))
    echo "✅ 删除目录: $dir ($(echo $DIR_SIZE | awk '{printf "%.1f MB", $1/1024}'))"
  fi
done

# 记录优化后的大小
AFTER_SIZE=$(du -s .open-next 2>/dev/null | cut -f1 || echo "0")

echo "💾 总共节省空间: $(echo $TOTAL_SAVED | awk '{printf "%.1f MB", $1/1024}')"

# 显示最终大小
FINAL_SIZE_MB=$(echo $AFTER_SIZE | awk '{printf "%.1f", $1/1024}')
echo "📊 优化后 .open-next 目录大小: ${FINAL_SIZE_MB} MB"

# 检查是否符合 Cloudflare Workers 免费计划限制 (3MB)
if [ $(echo "$AFTER_SIZE < 3072" | bc -l 2>/dev/null || [ $AFTER_SIZE -lt 3072 ]) ]; then
  echo "✅ 构建大小符合免费计划限制 (< 3MB)"
else
  echo "⚠️  构建大小超过免费计划限制 (3MB)，需要付费计划"
fi

echo "🎉 优化完成！"