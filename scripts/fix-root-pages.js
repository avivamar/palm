const fs = require('node:fs');
const path = require('node:path');

// 需要修复的页面
const pages = [
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

// 修复每个页面
pages.forEach((pageName) => {
  const pageFile = `src/app/${pageName}/page.tsx`;

  if (!fs.existsSync(pageFile)) {
    console.log(`Skipping ${pageName} - file not found`);
    return;
  }

  let content = fs.readFileSync(pageFile, 'utf8');

  // 添加缺失的导入
  if (!content.includes('import { getTranslations }')) {
    content = content.replace(
      /import type \{ Metadata.*?\} from 'next';/,
      'import type { Metadata, Viewport } from \'next\';\nimport { getTranslations } from \'next-intl/server\';',
    );
  }

  // 移除未使用的类型定义和参数
  content = content
    // 移除类型定义
    .replace(/\/\/.*Updated interface.*\n.*\n.*\n.*\n/g, '')
    .replace(/type\s+\w+Props\s*=\s*\{\s*params:\s*Promise<\{\s*locale:\s*string\s*\}>;\s*\};\s*\n/g, '')

    // 修复函数签名
    .replace(/export async function generateMetadata\(\s*\{\s*params,?\s*\}:\s*\w+Props\s*\):/g, 'export async function generateMetadata():')
    .replace(/export default async function \w+\(\s*props:\s*\w+Props\s*\)/g, 'export default async function Page()')

    // 移除未使用的参数解构
    .replace(/const\s*\{\s*locale\s*\}\s*=\s*await\s+props\.params;\s*\n/g, '')
    .replace(/const\s*\{\s*locale\s*\}\s*=\s*await\s+params;\s*\n/g, '')

    // 修复URL构建
    .replace(/https:\/\/rolitt\.com/g, 'https://www.rolitt.com')
    .replace(/zh:/g, 'es:')
    .replace(/zh\//g, 'es/')
    .replace(/zh"/g, 'es"')

    // 添加缺失的语言
    .replace(/es: `\$\{baseUrl\}\/es/g, 'es: `${baseUrl}/es')
    .replace(/vi: `\$\{baseUrl\}\/vi/g, '\'zh-HK\': `${baseUrl}/zh-HK/${pageName}`,\n        vi: `${baseUrl}/vi');

  // 确保有正确的语言列表
  if (content.includes('languages: {')) {
    content = content.replace(
      /languages: \{\s*en:[^}]+\}/g,
      `languages: {
        en: \`\${baseUrl}/${pageName}\`,
        es: \`\${baseUrl}/es/${pageName}\`,
        ja: \`\${baseUrl}/ja/${pageName}\`,
        ko: \`\${baseUrl}/ko/${pageName}\`,
        'zh-HK': \`\${baseUrl}/zh-HK/${pageName}\`,
        vi: \`\${baseUrl}/vi/${pageName}\`,
        ar: \`\${baseUrl}/ar/${pageName}\`,
      }`,
    );
  }

  fs.writeFileSync(pageFile, content);
  console.log(`Fixed ${pageFile}`);
});

console.log('Root pages fix completed!');
