'use client';

import { Check, ChevronDown, ChevronUp, Copy, DollarSign, ExternalLink, MousePointer, Share2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import SocialShareButtons from '@/components/referral/SocialShareButtons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

type ReferralStats = {
  referralCode: string;
  totalReferrals: number;
  totalClicks: number;
  totalConversions: number;
  totalRewards: number;
  conversionRate: number;
  recentReferrals: Array<{
    id: string;
    referredEmail: string;
    status: string;
    rewardAmount: number;
    createdAt: string;
  }>;
};

type ReferralConfig = {
  enabled: boolean;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
};

export default function ReferralDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load referral configuration
      const configResponse = await fetch('/api/admin/referral/config');
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setConfig(configData.config);
      }

      // Load user referral stats
      const statsResponse = await fetch(`/api/user/referral/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = () => {
    if (!stats?.referralCode) {
      return '';
    }
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}?referral=${stats.referralCode}`;
  };

  const copyReferralLink = async () => {
    const link = generateReferralLink();
    if (!link) {
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareReferralLink = () => {
    const link = generateReferralLink();
    if (!link) {
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: 'Join Rolitt with my referral link',
        text: 'Get a discount on your Rolitt AI companion purchase!',
        url: link,
      });
    } else {
      // Fallback to copy
      copyReferralLink();
    }
  };

  // If referral system is disabled
  if (!loading && (!config || !config.enabled)) {
    return (
      <Card className="border-0 bg-gradient-to-br from-gray-50/50 to-slate-50/50 dark:from-gray-950/20 dark:to-slate-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Referral Program</CardTitle>
          </div>
          <CardDescription>
            The referral program is currently unavailable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Our referral program is temporarily disabled. Check back later for updates!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-emerald-600" />
            <CardTitle>Referral Program</CardTitle>
          </div>
          <CardDescription>Loading your referral statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-muted rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Link Card */}
      <Card className="border-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg text-white">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Invite Friends & Earn Rewards</CardTitle>
              <CardDescription>
                Share your referral link and earn
                {' '}
                {config?.rewardType === 'percentage'
                  ? `${Math.floor((config.rewardValue || 20) / 2)}% rewards`
                  : `$${((config?.rewardValue || 10) / 2).toFixed(2)} rewards`}
                {' '}
                for each successful referral
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Referral Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Referral Link</label>
            <div className="flex gap-2">
              <Input
                value={generateReferralLink()}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={copyReferralLink}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                {copySuccess
                  ? (
                      <Check className="h-4 w-4 text-green-600" />
                    )
                  : (
                      <Copy className="h-4 w-4" />
                    )}
              </Button>
              <Button
                onClick={shareReferralLink}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
            </div>

            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <MousePointer className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{stats?.totalClicks || 0}</p>
              <p className="text-xs text-muted-foreground">Link Clicks</p>
            </div>

            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold">
                $
                {((stats?.totalRewards || 0) / 100).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <span className="text-sm font-medium">Conversion Rate</span>
            <Badge variant="secondary">
              {stats?.conversionRate?.toFixed(1) || '0.0'}
              %
            </Badge>
          </div>

          {/* Social Sharing Section */}
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowShareOptions(!showShareOptions)}
            >
              <span>Share on Social Media</span>
              {showShareOptions
                ? (
                    <ChevronUp className="h-4 w-4" />
                  )
                : (
                    <ChevronDown className="h-4 w-4" />
                  )}
            </Button>

            {showShareOptions && (
              <div className="space-y-4 pt-4">
                <SocialShareButtons
                  referralLink={generateReferralLink()}
                  referralCode={stats?.referralCode || ''}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      {stats?.recentReferrals && stats.recentReferrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>Your latest referral activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentReferrals.map(referral => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{referral.referredEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={referral.status === 'completed' ? 'default' : 'outline'}
                      className="mb-1"
                    >
                      {referral.status}
                    </Badge>
                    <p className="text-sm font-medium">
                      $
                      {(referral.rewardAmount / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
