#!/usr/bin/env node

/**
 * Supabase 配置检查脚本
 * 用于验证本地和生产环境的 Supabase 配置
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

function checkSupabaseConfig() {
  console.log('🔍 检查 Supabase 配置...\n');

  // 检查客户端环境变量
  const clientConfig = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  // 检查服务端环境变量（可选）
  const serverConfig = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  console.log('📋 客户端配置 (必需):');
  let clientOK = true;
  for (const [key, value] of Object.entries(clientConfig)) {
    if (value) {
      console.log(`✅ ${key}: ${value.substring(0, 30)}...`);
    } else {
      console.log(`❌ ${key}: 未配置`);
      clientOK = false;
    }
  }

  console.log('\n📋 服务端配置 (可选):');
  for (const [key, value] of Object.entries(serverConfig)) {
    if (value) {
      console.log(`✅ ${key}: ${value.substring(0, 30)}...`);
    } else {
      console.log(`⚠️  ${key}: 未配置 (可选)`);
    }
  }

  console.log('\n🎯 配置状态:');
  if (clientOK) {
    console.log('✅ Supabase 客户端配置完整');
  } else {
    console.log('❌ Supabase 客户端配置不完整');
    console.log('\n🚨 紧急修复步骤:');
    console.log('1. 检查 .env.local 文件是否包含 Supabase 配置');
    console.log('2. 确保生产环境设置了 NEXT_PUBLIC_SUPABASE_* 环境变量');
    console.log('3. 重新部署应用');
  }

  console.log('\n📖 环境变量来源:');
  console.log('- 开发环境: .env.local');
  console.log('- 生产环境: Railway/Vercel 环境变量设置');
  console.log('- 构建时: 必须设置 NEXT_PUBLIC_* 变量');

  return clientOK;
}

// 运行检查
const isOK = checkSupabaseConfig();
process.exit(isOK ? 0 : 1);
