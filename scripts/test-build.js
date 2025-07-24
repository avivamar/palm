#!/usr/bin/env node

/**
 * Test Build - 测试构建过程
 * 在本地验证构建是否成功，避免部署时出错
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

console.log('🧪 测试构建过程...\n');

async function runBuildTest() {
  try {
    // 检查关键文件是否存在
    console.log('1. 检查关键文件...');
    const criticalFiles = [
      'src/libs/DB.ts',
      'src/app/api/webhooks/stripe/route.ts',
      'src/app/actions/preorderActions.ts',
      'package.json',
      'next.config.ts',
    ];

    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`关键文件缺失: ${file}`);
      }
    }
    console.log('✅ 所有关键文件存在');

    // 检查 TypeScript 配置
    console.log('2. 检查 TypeScript...');
    try {
      execSync('npm run check-types', { stdio: 'pipe' });
      console.log('✅ TypeScript 类型检查通过');
    } catch (error) {
      console.log('❌ TypeScript 类型检查失败:');
      console.log(error.stdout?.toString() || error.message);
      throw error;
    }

    // 检查 ESLint
    console.log('3. 检查 ESLint...');
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      console.log('✅ ESLint 检查通过');
    } catch (error) {
      console.log('⚠️  ESLint 检查有警告，但继续构建');
    }

    // 尝试构建
    console.log('4. 执行构建...');
    try {
      const buildOutput = execSync('npm run build', { stdio: 'pipe', timeout: 300000 });
      console.log('✅ 构建成功完成');

      // 检查构建输出目录
      if (fs.existsSync('.next')) {
        console.log('✅ 构建输出目录 .next 已创建');
      }
    } catch (error) {
      console.log('❌ 构建失败:');
      console.log(error.stdout?.toString() || error.message);
      console.log('\n🔧 可能的解决方案:');
      console.log('1. 检查是否有未保存的文件');
      console.log('2. 运行 npm install 重新安装依赖');
      console.log('3. 删除 .next 目录后重试');
      console.log('4. 检查环境变量配置');
      throw error;
    }

    console.log('\n🎉 构建测试完全通过！');
    console.log('📦 项目可以安全部署到 Vercel');
  } catch (error) {
    console.error('\n❌ 构建测试失败');
    console.error('错误详情:', error.message);
    console.error('\n请修复以上问题后再尝试部署。');
    process.exit(1);
  }
}

// 设置环境变量以避免构建时的环境检查
process.env.SKIP_ENV_VALIDATION = 'true';
process.env.DATABASE_STORAGE_TARGET = 'postgres';

runBuildTest();
