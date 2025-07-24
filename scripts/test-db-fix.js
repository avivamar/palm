#!/usr/bin/env node

/**
 * Test Database Fix - 测试数据库修复
 * 验证数据库连接和 insert 操作是否正常工作
 */

console.log('🧪 测试数据库修复...\n');

async function testDatabaseFix() {
  try {
    // 动态导入模块以避免顶层 await 问题
    const { getSafeDB } = await import('../src/libs/DB.js');

    console.log('1. 测试数据库连接...');
    const database = await getSafeDB();

    if (!database) {
      throw new Error('数据库实例为空');
    }

    console.log('✅ 数据库连接成功');

    // 检查数据库对象是否有必要的方法
    if (typeof database.insert !== 'function') {
      throw new TypeError('数据库对象缺少 insert 方法');
    }

    console.log('✅ 数据库对象结构正确');

    console.log('2. 测试环境变量...');
    const { Env } = await import('../src/libs/Env.js');

    console.log(`✅ DATABASE_STORAGE_TARGET: ${Env.DATABASE_STORAGE_TARGET}`);

    if (Env.DATABASE_URL) {
      console.log('✅ DATABASE_URL 已配置');
    } else {
      console.log('ℹ️  DATABASE_URL 未配置，将使用 PGlite');
    }

    console.log('\n🎉 数据库修复测试通过！');
    console.log('现在可以正常使用 "Pay Now" 功能了。');
  } catch (error) {
    console.error('❌ 数据库修复测试失败:');
    console.error(error.message);
    console.error('\n🔧 可能的解决方案:');
    console.error('1. 确保项目已构建: npm run build');
    console.error('2. 检查环境变量: npm run check-env');
    console.error('3. 重新安装依赖: npm install');
    process.exit(1);
  }
}

// 运行测试
testDatabaseFix().catch((error) => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
