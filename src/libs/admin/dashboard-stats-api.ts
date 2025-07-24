/**
 * Dashboard Statistics API
 * Following CLAUDE.md: 商业价值优先，最小化代码
 */

export type DashboardStatsResponse = {
  totalUsers: number;
  totalOrders: number;
  revenue: number;
  conversionRate: number;
  totalUsersChange: string;
  totalOrdersChange: string;
  revenueChange: string;
  conversionRateChange: string;
};

export async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  const response = await fetch('/api/admin/dashboard/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
