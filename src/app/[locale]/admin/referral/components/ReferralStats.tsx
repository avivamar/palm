'use client';

import { DollarSign, MousePointer, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ReferralStats = {
  totalReferrals: number;
  activeReferrals: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRewardsIssued: number;
  totalDiscountsGiven: number;
  recentReferrals: Array<{
    id: string;
    referrerEmail: string;
    referredEmail: string;
    status: string;
    clickCount: number;
    conversionCount: number;
    rewardAmount: number;
    createdAt: string;
  }>;
  topReferrers: Array<{
    email: string;
    referralCount: number;
    totalRewards: number;
  }>;
  monthlyStats: Array<{
    month: string;
    referrals: number;
    conversions: number;
    rewards: number;
  }>;
};

export default function ReferralStatsPanel() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/referral/stats?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral Statistics</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral Statistics</CardTitle>
          <CardDescription>Failed to load statistics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Referral Statistics</h3>
          <p className="text-sm text-muted-foreground">
            Overview of referral system performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadStats}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{stats.totalReferrals.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MousePointer className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {stats.conversionRate.toFixed(1)}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Rewards</p>
                <p className="text-2xl font-bold">
                  $
                  {(stats.totalRewardsIssued / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>Latest referral activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentReferrals.map(referral => (
                <div key={referral.id} className="flex items-center justify-between border-b pb-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{referral.referrerEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      Referred:
                      {' '}
                      {referral.referredEmail || 'Pending'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {referral.clickCount}
                        {' '}
                        clicks
                      </Badge>
                      <Badge variant={referral.conversionCount > 0 ? 'default' : 'outline'} className="text-xs">
                        {referral.conversionCount}
                        {' '}
                        conversions
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      $
                      {(referral.rewardAmount / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {stats.recentReferrals.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent referrals found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
            <CardDescription>Users with most successful referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topReferrers.map((referrer, index) => (
                <div key={referrer.email} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{referrer.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {referrer.referralCount}
                        {' '}
                        referrals
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      $
                      {(referrer.totalRewards / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">earned</p>
                  </div>
                </div>
              ))}
              {stats.topReferrers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No top referrers found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
          <CardDescription>Referral system performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.monthlyStats.map(month => (
              <div key={month.month} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="text-sm font-medium">{month.month}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium">{month.referrals}</p>
                    <p className="text-xs text-muted-foreground">Referrals</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{month.conversions}</p>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">
                      $
                      {(month.rewards / 100).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Rewards</p>
                  </div>
                </div>
              </div>
            ))}
            {stats.monthlyStats.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No monthly data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
