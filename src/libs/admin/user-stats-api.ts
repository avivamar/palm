/**
 * User Statistics API
 * Following CLAUDE.md: 商业价值优先，最小化代码
 */

export type UserStatsResponse = {
  totalUsers: number;
  adminUsers: number;
  newThisMonth: number;
  activeToday: number;
  totalUsersChange: string;
  adminUsersChange: string;
  newThisMonthChange: string;
  activeTodayChange: string;
};

export async function fetchUserStats(): Promise<UserStatsResponse> {
  const response = await fetch('/api/admin/users/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user stats: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
