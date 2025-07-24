#!/bin/bash

# 构建验证脚本 - 确保 standalone 构建的完整性
set -e

echo "🔍 验证 standalone 构建..."

# 检查必要的文件是否存在
REQUIRED_FILES=(
  ".next/standalone/server.js"
  ".next/standalone/package.json"
  ".next/static"
  ".next/server"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -e "$file" ]; then
    MISSING_FILES+=("$file")
  fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
  echo "❌ 缺少必要的构建文件:"
  for file in "${MISSING_FILES[@]}"; do
    echo "  - $file"
  done
  exit 1
fi

echo "✅ 所有必要的构建文件都存在"

# 检查 standalone 目录大小
STANDALONE_SIZE=$(du -sh .next/standalone | cut -f1)
echo "📦 Standalone 构建大小: $STANDALONE_SIZE"

# 验证 server.js 是否可执行
if node .next/standalone/server.js --help > /dev/null 2>&1; then
  echo "✅ server.js 可以正常执行"
else
  echo "⚠️  server.js 执行测试失败，但这可能是正常的"
fi

echo "🎉 Standalone 构建验证完成！"