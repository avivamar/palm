'use server';

import { eq } from 'drizzle-orm';
import { getDB } from '@/libs/DB';
import { usersSchema } from '@/models/Schema';

/**
 * 🎯 Firebase 用户 ID 同步服务
 * 仅传递 email 给 Firebase，接收并存储 firebase_uid
 *
 * 设计目的：
 * - 为未来移动端 Firebase 集成预留接口
 * - 保持 email 作为主键的统一性
 * - 移除 Firebase Admin SDK 依赖
 */

/**
 * 同步用户到 Firebase（仅传递 email）
 * @param email - 用户邮箱
 * @returns Promise<{ success: boolean; firebase_uid?: string; error?: string }>
 */
export async function syncUserToFirebase(email: string): Promise<{ success: boolean; firebase_uid?: string; error?: string }> {
  try {
    console.log(`[FirebaseSync] 🎯 Starting Firebase user sync for email: ${email}`);

    // 1. 模拟 Firebase 用户创建 API 调用
    // 实际实现时，这里应该调用 Firebase REST API 或者外部服务
    const firebaseResponse = await simulateFirebaseUserCreation(email);

    if (!firebaseResponse.success) {
      console.error(`[FirebaseSync] ❌ Firebase user creation failed: ${firebaseResponse.error}`);
      return { success: false, error: firebaseResponse.error };
    }

    // 2. 更新数据库中的 firebase_uid
    const db = await getDB();
    await db.update(usersSchema)
      .set({
        firebaseUid: firebaseResponse.firebase_uid,
        updatedAt: new Date(),
      })
      .where(eq(usersSchema.email, email));

    console.log(`[FirebaseSync] ✅ Firebase UID synced for ${email}: ${firebaseResponse.firebase_uid}`);

    return {
      success: true,
      firebase_uid: firebaseResponse.firebase_uid,
    };
  } catch (error) {
    console.error(`[FirebaseSync] ❌ Firebase sync failed for ${email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during Firebase sync',
    };
  }
}

/**
 * 模拟 Firebase 用户创建（实际实现时替换为真实 API 调用）
 * @param email - 用户邮箱
 * @returns Promise<{ success: boolean; firebase_uid?: string; error?: string }>
 */
async function simulateFirebaseUserCreation(email: string): Promise<{ success: boolean; firebase_uid?: string; error?: string }> {
  try {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    // 模拟生成 Firebase UID（实际实现时由 Firebase 返回）
    const firebase_uid = `firebase_${Math.random().toString(36).substring(2, 15)}`;

    console.log(`[FirebaseSync] 🔄 Simulated Firebase user creation for ${email} → ${firebase_uid}`);

    return {
      success: true,
      firebase_uid,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Firebase API error',
    };
  }
}

/**
 * 获取用户的 Firebase UID
 * @param email - 用户邮箱
 * @returns Promise<{ success: boolean; firebase_uid?: string; error?: string }>
 */
export async function getUserFirebaseUid(email: string): Promise<{ success: boolean; firebase_uid?: string; error?: string }> {
  try {
    const db = await getDB();
    const user = await db.query.usersSchema.findFirst({
      where: eq(usersSchema.email, email),
      columns: {
        firebaseUid: true,
      },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      firebase_uid: user.firebaseUid || undefined,
    };
  } catch (error) {
    console.error(`[FirebaseSync] ❌ Failed to get Firebase UID for ${email}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database query failed',
    };
  }
}

/**
 * 批量同步用户到 Firebase
 * @param emails - 用户邮箱列表
 * @returns Promise<{ success: boolean; synced: number; errors: string[] }>
 */
export async function batchSyncUsersToFirebase(emails: string[]): Promise<{ success: boolean; synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;

  for (const email of emails) {
    try {
      const result = await syncUserToFirebase(email);
      if (result.success) {
        synced++;
      } else {
        errors.push(`${email}: ${result.error}`);
      }
    } catch (error) {
      errors.push(`${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    synced,
    errors,
  };
}
