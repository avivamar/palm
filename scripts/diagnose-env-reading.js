#!/usr/bin/env node

/**
 * 诊断环境变量读取问题
 * 检查不同阶段的环境变量可用性
 */

console.log('🔍 环境变量读取诊断');
console.log('='.repeat(50));

// 1. 检查基本环境信息
console.log('\n📋 基本环境信息:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || '未设置'}`);
console.log(`  NEXT_PHASE: ${process.env.NEXT_PHASE || '未设置'}`);
console.log(`  PWD: ${process.cwd()}`);
console.log(`  argv: ${process.argv.join(' ')}`);

// 2. 检查所有环境变量
console.log('\n🌍 所有环境变量数量:');
const allEnvVars = Object.keys(process.env);
console.log(`  总数: ${allEnvVars.length}`);

// 3. 检查 NEXT_PUBLIC_ 前缀的变量
console.log('\n🔍 NEXT_PUBLIC_ 环境变量:');
const nextPublicVars = allEnvVars.filter(key => key.startsWith('NEXT_PUBLIC_'));
console.log(`  数量: ${nextPublicVars.length}`);

if (nextPublicVars.length > 0) {
  nextPublicVars.forEach((key) => {
    const value = process.env[key];
    console.log(`  ${key}: ${value ? (value.length > 50 ? `${value.substring(0, 50)}...` : value) : '空值'}`);
  });
} else {
  console.log('  ❌ 未找到任何 NEXT_PUBLIC_ 变量');
}

// 4. 特别检查 Supabase 变量
console.log('\n🔍 Supabase 变量详细检查:');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`  NEXT_PUBLIC_SUPABASE_URL:`);
console.log(`    存在: ${!!supabaseUrl}`);
console.log(`    类型: ${typeof supabaseUrl}`);
console.log(`    长度: ${supabaseUrl?.length || 0}`);
console.log(`    值: ${supabaseUrl || '未设置'}`);
console.log(`    是否占位符: ${supabaseUrl?.includes('placeholder') || supabaseUrl?.includes('build-placeholder') ? '是' : '否'}`);

console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY:`);
console.log(`    存在: ${!!supabaseKey}`);
console.log(`    类型: ${typeof supabaseKey}`);
console.log(`    长度: ${supabaseKey?.length || 0}`);
console.log(`    值: ${supabaseKey ? `${supabaseKey.substring(0, 30)}...` : '未设置'}`);
console.log(`    是否占位符: ${supabaseKey?.includes('placeholder') || supabaseKey?.includes('build-placeholder') ? '是' : '否'}`);

// 5. 检查 Railway 特定变量
console.log('\n🚂 Railway 特定变量:');
const railwayVars = allEnvVars.filter(key => key.startsWith('RAILWAY_'));
if (railwayVars.length > 0) {
  railwayVars.forEach((key) => {
    console.log(`  ${key}: ${process.env[key] || '未设置'}`);
  });
} else {
  console.log('  ❌ 未找到 RAILWAY_ 变量');
}

// 6. 检查其他重要变量
console.log('\n⚙️ 其他重要变量:');
const importantVars = [
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_POSTHOG_HOST',
  'DATABASE_URL',
  'VERCEL',
  'VERCEL_ENV',
  'CI',
  'GITHUB_ACTIONS',
];

importantVars.forEach((key) => {
  const value = process.env[key];
  console.log(`  ${key}: ${value ? (value.length > 50 ? `${value.substring(0, 50)}...` : value) : '未设置'}`);
});

// 7. 检查 process.env 对象的特殊情况
console.log('\n🔬 process.env 对象分析:');
try {
  console.log(`  可枚举属性数量: ${Object.keys(process.env).length}`);
  console.log(`  可访问性测试:`);

  // 直接访问测试
  const directAccess = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log(`    直接访问: ${directAccess ? '✅' : '❌'}`);

  // 解构测试
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
  console.log(`    解构访问: ${NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}`);

  // Object.hasOwnProperty 测试
  console.log(`    hasOwnProperty 测试: ${process.env.hasOwnProperty('NEXT_PUBLIC_SUPABASE_URL') ? '✅' : '❌'}`);

  // in 操作符测试
  console.log(`    in 操作符测试: ${'NEXT_PUBLIC_SUPABASE_URL' in process.env ? '✅' : '❌'}`);
} catch (error) {
  console.log(`  ❌ 分析出错: ${error.message}`);
}

// 8. 尝试从不同来源读取配置
console.log('\n📁 配置文件检查:');
const fs = require('node:fs');
const path = require('node:path');

const configFiles = ['.env', '.env.local', '.env.production', '.env.production.local'];
configFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${file}: ${exists ? '✅ 存在' : '❌ 不存在'}`);

  if (exists) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      console.log(`    行数: ${lines.length}`);
      const hasSupabase = lines.some(line => line.includes('SUPABASE'));
      console.log(`    包含 Supabase: ${hasSupabase ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`    读取错误: ${error.message}`);
    }
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log('🏁 诊断完成');
