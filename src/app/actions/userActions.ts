'use server';

import { eq } from 'drizzle-orm';
import { getDB } from '@/libs/DB';
import { usersSchema } from '@/models/Schema';
// Lazy import Env to avoid validation issues during SSR

type UserSyncData = {
  id: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  // 新增多平台支持字段
  firebaseUid?: string | null;
  supabaseId?: string | null;
  authSource?: string;
};

export async function syncUser(userData: UserSyncData) {
  try {
    const db = await getDB();
    await db
      .insert(usersSchema)
      .values({
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        firebaseUid: userData.firebaseUid || userData.id, // 向后兼容
        supabaseId: userData.supabaseId,
        authSource: userData.authSource || 'firebase', // 默认为 firebase 保持兼容性
        lastLoginAt: new Date(),
      })
      .onConflictDoUpdate({
        target: usersSchema.email, // 使用 email 作为主键
        set: {
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          firebaseUid: userData.firebaseUid,
          supabaseId: userData.supabaseId,
          authSource: userData.authSource || 'firebase',
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      });
    console.log(`User ${userData.email} synced to PostgreSQL with auth source: ${userData.authSource}.`);
    return { success: true };
  } catch (error) {
    console.error('Failed to sync user to PostgreSQL:', error);
    return { success: false, error: 'Database sync failed.' };
  }
}

// 新增：专用于 Supabase 用户同步的函数
export async function syncUserToDatabase(userData: UserSyncData) {
  try {
    // 🚀 设置更短的超时时间，避免在 Vercel 中阻塞
    const dbTimeout = process.env.VERCEL === '1' ? 5000 : 10000;

    const dbPromise = getDB();
    const db = await Promise.race([
      dbPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout')), dbTimeout),
      ),
    ]) as any;

    // 🎯 检查是否为管理员邮箱 (直接访问环境变量避免验证问题)
    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdminUser = adminEmail && userData.email === adminEmail;

    // 首先尝试基于 email 查找现有用户
    const existingUsers = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.email, userData.email))
      .limit(1);

    const existingUser = existingUsers[0];

    if (existingUser) {
      // 用户已存在，更新信息
      await db
        .update(usersSchema)
        .set({
          displayName: userData.displayName || existingUser.displayName,
          photoURL: userData.photoURL || existingUser.photoURL,
          supabaseId: userData.supabaseId || existingUser.supabaseId,
          firebaseUid: userData.firebaseUid || existingUser.firebaseUid,
          authSource: userData.authSource || existingUser.authSource,
          // 🎯 如果是管理员邮箱，确保角色为admin
          role: isAdminUser ? 'admin' : existingUser.role,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(usersSchema.email, userData.email));

      console.log(`Existing user ${userData.email} updated with ${userData.authSource} auth${isAdminUser ? ' (admin role set)' : ''}.`);
    } else {
      // 创建新用户
      await db
        .insert(usersSchema)
        .values({
          id: userData.id,
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          firebaseUid: userData.firebaseUid,
          supabaseId: userData.supabaseId,
          authSource: userData.authSource || 'supabase',
          // 🎯 如果是管理员邮箱，设置为admin角色
          role: isAdminUser ? 'admin' : 'customer',
          emailVerified: true, // Supabase 用户默认已验证
          marketingConsent: false,
          referralCount: 0,
          lastLoginAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      console.log(`New user ${userData.email} created with ${userData.authSource} auth${isAdminUser ? ' (admin role)' : ''}.`);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to sync user to database:', error);
    return { success: false, error: 'Database sync failed.' };
  }
}

export async function sendPasswordReset(_email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  // 这个函数现在使用Supabase处理密码重置，已经在AuthContext中实现
  // 保留此函数以保持向后兼容性，但建议使用AuthContext中的sendPasswordResetEmail
  return { success: false, error: 'Please use the Supabase authentication system for password reset.' };
}

export async function resetPassword(_code: string, _newPassword: string) {
  // 这个函数现在使用Supabase处理密码重置，已经在AuthContext中实现
  // 保留此函数以保持向后兼容性，但建议使用AuthContext中的confirmPasswordReset
  return { success: false, error: 'Please use the Supabase authentication system for password reset.' };
}

/**
 * 根据用户ID获取用户角色
 * @param userId Firebase UID 或 Supabase user ID
 * @returns 用户角色信息
 */
export async function getUserRole(userId: string): Promise<{ success: boolean; role?: string; error?: string }> {
  try {
    const db = await getDB();
    const { or } = await import('drizzle-orm');

    // 首先尝试根据 supabaseId 查找，然后尝试根据 id 查找（向后兼容）
    const result = await db
      .select({ role: usersSchema.role })
      .from(usersSchema)
      .where(or(
        eq(usersSchema.supabaseId, userId),
        eq(usersSchema.id, userId),
      ))
      .limit(1);

    if (result.length === 0) {
      console.log(`User not found in database for userId: ${userId}`);
      return { success: false, error: 'User not found in database.' };
    }

    console.log(`Found user role: ${result[0].role} for userId: ${userId}`);
    return { success: true, role: result[0].role };
  } catch (error) {
    console.error('Failed to get user role:', error);
    return { success: false, error: 'Database query failed.' };
  }
}

/**
 * 根据邮箱获取用户角色
 * @param email 用户邮箱
 * @returns 用户角色信息
 */
export async function getUserRoleByEmail(email: string): Promise<{ success: boolean; role?: string; error?: string }> {
  try {
    const db = await getDB();

    const result = await db
      .select({ role: usersSchema.role })
      .from(usersSchema)
      .where(eq(usersSchema.email, email))
      .limit(1);

    if (result.length === 0) {
      console.log(`User not found in database for email: ${email}`);
      return { success: false, error: 'User not found in database.' };
    }

    console.log(`Found user role: ${result[0].role} for email: ${email}`);
    return { success: true, role: result[0].role };
  } catch (error) {
    console.error('Failed to get user role by email:', error);
    return { success: false, error: 'Database query failed.' };
  }
}

/**
 * 检查用户是否为管理员
 * @param userId Firebase UID 或 Supabase user ID
 * @returns 是否为管理员
 */
export async function isUserAdmin(userId: string): Promise<{ success: boolean; isAdmin?: boolean; error?: string }> {
  try {
    const roleResult = await getUserRole(userId);
    if (!roleResult.success) {
      return { success: false, error: roleResult.error };
    }

    return { success: true, isAdmin: roleResult.role === 'admin' };
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return { success: false, error: 'Admin check failed.' };
  }
}
