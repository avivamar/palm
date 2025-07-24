const fs = require('node:fs');
const path = require('node:path');

// 需要创建根路径版本的页面
const pages = [
  'about',
  'timeline',
  'solution',
  'partner',
  'contact',
  'contact-information',
  'faq',
  'privacy',
  'terms',
  'refund-policy',
  'shipping',
  'portfolio',
  'pre-order',
  'counter',
];

// 为每个页面创建根路径版本
pages.forEach((pageName) => {
  const sourceDir = `src/app/[locale]/(marketing)/${pageName}`;
  const targetDir = `src/app/${pageName}`;

  // 检查源目录是否存在
  if (!fs.existsSync(sourceDir)) {
    console.log(`Skipping ${pageName} - source directory not found`);
    return;
  }

  // 创建目标目录
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 读取源页面文件
  const sourcePageFile = path.join(sourceDir, 'page.tsx');
  if (!fs.existsSync(sourcePageFile)) {
    console.log(`Skipping ${pageName} - page.tsx not found`);
    return;
  }

  const sourceContent = fs.readFileSync(sourcePageFile, 'utf8');

  // 修改内容以适应根路径
  const modifiedContent = sourceContent
    // 移除 unstable_setRequestLocale 相关导入和调用
    .replace(/import.*unstable_setRequestLocale.*from.*;\n/g, '')
    .replace(/unstable_setRequestLocale\(locale\);\n/g, '')

    // 修改类型定义
    .replace(/type\s+\w+Props\s*=\s*\{\s*params:\s*Promise<\{\s*locale:\s*string\s*\}>;\s*\};/g, '')

    // 修改函数签名
    .replace(/export\s+async\s+function\s+generateMetadata\(\s*\{\s*params\s*\}:\s*\w+Props\s*\):/g, 'export async function generateMetadata():')
    .replace(/export\s+default\s+async\s+function\s+\w+\(\s*props:\s*\w+Props\s*\)/g, 'export default async function Page()')

    // 修改函数体中的参数使用
    .replace(/const\s*\{\s*locale\s*\}\s*=\s*await\s+props\.params;\n/g, '')
    .replace(/const\s*\{\s*locale\s*\}\s*=\s*await\s+params;\n/g, '')

    // 修改 getTranslations 调用
    .replace(/getTranslations\(\s*\{\s*locale,\s*namespace:/g, 'getTranslations({ locale: \'en\', namespace:')
    .replace(/getTranslations\(\s*\{\s*locale\s*\}\s*\)/g, 'getTranslations({ locale: \'en\' })')

    // 修改 URL 构建
    .replace(/\$\{baseUrl\}\/\$\{locale\}/g, '${baseUrl}')
    .replace(/\/en\//g, '/')
    .replace(/\/en"/g, '"')

    // 修改 alternates 语言链接
    .replace(/en:\s*`\$\{baseUrl\}\/en/g, 'en: `${baseUrl}')
    .replace(/en:\s*`\$\{baseUrl\}\//g, 'en: `${baseUrl}/');

  // 写入目标文件
  const targetPageFile = path.join(targetDir, 'page.tsx');
  fs.writeFileSync(targetPageFile, modifiedContent);

  console.log(`Created ${targetPageFile}`);
});

console.log('Root pages creation completed!');
