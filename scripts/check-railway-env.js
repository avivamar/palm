#!/usr/bin/env node

/**
 * Railway 部署环境变量检查脚本
 * 专门检查 Railway 部署时需要的环境变量
 */

console.log('🚂 Railway 部署环境变量检查\n');

// 检查关键的 Supabase 环境变量
const checkSupabase = () => {
  console.log('📊 Supabase 配置检查:');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅' : '❌'}`);

  if (supabaseUrl) {
    console.log(`    URL: ${supabaseUrl}`);
    if (!supabaseUrl.includes('supabase.co')) {
      console.log('    ⚠️  警告: URL 格式可能不正确');
    }
  }

  if (supabaseKey) {
    console.log(`    Key 前缀: ${supabaseKey.substring(0, 20)}...`);
    if (!supabaseKey.startsWith('eyJ')) {
      console.log('    ⚠️  警告: Key 格式可能不正确');
    }
  }

  return Boolean(supabaseUrl && supabaseKey);
};

// 检查 Firebase 环境变量
const checkFirebase = () => {
  console.log('\n🔥 Firebase 配置检查:');

  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const firebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  console.log(`  NEXT_PUBLIC_FIREBASE_API_KEY: ${firebaseApiKey ? '✅' : '❌'}`);
  console.log(`  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${firebaseAuthDomain ? '✅' : '❌'}`);
  console.log(`  NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${firebaseProjectId ? '✅' : '❌'}`);
  console.log(`  NEXT_PUBLIC_FIREBASE_APP_ID: ${firebaseAppId ? '✅' : '❌'}`);

  return Boolean(firebaseApiKey && firebaseAuthDomain && firebaseProjectId && firebaseAppId);
};

// 检查其他重要配置
const checkOtherConfig = () => {
  console.log('\n⚙️ 其他重要配置:');

  const databaseUrl = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

  console.log(`  DATABASE_URL: ${databaseUrl ? '✅' : '❌'}`);
  console.log(`  NODE_ENV: ${nodeEnv || '未设置'}`);
  console.log(`  APP_URL: ${appUrl ? '✅' : '❌'}`);

  // PostHog 配置（必需）
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  console.log(`  NEXT_PUBLIC_POSTHOG_KEY: ${posthogKey ? '✅' : '❌'}`);
  console.log(`  NEXT_PUBLIC_POSTHOG_HOST: ${posthogHost ? '✅' : '❌'}`);
};

// 构建时环境检查
const checkBuildEnvironment = () => {
  console.log('\n🏗️ 构建环境检查:');

  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
    || process.argv.includes('build')
    || process.argv.includes('export');

  console.log(`  构建阶段: ${isBuildTime ? 'Yes' : 'No'}`);
  console.log(`  NEXT_PHASE: ${process.env.NEXT_PHASE || '未设置'}`);

  return isBuildTime;
};

// Railway 特定检查
const checkRailwayEnvironment = () => {
  console.log('\n🚂 Railway 环境检查:');

  const railwayEnv = process.env.RAILWAY_ENVIRONMENT;
  const railwayService = process.env.RAILWAY_SERVICE_NAME;
  const railwayProject = process.env.RAILWAY_PROJECT_NAME;

  console.log(`  RAILWAY_ENVIRONMENT: ${railwayEnv || '未检测到'}`);
  console.log(`  RAILWAY_SERVICE_NAME: ${railwayService || '未检测到'}`);
  console.log(`  RAILWAY_PROJECT_NAME: ${railwayProject || '未检测到'}`);

  const isRailway = Boolean(railwayEnv || railwayService);
  console.log(`  Railway 环境: ${isRailway ? 'Yes' : 'No'}`);

  return isRailway;
};

// 主检查函数
const main = () => {
  const isRailway = checkRailwayEnvironment();
  const isBuildTime = checkBuildEnvironment();
  const supabaseOk = checkSupabase();
  const firebaseOk = checkFirebase();
  checkOtherConfig();

  console.log('\n📋 检查总结:');
  console.log(`  Supabase 配置: ${supabaseOk ? '✅ 完整' : '❌ 不完整'}`);
  console.log(`  Firebase 配置: ${firebaseOk ? '✅ 完整' : '❌ 不完整'}`);

  // 如果是 Railway 构建时缺少 Supabase 配置，提供详细指导
  if (isRailway && isBuildTime && !supabaseOk) {
    console.log('\n🔧 Railway 修复指南:');
    console.log('1. 登录 Railway 控制台');
    console.log('2. 选择你的项目和服务');
    console.log('3. 进入 "Variables" 选项卡');
    console.log('4. 添加以下环境变量:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('5. 从 Supabase 控制台 > Settings > API 获取这些值');
    console.log('6. 保存并重新部署');

    console.log('\n⚠️  错误: 缺少必需的 Supabase 环境变量');
    process.exit(1);
  }

  if (!firebaseOk && !supabaseOk) {
    console.log('\n❌ 错误: 认证系统未配置，应用无法正常工作');
    process.exit(1);
  }

  if (!supabaseOk) {
    console.log('\n⚠️  警告: Supabase 未配置，某些功能可能不可用');
  }

  if (!firebaseOk) {
    console.log('\n⚠️  警告: Firebase 未配置，某些功能可能不可用');
  }

  console.log('\n✅ 环境变量检查完成');
};

// 执行检查
main();
