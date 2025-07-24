/**
 * 环境配置测试页面 - 仅在开发环境可用
 */

import type { NextRequest } from 'next/server';
import { debugOAuthRedirect, getEnvironmentInfo } from '@/libs/env-utils';

export async function GET(request: NextRequest) {
  // 仅在开发环境允许访问
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not available in production', { status: 404 });
  }

  const debugInfo = debugOAuthRedirect(request);
  const envInfo = getEnvironmentInfo();

  const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
    <title>OAuth环境配置调试</title>
    <style>
        body { font-family: monospace; margin: 20px; background: #f5f5f5; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: #22c55e; }
        .warning { color: #f59e0b; }
        .error { color: #ef4444; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 6px; overflow-x: auto; }
        .url { word-break: break-all; }
    </style>
</head>
<body>
    <h1>🔍 OAuth环境配置调试</h1>
    
    <div class="card">
        <h2>当前环境信息</h2>
        <pre>${JSON.stringify(envInfo, null, 2)}</pre>
    </div>
    
    <div class="card">
        <h2>OAuth重定向URL</h2>
        <p><strong>基础URL:</strong> <span class="url ${debugInfo.isLocal ? 'success' : 'warning'}">${debugInfo.baseUrl}</span></p>
        <p><strong>回调URL:</strong> <span class="url">${debugInfo.callbackUrl}</span></p>
        <p><strong>Dashboard URL:</strong> <span class="url">${debugInfo.dashboardUrl}</span></p>
        <p><strong>环境:</strong> <span class="${debugInfo.isLocal ? 'success' : 'warning'}">${debugInfo.isLocal ? '本地开发' : '生产环境'}</span></p>
    </div>
    
    <div class="card">
        <h2>环境变量检查</h2>
        <ul>
            <li>NODE_ENV: <span class="${process.env.NODE_ENV === 'development' ? 'success' : 'warning'}">${process.env.NODE_ENV}</span></li>
            <li>NEXT_PUBLIC_APP_URL: <span class="url">${process.env.NEXT_PUBLIC_APP_URL}</span></li>
            <li>APP_URL: <span class="url">${process.env.APP_URL}</span></li>
            <li>SITE_URL: <span class="url">${process.env.SITE_URL}</span></li>
            <li>NEXTAUTH_URL: <span class="url">${process.env.NEXTAUTH_URL}</span></li>
        </ul>
    </div>
    
    <div class="card">
        <h2>配置建议</h2>
        ${debugInfo.isLocal
          ? `
            <p class="success">✅ 检测到本地开发环境</p>
            <p>请确保在Supabase和Google Cloud Console中配置了以下回调URL：</p>
            <ul>
                <li><code>${debugInfo.callbackUrl}</code></li>
                <li><code>${debugInfo.baseUrl}/auth/callback</code></li>
            </ul>
        `
          : `
            <p class="warning">⚠️ 检测到生产环境配置</p>
            <p>如果这是本地开发，请检查.env.local文件中的URL配置。</p>
        `}
    </div>
    
    <div class="card">
        <h2>测试链接</h2>
        <p><a href="${debugInfo.baseUrl}">返回首页</a></p>
        <p><a href="${debugInfo.baseUrl}/en/sign-in">登录页面</a></p>
        <p><a href="${debugInfo.baseUrl}/en/dashboard">Dashboard</a></p>
    </div>
</body>
</html>
  `;

  return new Response(htmlResponse, {
    headers: { 'Content-Type': 'text/html' },
  });
}
