#!/usr/bin/env node
/**
 * 颜色配置同步脚本
 * 自动将集中化的颜色配置同步到各个需要的地方
 */

// 导入颜色配置（需要先编译 TypeScript）
const { execSync } = require('node:child_process');
const fs = require('node:fs');

const path = require('node:path');

// 编译 TypeScript 配置文件
function compileColorConfig() {
  try {
    console.log('📦 正在编译 TypeScript 配置文件...');

    // 确保 temp 目录存在
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 使用 --skipLibCheck 跳过库文件类型检查，避免第三方库类型错误
    const result = execSync('npx tsc src/config/colors.ts --outDir temp --target es2020 --module commonjs --esModuleInterop --skipLibCheck --noEmitOnError false', {
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf8',
    });

    const compiledPath = path.join(process.cwd(), 'temp/colors.js');
    if (!fs.existsSync(compiledPath)) {
      throw new Error(`编译后的文件不存在: ${compiledPath}`);
    }

    console.log('✅ TypeScript 编译成功');
    return require(compiledPath);
  } catch (error) {
    console.error('编译颜色配置文件失败:', error.message);
    if (error.stdout) {
      console.error('stdout:', error.stdout);
    }
    if (error.stderr) {
      console.error('stderr:', error.stderr);
    }
    process.exit(1);
  }
}

// 更新 .env.local 文件中的颜色价格映射
function updateEnvFile(colorConfig) {
  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    console.error('.env.local 文件不存在');
    return;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  const priceMap = colorConfig.generateStripePriceMap();
  const priceMapJson = JSON.stringify(priceMap);

  // 更新 COLOR_PRICE_MAP
  envContent = envContent.replace(
    /COLOR_PRICE_MAP=.*/,
    `COLOR_PRICE_MAP=${priceMapJson}`,
  );

  // 更新 COLOR_PRICE_MAP_JSON
  envContent = envContent.replace(
    /COLOR_PRICE_MAP_JSON=.*/,
    `COLOR_PRICE_MAP_JSON=${priceMapJson}`,
  );

  fs.writeFileSync(envPath, envContent);
  console.log('✅ 已更新 .env.local 文件中的颜色价格映射');
}

// 更新数据库 Schema 中的枚举值
function updateSchemaEnum(colorConfig) {
  const schemaPath = path.join(process.cwd(), 'src/models/Schema.ts');

  if (!fs.existsSync(schemaPath)) {
    console.error('Schema.ts 文件不存在');
    return;
  }

  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const enumValues = colorConfig.getColorEnumValues();
  const enumString = enumValues.map(value => `'${value}'`).join(', ');

  // 更新 productColorEnum
  schemaContent = schemaContent.replace(
    /export const productColorEnum = pgEnum\('product_color', \[.*?\]\);/,
    `export const productColorEnum = pgEnum('product_color', [${enumString}]);`,
  );

  fs.writeFileSync(schemaPath, schemaContent);
  console.log('✅ 已更新 Schema.ts 文件中的颜色枚举');
}

// 生成颜色配置文档
function generateColorDocs(colorConfig) {
  const docsPath = path.join(process.cwd(), 'docs/colors-config.md');
  const colors = colorConfig.getEnabledColors();

  let docContent = `# 产品颜色配置文档\n\n`;
  docContent += `> 此文档由脚本自动生成，请勿手动编辑\n\n`;
  docContent += `## 当前可用颜色\n\n`;
  docContent += `| 颜色ID | 显示名称 | 英文名称 | 十六进制值 | Stripe价格ID | 图片路径 | 状态 |\n`;
  docContent += `|--------|----------|----------|------------|--------------|----------|------|\n`;

  colors.forEach((color) => {
    docContent += `| ${color.id} | ${color.displayName} | ${color.englishName} | ${color.hexValue} | ${color.stripePriceId || 'N/A'} | ${color.imagePath} | ${color.enabled ? '启用' : '禁用'} |\n`;
  });

  docContent += `\n## 使用说明\n\n`;
  docContent += `### 添加新颜色\n\n`;
  docContent += `1. 在 \`src/config/colors.ts\` 中添加新的颜色配置\n`;
  docContent += `2. 运行 \`npm run sync-colors\` 同步配置\n`;
  docContent += `3. 在 Stripe 后台创建对应的价格对象\n`;
  docContent += `4. 添加对应的产品图片到 \`public/pre-order/\` 目录\n\n`;
  docContent += `### 禁用颜色\n\n`;
  docContent += `1. 在 \`src/config/colors.ts\` 中将对应颜色的 \`enabled\` 设置为 \`false\`\n`;
  docContent += `2. 运行 \`npm run sync-colors\` 同步配置\n\n`;

  // 确保 docs 目录存在
  const docsDir = path.dirname(docsPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(docsPath, docContent);
  console.log('✅ 已生成颜色配置文档');
}

// 验证颜色配置的完整性
function validateColorConfig(colorConfig) {
  const colors = colorConfig.getEnabledColors();
  let hasErrors = false;

  console.log('🔍 验证颜色配置...');

  colors.forEach((color) => {
    // 检查必需字段
    if (!color.id || !color.displayName || !color.englishName) {
      console.error(`❌ 颜色配置不完整: ${color.id || '未知'}`);
      hasErrors = true;
    }

    // 检查图片文件是否存在
    const imagePath = path.join(process.cwd(), 'public', color.imagePath);
    if (!fs.existsSync(imagePath)) {
      console.warn(`⚠️  图片文件不存在: ${color.imagePath}`);
    }

    // 检查 Stripe 价格 ID 格式
    if (color.stripePriceId && !color.stripePriceId.startsWith('price_')) {
      console.warn(`⚠️  Stripe 价格 ID 格式可能不正确: ${color.stripePriceId}`);
    }
  });

  if (hasErrors) {
    console.error('❌ 颜色配置验证失败');
    process.exit(1);
  } else {
    console.log('✅ 颜色配置验证通过');
  }
}

// 清理临时文件
function cleanup() {
  const tempDir = path.join(process.cwd(), 'temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

// 主函数
function main() {
  console.log('🚀 开始同步颜色配置...');

  try {
    // 编译并加载颜色配置
    const colorConfig = compileColorConfig();

    // 验证配置
    validateColorConfig(colorConfig);

    // 同步到各个文件
    updateEnvFile(colorConfig);
    updateSchemaEnum(colorConfig);
    generateColorDocs(colorConfig);

    console.log('🎉 颜色配置同步完成！');
  } catch (error) {
    console.error('❌ 同步过程中发生错误:', error.message);
    process.exit(1);
  } finally {
    // 清理临时文件
    cleanup();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  main,
  updateEnvFile,
  updateSchemaEnum,
  generateColorDocs,
  validateColorConfig,
};
