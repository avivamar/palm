import { NextResponse } from 'next/server';
import { app, isFirebaseReady } from '@/libs/firebase/config';

export async function GET() {
  try {
    // 检查环境变量
    const environment = {
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    // 检查 Firebase 初始化状态
    const initialization = {
      app: !!app,
      auth: false, // Auth not available on server-side
      isReady: isFirebaseReady(),
    };

    // 检查 auth 对象的方法（服务端环境下这些方法不存在）
    const authMethods = {
      onAuthStateChanged: false, // Not available on server-side
      // 服务端环境下这些客户端方法不存在，所以始终为 false
      signInWithEmailAndPassword: false,
      createUserWithEmailAndPassword: false,
    };

    // 检查 app 对象的属性
    const appProperties = {
      options: !!app?.options,
      authDomain: !!app?.options?.authDomain,
      projectId: !!app?.options?.projectId,
    };

    return NextResponse.json({
      environment,
      initialization,
      authMethods,
      appProperties,
      note: 'authMethods are false because this API runs on server-side where client auth methods don\'t exist',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Firebase status check failed:', error);
    return NextResponse.json(
      {
        error: 'Firebase status check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
