#!/usr/bin/env node

/**
 * 验证所有API路由都有正确的runtime声明
 * 自动检测需要Node.js runtime的API路由并添加声明
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 需要Node.js runtime的导入模式
const NODE_RUNTIME_PATTERNS = [
  /from ['"]@\/libs\/supabase/,
  /from ['"]@\/libs\/DB/,
  /from ['"]@\/models\/Schema/,
  /from ['"]drizzle-orm/,
  /from ['"]stripe['"]/, 
  /from ['"]@notionhq\/client/,
  /from ['"]@rolitt\/shopify/,
  /from ['"]node:crypto/,
  /from ['"]fs['"]/, 
  /from ['"]path['"]/, 
  /from ['"]sharp['"]/, 
  /createServerClient/,
  /getDB|getSafeDB/,
  /webhookLogsSchema|usersSchema|preordersSchema/,
];

// 检查文件是否需要Node.js runtime
function needsNodeRuntime(content) {
  return NODE_RUNTIME_PATTERNS.some(pattern => pattern.test(content));
}

// 检查文件是否已有runtime声明
function hasRuntimeDeclaration(content) {
  return /export\s+const\s+runtime\s*=\s*['"]nodejs['"]/.test(content);
}

// 添加runtime声明
function addRuntimeDeclaration(content) {
  // 找到最后一个import语句后的位置
  const lines = content.split('\n');
  let importEndIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^import\s+/) || lines[i].match(/^\/\/ import/) || lines[i].match(/^\/\*.*import/)) {
      importEndIndex = i;
    }
  }
  
  if (importEndIndex === -1) {
    // 如果没有import，在文件开头添加
    return `// Add runtime declaration for Node.js compatibility\nexport const runtime = 'nodejs';\n\n${content}`;
  }
  
  // 在最后一个import后添加
  lines.splice(importEndIndex + 1, 0, '', '// Add runtime declaration for Node.js compatibility', "export const runtime = 'nodejs';");
  
  return lines.join('\n');
}

// 主函数
function main() {
  const apiRoutesPattern = path.join(__dirname, '../src/app/api/**/route.ts');
  const files = glob.sync(apiRoutesPattern);
  
  let processedCount = 0;
  let skippedCount = 0;
  
  console.log(`🔍 检查 ${files.length} 个API路由文件...\n`);
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const needsRuntime = needsNodeRuntime(content);
    const hasRuntime = hasRuntimeDeclaration(content);
    
    if (needsRuntime && !hasRuntime) {
      console.log(`✅ 添加runtime声明: ${path.relative(process.cwd(), file)}`);
      const newContent = addRuntimeDeclaration(content);
      fs.writeFileSync(file, newContent);
      processedCount++;
    } else if (!needsRuntime) {
      console.log(`⏭️  跳过简单路由: ${path.relative(process.cwd(), file)}`);
      skippedCount++;
    } else {
      console.log(`✓ 已有runtime声明: ${path.relative(process.cwd(), file)}`);
    }
  });
  
  console.log(`\n🎉 完成！处理了 ${processedCount} 个文件，跳过 ${skippedCount} 个简单路由`);
}

if (require.main === module) {
  main();
}

module.exports = { needsNodeRuntime, hasRuntimeDeclaration, addRuntimeDeclaration };