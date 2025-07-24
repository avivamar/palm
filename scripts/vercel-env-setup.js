#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

console.log('🔧 Vercel环境变量设置助手\n');

// 读取本地环境变量
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local文件不存在');
  console.log('请确保您在项目根目录运行此脚本');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').filter(line =>
  line.trim() && !line.startsWith('#'),
);

// 关键环境变量
const criticalVars = [
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'APP_URL',
  'NEXT_PUBLIC_APP_URL',
];

const importantVars = [
  'FIREBASE_SERVICE_ACCOUNT_KEY',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'KLAVIYO_API_KEY',
];

// Admin 访问控制相关变量
const adminVars = [
  'ADMIN_ACCESS_ENABLED',
  'ADMIN_MAINTENANCE_MODE',
  'ADMIN_EMERGENCY_BYPASS',
  'ADMIN_ALLOWED_IPS',
];

console.log('📋 检查本地环境变量配置:\n');

const foundVars = {};
const missingCritical = [];
const missingImportant = [];

// 解析环境变量
envLines.forEach((line) => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    foundVars[key.trim()] = valueParts.join('=').trim();
  }
});

// 检查关键变量
criticalVars.forEach((varName) => {
  if (foundVars[varName]) {
    console.log(`✅ ${varName}`);
  } else {
    console.log(`❌ ${varName} - 缺失`);
    missingCritical.push(varName);
  }
});

console.log('\n📋 检查重要环境变量:\n');

// 检查重要变量
importantVars.forEach((varName) => {
  if (foundVars[varName]) {
    console.log(`✅ ${varName}`);
  } else {
    console.log(`⚠️  ${varName} - 缺失`);
    missingImportant.push(varName);
  }
});

console.log('\n🔐 检查 Admin 访问控制变量:\n');

// 检查 Admin 变量
const missingAdmin = [];
adminVars.forEach((varName) => {
  if (foundVars[varName]) {
    console.log(`✅ ${varName}`);
  } else {
    console.log(`⚠️  ${varName} - 缺失`);
    missingAdmin.push(varName);
  }
});

// 生成Vercel CLI命令
console.log('\n🚀 Vercel环境变量设置命令:\n');
console.log('复制以下命令到Vercel CLI中运行：\n');

Object.entries(foundVars).forEach(([key, value]) => {
  if ([...criticalVars, ...importantVars, ...adminVars].includes(key)) {
    // 处理包含特殊字符的值
    const escapedValue = value.includes(' ') || value.includes('"') || value.includes('\'')
      ? `"${value.replace(/"/g, '\\"')}"`
      : value;

    console.log(`vercel env add ${key} production`);
    console.log(`# 然后输入值: ${key.includes('SECRET') || key.includes('KEY') ? '***hidden***' : escapedValue}`);
    console.log('');
  }
});

// 重要提醒
console.log('\n⚠️  重要提醒:\n');

if (missingCritical.length > 0) {
  console.log(`❌ 缺失关键环境变量: ${missingCritical.join(', ')}`);
  console.log('这些变量必须配置，否则支付功能无法工作！\n');
}

if (missingImportant.length > 0) {
  console.log(`⚠️  缺失重要环境变量: ${missingImportant.join(', ')}`);
  console.log('这些变量影响部分功能，建议配置\n');
}

if (missingAdmin.length > 0) {
  console.log(`🔐 缺失 Admin 访问控制变量: ${missingAdmin.join(', ')}`);
  console.log('这些变量控制 Admin 后台访问，如需使用 Admin 功能请配置\n');
}

// 特殊检查
if (foundVars.APP_URL && foundVars.APP_URL.includes('localhost')) {
  console.log('🚨 APP_URL仍指向localhost！');
  console.log('请更新为Vercel域名，例如: https://your-app.vercel.app\n');
}

if (foundVars.STRIPE_SECRET_KEY) {
  const isTestKey = foundVars.STRIPE_SECRET_KEY.startsWith('sk_test_');
  const isLiveKey = foundVars.STRIPE_SECRET_KEY.startsWith('sk_live_');

  if (isTestKey) {
    console.log('💰 检测到Stripe测试密钥 - 适用于开发/测试环境');
  } else if (isLiveKey) {
    console.log('💰 检测到Stripe生产密钥 - 适用于生产环境');
  } else {
    console.log('⚠️  Stripe密钥格式异常，请检查');
  }
  console.log('');
}

// 下一步指引
console.log('📝 下一步操作:\n');
console.log('1. 安装Vercel CLI: npm i -g vercel');
console.log('2. 登录Vercel: vercel login');
console.log('3. 运行上述环境变量命令');
console.log('4. 重新部署: vercel --prod');
console.log('5. 测试: 访问 https://your-domain.vercel.app/api/debug/health');
console.log('\n🎉 完成后您的支付系统应该就能正常工作了！');

// 生成环境变量检查清单文件
const checklistContent = `# Vercel环境变量配置检查清单

## 关键环境变量 (必须配置)
${criticalVars.map(v => `- [ ] ${v}${foundVars[v] ? ' ✅' : ' ❌'}`).join('\n')}

## 重要环境变量 (建议配置)  
${importantVars.map(v => `- [ ] ${v}${foundVars[v] ? ' ✅' : ' ⚠️'}`).join('\n')}

## Admin 访问控制变量 (Admin 功能必需)
${adminVars.map(v => `- [ ] ${v}${foundVars[v] ? ' ✅' : ' ⚠️'}`).join('\n')}

## 验证步骤
- [ ] 在Vercel Dashboard检查环境变量
- [ ] 重新部署应用
- [ ] 访问健康检查API: /api/debug/health
- [ ] 测试支付流程
- [ ] 测试 Admin 后台访问: /admin

## 常见问题
1. APP_URL必须指向Vercel域名，不能是localhost
2. JSON格式的环境变量需要用引号包裹
3. Stripe密钥必须匹配环境(test vs live)
4. 数据库URL必须包含SSL配置
5. ADMIN_ACCESS_ENABLED=true 才能访问 Admin 后台

生成时间: ${new Date().toISOString()}
`;

fs.writeFileSync('vercel-env-checklist.md', checklistContent);
console.log('\n📄 环境变量检查清单已保存到: vercel-env-checklist.md');
