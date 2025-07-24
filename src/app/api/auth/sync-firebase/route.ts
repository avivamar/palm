import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { getSafeDB } from '@/libs/DB';
import { securityMiddleware } from '@/middleware/security/unified-security';
import { usersSchema } from '@/models/Schema';

export async function POST(request: NextRequest) {
  return securityMiddleware(request, async () => {
    try {
      const body = await request.json();
      const { firebaseUid, email, name, auth_source = 'firebase' } = body;

      // 增强输入验证
      if (!firebaseUid || !email) {
        return NextResponse.json(
          { error: 'Firebase UID and email are required' },
          { status: 400 },
        );
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 },
        );
      }

      // 验证 Firebase UID 格式 (通常是28个字符的字母数字字符串)
      const firebaseUidRegex = /^[A-Z0-9]{20,}$/i;
      if (!firebaseUidRegex.test(firebaseUid)) {
        return NextResponse.json(
          { error: 'Invalid Firebase UID format' },
          { status: 400 },
        );
      }

      const db = await getSafeDB();

      // 基于 email 查找用户 (email 是核心标识符)
      const existingUsers = await db
        .select()
        .from(usersSchema)
        .where(eq(usersSchema.email, email))
        .limit(1);

      const existingUser = existingUsers[0];

      if (existingUser) {
      // 用户已存在，更新 Firebase 关联信息
        const updatedUsers = await db
          .update(usersSchema)
          .set({
            firebaseUid,
            displayName: name || existingUser.displayName,
            authSource: auth_source,
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(usersSchema.email, email))
          .returning();

        return NextResponse.json({
          success: true,
          user: updatedUsers[0],
          action: 'updated',
          message: 'Firebase user synced to existing account',
        });
      } else {
      // 创建新用户 (以 email 为核心)
        const newUsers = await db
          .insert(usersSchema)
          .values({
            id: nanoid(), // 生成平台无关的 ID
            email, // 核心统一标识符
            displayName: name,
            firebaseUid,
            authSource: auth_source,
            emailVerified: true, // Firebase 用户通常已验证邮箱
            marketingConsent: false,
            referralCount: 0,
            lastLoginAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return NextResponse.json({
          success: true,
          user: newUsers[0],
          action: 'created',
          message: 'New user created from Firebase',
        });
      }
    } catch (error) {
      console.error('Error in Firebase sync API:', error);
      return NextResponse.json(
        {
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      );
    }
  });
}
