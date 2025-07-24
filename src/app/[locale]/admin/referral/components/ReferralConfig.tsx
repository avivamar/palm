'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type ReferralConfig = {
  id?: number;
  enabled: boolean;
  rewardType: 'percentage' | 'fixed';
  rewardValue: number;
  cookieDays: number;
  updatedAt?: Date;
  updatedBy?: string;
};

export default function ReferralConfigPanel() {
  const [config, setConfig] = useState<ReferralConfig>({
    enabled: false,
    rewardType: 'percentage',
    rewardValue: 20,
    cookieDays: 30,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load current configuration
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/referral/config');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
      console.error('Failed to load referral config:', error);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/referral/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast.success('Referral configuration saved successfully');
        await loadConfig(); // Reload to get updated timestamps
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleValueChange = (field: keyof ReferralConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral System Configuration</CardTitle>
          <CardDescription>Loading configuration...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Referral System Configuration</CardTitle>
          <CardDescription>
            Configure the referral system settings and reward rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Referral System</Label>
              <div className="text-sm text-muted-foreground">
                Turn the referral system on or off globally
              </div>
            </div>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={checked => handleValueChange('enabled', checked)}
            />
          </div>

          {/* Reward Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="rewardType">Reward Type</Label>
            <Select
              value={config.rewardType}
              onValueChange={value => handleValueChange('rewardType', value as 'percentage' | 'fixed')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reward type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              {config.rewardType === 'percentage'
                ? 'Reward calculated as percentage of purchase amount'
                : 'Fixed reward amount regardless of purchase value'}
            </div>
          </div>

          {/* Reward Value */}
          <div className="space-y-2">
            <Label htmlFor="rewardValue">
              Reward Value (
              {config.rewardType === 'percentage' ? '%' : 'USD'}
              )
            </Label>
            <Input
              id="rewardValue"
              type="number"
              min="0"
              max={config.rewardType === 'percentage' ? '100' : undefined}
              step={config.rewardType === 'percentage' ? '1' : '0.01'}
              value={config.rewardValue}
              onChange={e => handleValueChange('rewardValue', Number(e.target.value))}
              placeholder={config.rewardType === 'percentage' ? '20' : '10.00'}
            />
            <div className="text-sm text-muted-foreground">
              {config.rewardType === 'percentage'
                ? `${config.rewardValue}% discount for referee, ${Math.floor(config.rewardValue / 2)}% reward for referrer`
                : `$${config.rewardValue} discount for referee, $${(config.rewardValue / 2).toFixed(2)} reward for referrer`}
            </div>
          </div>

          {/* Cookie Duration */}
          <div className="space-y-2">
            <Label htmlFor="cookieDays">Referral Cookie Duration (days)</Label>
            <Input
              id="cookieDays"
              type="number"
              min="1"
              max="365"
              value={config.cookieDays}
              onChange={e => handleValueChange('cookieDays', Number(e.target.value))}
              placeholder="30"
            />
            <div className="text-sm text-muted-foreground">
              How long referral tracking remains active after first click
            </div>
          </div>

          {/* Configuration Status */}
          {config.updatedAt && (
            <div className="text-sm text-muted-foreground border-t pt-4">
              Last updated:
              {' '}
              {new Date(config.updatedAt).toLocaleString()}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveConfig} disabled={saving}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Preview</CardTitle>
          <CardDescription>Preview of current referral system settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                config.enabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}
              >
                {config.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="font-medium">Reward Type:</span>
              <span className="ml-2 capitalize">{config.rewardType}</span>
            </div>
            <div>
              <span className="font-medium">Referee Discount:</span>
              <span className="ml-2">
                {config.rewardType === 'percentage' ? `${config.rewardValue}%` : `$${config.rewardValue}`}
              </span>
            </div>
            <div>
              <span className="font-medium">Referrer Reward:</span>
              <span className="ml-2">
                {config.rewardType === 'percentage'
                  ? `${Math.floor(config.rewardValue / 2)}%`
                  : `$${(config.rewardValue / 2).toFixed(2)}`}
              </span>
            </div>
            <div>
              <span className="font-medium">Cookie Duration:</span>
              <span className="ml-2">
                {config.cookieDays}
                {' '}
                days
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
