/**
 * System Health API
 * Following CLAUDE.md: 商业价值优先，最小化代码
 */

export type SystemHealthResponse = {
  database: 'healthy' | 'warning' | 'critical';
  redis: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  details: {
    database: string;
    redis: string;
    api: string;
  };
};

export type ShopifyStatusResponse = {
  apiConnection: 'healthy' | 'warning' | 'critical';
  productSync: 'healthy' | 'warning' | 'critical';
  configValidation: 'healthy' | 'warning' | 'critical';
  details: {
    apiConnection: string;
    productSync: string;
    configValidation: string;
  };
};

export type CoreScriptsResponse = {
  environmentValidation: 'healthy' | 'warning' | 'critical';
  buildValidation: 'healthy' | 'warning' | 'critical';
  stripeSync: 'healthy' | 'warning' | 'critical';
  details: {
    environmentValidation: string;
    buildValidation: string;
    stripeSync: string;
  };
};

export async function fetchSystemHealth(): Promise<SystemHealthResponse> {
  const response = await fetch('/api/admin/health/system', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch system health: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchShopifyStatus(): Promise<ShopifyStatusResponse> {
  const response = await fetch('/api/admin/health/shopify', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Shopify status: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchCoreScriptsStatus(): Promise<CoreScriptsResponse> {
  const response = await fetch('/api/admin/health/scripts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch core scripts status: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
