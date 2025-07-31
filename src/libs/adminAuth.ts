/**
 * 管理员权限验证
 * 简单的管理员认证系统
 */

import { NextRequest } from 'next/server';

export interface AdminAuthResult {
  success: boolean;
  message?: string;
  user?: {
    email: string;
    role: string;
  };
}

export async function adminAuth(request: NextRequest): Promise<AdminAuthResult> {
  try {
    // 检查管理员访问是否启用
    if (process.env.ADMIN_ACCESS_ENABLED !== 'true') {
      return {
        success: false,
        message: 'Admin access is disabled'
      };
    }

    // 简单的头部验证（生产环境应使用更安全的方法）
    const authHeader = request.headers.get('authorization');
    const adminEmail = process.env.ADMIN_EMAIL;
    
    // 开发环境：允许本地访问
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        user: {
          email: adminEmail || 'admin@localhost',
          role: 'admin'
        }
      };
    }

    // 生产环境：检查授权头或管理员邮箱
    if (!authHeader && !adminEmail) {
      return {
        success: false,
        message: 'Authorization required'
      };
    }

    // 这里可以扩展更复杂的认证逻辑
    // 例如：JWT 验证、数据库用户检查等
    
    return {
      success: true,
      user: {
        email: adminEmail || 'admin',
        role: 'admin'
      }
    };

  } catch (error) {
    console.error('Admin auth error:', error);
    return {
      success: false,
      message: 'Authentication failed'
    };
  }
}