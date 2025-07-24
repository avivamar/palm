#!/bin/bash

# 自动创建日志文件的脚本
# 使用方法: ./scripts/create-log.sh "brief-description"

if [ $# -eq 0 ]; then
    echo "使用方法: $0 \"brief-description\""
    echo "示例: $0 \"api-timeout-handling-optimization\""
    exit 1
fi

# 获取当前时间戳
TIMESTAMP=$(date +"%Y-%m-%d-%H-%M")

# 获取描述参数
DESCRIPTION="$1"

# 生成文件名
FILENAME="${TIMESTAMP}-${DESCRIPTION}.md"

# 完整路径
FILE_PATH="log/${FILENAME}"

echo "正在创建日志文件: ${FILE_PATH}"

# 检查文件是否已存在
if [ -f "$FILE_PATH" ]; then
    echo "错误: 文件 ${FILE_PATH} 已存在"
    exit 1
fi

# 创建日志文件，使用模板
cat > "$FILE_PATH" << 'EOF'
# 变更日志

## 变更概述
**变更时间**: 
**变更类型**: 
**影响范围**: 
**变更状态**: ✅ 已完成

## 主要目标
- [ ] 
- [ ] 
- [ ] 

## 涉及文件变更
### 新增文件
- 

### 修改文件
- 

### 删除文件
- 

## 技术实现
### 核心变更

### 关键代码片段
```typescript
// 示例代码
```

## 关键决策
1. **决策**: 
   - **原因**: 
   - **影响**: 

## 修复的问题
- **问题**: 
  - **解决方案**: 
  - **验证**: 

## 统计数据
- **修改文件数**: 
- **新增代码行数**: 
- **删除代码行数**: 
- **测试覆盖率**: 

## 验证结果
### 功能测试
- [ ] 
- [ ] 

### 性能测试
- [ ] 
- [ ] 

### 兼容性测试
- [ ] 
- [ ] 

## 后续步骤
1. 
2. 
3. 

## 技术债务
- 

## 已知问题
- 

## 文档更新
- [ ] README.md
- [ ] API 文档
- [ ] 部署文档

## 回滚计划
如需回滚，执行以下步骤：
1. 
2. 
3. 

## 成果总结
### 主要成就
- 

### 性能提升
- 

### 用户体验改进
- 

---
**变更负责人**: 
**审核人**: 
**联系方式**: 
EOF

echo "✅ 日志文件创建成功: ${FILE_PATH}"
echo "📝 请编辑文件并填写相关信息"
echo "🕒 当前时间戳: ${TIMESTAMP}"