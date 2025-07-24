#!/usr/bin/env node

const fs = require('node:fs');

console.log('🔍 分析 Railway 环境变量缺失问题...\n');

// 读取本地环境变量
const localEnvPath = '.env.local';
const railwayEnvPath = '.env.railway';

if (!fs.existsSync(localEnvPath)) {
  console.error('❌ 找不到 .env.local 文件');
  process.exit(1);
}

if (!fs.existsSync(railwayEnvPath)) {
  console.error('❌ 找不到 .env.railway 文件');
  process.exit(1);
}

// 解析本地环境变量
const localEnvContent = fs.readFileSync(localEnvPath, 'utf8');
const localEnvVars = {};

localEnvContent.split('\n').forEach((line) => {
  line = line.trim();
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    localEnvVars[key.trim()] = value.trim();
  }
});

// 解析 Railway 环境变量
const railwayEnvContent = fs.readFileSync(railwayEnvPath, 'utf8');
const railwayEnvVars = JSON.parse(railwayEnvContent);

console.log('📊 环境变量对比分析:');

console.log(`本地环境变量数量: ${Object.keys(localEnvVars).length}`);

console.log(`Railway 环境变量数量: ${Object.keys(railwayEnvVars).length}\n`);

// 找出缺失的关键变量
const criticalVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'APP_URL',
  'NEXT_PUBLIC_APP_URL',
];

const missingCritical = [];
const missingAll = [];

Object.keys(localEnvVars).forEach((key) => {
  if (!Object.prototype.hasOwnProperty.call(railwayEnvVars, key)) {
    missingAll.push(key);
    if (criticalVars.includes(key)) {
      missingCritical.push(key);
    }
  }
});

console.log('🚨 缺失的关键环境变量:');
if (missingCritical.length === 0) {
  console.log('✅ 所有关键环境变量都已配置');
} else {
  missingCritical.forEach((key) => {
    console.log(`❌ ${key}: ${localEnvVars[key]}`);
  });
}

console.log('\n📝 所有缺失的环境变量:');
if (missingAll.length === 0) {
  console.log('✅ 所有环境变量都已同步');
} else {
  missingAll.forEach((key) => {
    console.log(`- ${key}`);
  });
}

// 生成修复后的 Railway 环境变量文件
const fixedRailwayEnv = { ...railwayEnvVars };

// 添加缺失的关键变量
missingCritical.forEach((key) => {
  if (localEnvVars[key]) {
    fixedRailwayEnv[key] = localEnvVars[key];
  }
});

// 特别检查 Supabase 变量
if (!fixedRailwayEnv.NEXT_PUBLIC_SUPABASE_URL && localEnvVars.NEXT_PUBLIC_SUPABASE_URL) {
  fixedRailwayEnv.NEXT_PUBLIC_SUPABASE_URL = localEnvVars.NEXT_PUBLIC_SUPABASE_URL;
}

if (!fixedRailwayEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY && localEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  fixedRailwayEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY = localEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

// 写入修复后的文件
const fixedFilePath = '.env.railway.fixed';
fs.writeFileSync(fixedFilePath, JSON.stringify(fixedRailwayEnv, null, 2));

console.log(`\n✅ 已生成修复后的环境变量文件: ${fixedFilePath}`);

console.log('\n🔧 修复步骤:');

console.log('1. 复制修复后的环境变量到 Railway 项目');

console.log('2. 在 Railway 控制台中逐个添加缺失的环境变量');

console.log('3. 重新部署项目');

console.log('\n📋 Railway CLI 快速导入命令:');

console.log('railway variables set --file .env.railway.fixed');
