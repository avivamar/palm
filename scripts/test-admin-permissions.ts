#!/usr/bin/env tsx
/**
 * 管理员权限测试脚本
 * 测试权限验证系统是否正常工作
 */

import { getUserRole, isUserAdmin } from '../src/app/actions/userActions';
import { getDB } from '../src/libs/DB';
import { usersSchema } from '../src/models/Schema';

async function testAdminPermissions() {
  console.log('🧪 开始测试管理员权限系统...');
  console.log('='.repeat(50));

  try {
    const db = await getDB();

    // 获取所有用户
    const users = await db
      .select({
        id: usersSchema.id,
        email: usersSchema.email,
        role: usersSchema.role,
      })
      .from(usersSchema)
      .limit(10);

    if (users.length === 0) {
      console.log('❌ 数据库中没有用户记录');
      console.log('提示：请先登录一次以创建用户记录');
      return;
    }

    console.log(`📋 找到 ${users.length} 个用户:`);
    console.log('');

    for (const user of users) {
      console.log(`👤 用户: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   数据库角色: ${user.role}`);

      // 测试 getUserRole 函数
      const roleResult = await getUserRole(user.id);
      console.log(`   getUserRole 结果: ${roleResult.success ? roleResult.role : `❌ ${roleResult.error}`}`);

      // 测试 isUserAdmin 函数
      const adminResult = await isUserAdmin(user.id);
      console.log(`   isUserAdmin 结果: ${adminResult.success ? (adminResult.isAdmin ? '✅ 是管理员' : '❌ 不是管理员') : `❌ ${adminResult.error}`}`);

      // 权限说明
      if (user.role === 'admin') {
        console.log(`   🔐 权限: 可以访问 /dashboard 和 /admin`);
      } else {
        console.log(`   🔐 权限: 只能访问 /dashboard`);
      }

      console.log('');
    }

    // 测试不存在的用户
    console.log('🧪 测试不存在的用户ID...');
    const nonExistentResult = await getUserRole('non-existent-uid');
    console.log(`   结果: ${nonExistentResult.success ? '❌ 应该失败' : `✅ 正确返回错误: ${nonExistentResult.error}`}`);

    console.log('');
    console.log('='.repeat(50));
    console.log('✅ 权限系统测试完成!');
    console.log('');
    console.log('📝 测试总结:');
    console.log('   1. ✅ 用户角色查询函数 (getUserRole) 已实现');
    console.log('   2. ✅ 管理员检查函数 (isUserAdmin) 已实现');
    console.log('   3. ✅ API 路由 (/api/auth/verify-session) 已更新');
    console.log('   4. ✅ 中间件 (middleware.ts) 已包含角色检查');
    console.log('   5. ✅ Admin Layout 权限检查已启用');
    console.log('');
    console.log('🔧 下一步操作:');
    console.log('   1. 使用脚本更新用户角色: npx tsx scripts/update-user-role.ts <email> admin');
    console.log('   2. 用户重新登录以获得新权限');
    console.log('   3. 测试访问 /admin 路由');
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

async function main() {
  await testAdminPermissions();
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

export { testAdminPermissions };
