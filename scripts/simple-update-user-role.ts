#!/usr/bin/env tsx
/**
 * 简化的用户角色更新脚本 - 绕过环境变量验证
 * 使用方法: npx tsx scripts/simple-update-user-role.ts <user-email> <role>
 * 示例: npx tsx scripts/simple-update-user-role.ts aviva.mar@gmail.com admin
 */

import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { usersSchema } from '../src/models/Schema';

// 加载环境变量
config({ path: '.env.local' });

type UserRole = 'customer' | 'admin' | 'moderator';

async function updateUserRole(email: string, role: UserRole) {
  try {
    console.log(`正在更新用户 ${email} 的角色为 ${role}...`);

    // 直接使用DATABASE_URL创建数据库连接
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL 环境变量未设置');
    }

    const client = postgres(databaseUrl);
    const db = drizzle(client);

    // 首先检查用户是否存在
    const existingUser = await db
      .select({ id: usersSchema.id, email: usersSchema.email, role: usersSchema.role })
      .from(usersSchema)
      .where(eq(usersSchema.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      console.error(`❌ 用户 ${email} 不存在于数据库中`);
      console.log('提示：用户需要先登录一次才会在数据库中创建记录');
      await client.end();
      return;
    }

    console.log(`📋 当前用户信息:`);
    console.log(`   ID: ${existingUser[0]?.id}`);
    console.log(`   Email: ${existingUser[0]?.email}`);
    console.log(`   当前角色: ${existingUser[0]?.role}`);

    // 更新用户角色
    const result = await db
      .update(usersSchema)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(usersSchema.email, email))
      .returning({ id: usersSchema.id, email: usersSchema.email, role: usersSchema.role });

    if (result.length > 0) {
      console.log(`✅ 用户角色更新成功!`);
      console.log(`   新角色: ${result[0]?.role}`);
      console.log(`\n🔐 权限说明:`);
      console.log(`   - customer: 只能访问 /dashboard`);
      console.log(`   - admin: 可以访问 /dashboard 和 /admin`);
      console.log(`   - moderator: 可以访问 /dashboard 和部分管理功能`);
      console.log(`\n⚠️  注意: 用户需要重新登录才能获得新的权限`);
    } else {
      console.error(`❌ 更新失败`);
    }

    await client.end();
  } catch (error) {
    console.error('❌ 更新用户角色时发生错误:', error);
  }
}

async function main() {
  const email = process.argv[2];
  const roleArg = process.argv[3];

  if (!email || !roleArg) {
    console.log('❌ 使用方法: npx tsx scripts/simple-update-user-role.ts <email> <role>');
    console.log('   角色选项: customer, admin, moderator');
    console.log('   示例: npx tsx scripts/simple-update-user-role.ts aviva.mar@gmail.com admin');
    process.exit(1);
  }

  if (!['customer', 'admin', 'moderator'].includes(roleArg)) {
    console.log('❌ 无效的角色。支持的角色: customer, admin, moderator');
    process.exit(1);
  }

  const role = roleArg as UserRole;
  await updateUserRole(email, role);
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

export { updateUserRole };
