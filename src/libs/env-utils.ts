/**
 * 环境检测和URL构建工具
 * 解决本地开发和生产环境的OAuth重定向问题
 */

export function getEnvironmentInfo() {
  const isServer = typeof window === 'undefined';

  // 服务器端环境检测
  if (isServer) {
    return {
      isServer: true,
      isBrowser: false,
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL,
      siteUrl: process.env.SITE_URL,
      nextauthUrl: process.env.NEXTAUTH_URL,
    };
  }

  // 浏览器端环境检测
  const currentUrl = window.location.href;
  const isLocalhost = window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1'
    || window.location.hostname.includes('.local');

  return {
    isServer: false,
    isBrowser: true,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isLocalhost,
    currentUrl,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port,
    origin: window.location.origin,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  };
}

/**
 * 根据当前环境构建正确的URL
 */
export function buildUrl(path: string, request?: any): string {
  const envInfo = getEnvironmentInfo();

  // 服务器端：从request headers构建URL
  if (envInfo.isServer && request) {
    const host = request.headers.get('host') || '';
    const isLocalDev = host.includes('localhost') || host.includes('127.0.0.1');
    const protocol = request.headers.get('x-forwarded-proto') || (isLocalDev ? 'http' : 'https');
    const origin = `${protocol}://${host}`;
    return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
  }

  // 浏览器端：使用window.location
  if (envInfo.isBrowser) {
    return `${envInfo.origin}${path.startsWith('/') ? path : `/${path}`}`;
  }

  // 后备方案：使用环境变量
  const baseUrl = envInfo.appUrl || envInfo.siteUrl || 'http://localhost:3000';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * 检查当前是否在本地开发环境
 */
export function isLocalDevelopment(request?: any): boolean {
  const envInfo = getEnvironmentInfo();

  if (envInfo.isServer && request) {
    const host = request.headers.get('host') || '';
    return host.includes('localhost') || host.includes('127.0.0.1');
  }

  if (envInfo.isBrowser) {
    return envInfo.isLocalhost || false;
  }

  return (envInfo.isDevelopment || false)
    || (envInfo.appUrl?.includes('localhost') || false)
    || (envInfo.nextauthUrl?.includes('localhost') || false);
}

/**
 * 调试OAuth重定向URL
 */
export function debugOAuthRedirect(request?: any) {
  const envInfo = getEnvironmentInfo();
  const isLocal = isLocalDevelopment(request);
  const baseUrl = buildUrl('', request);

  console.log('🔍 OAuth重定向调试信息:', {
    envInfo,
    isLocal,
    baseUrl,
    callbackUrl: buildUrl('/api/auth/callback', request),
    dashboardUrl: buildUrl('/en/dashboard', request),
    envVars: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      APP_URL: process.env.APP_URL,
      SITE_URL: process.env.SITE_URL,
    },
  });

  return {
    isLocal,
    baseUrl,
    callbackUrl: buildUrl('/api/auth/callback', request),
    dashboardUrl: buildUrl('/en/dashboard', request),
  };
}
