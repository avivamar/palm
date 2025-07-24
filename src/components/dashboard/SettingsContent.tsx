'use client';

import { Bell, Save, Shield, Trash2, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';

export function SettingsContent() {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('dashboard.settings');
  const tCommon = useTranslations('dashboard');
  const [settings, setSettings] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    emailNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement settings save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success(t('save_success'));
    } catch {
      toast.error(t('save_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t('danger_zone.delete_confirm'))) {
      try {
        // TODO: Implement account deletion
        toast.error(t('danger_zone.delete_not_implemented'));
      } catch {
        toast.error(t('delete_error'));
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('description')}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('profile_info.title')}
            </CardTitle>
            <CardDescription>
              {t('profile_info.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('profile_info.display_name')}</Label>
                <Input
                  id="displayName"
                  value={settings.displayName}
                  onChange={e => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder={t('profile_info.display_name_placeholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('profile_info.email_address')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  {t('profile_info.email_readonly')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('notifications.title')}
            </CardTitle>
            <CardDescription>
              {t('notifications.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('notifications.email_notifications')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.email_notifications_desc')}
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={checked =>
                  setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('notifications.marketing_emails')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.marketing_emails_desc')}
                </p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={checked =>
                  setSettings(prev => ({ ...prev, marketingEmails: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('notifications.security_alerts')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('notifications.security_alerts_desc')}
                </p>
              </div>
              <Switch
                checked={settings.securityAlerts}
                onCheckedChange={checked =>
                  setSettings(prev => ({ ...prev, securityAlerts: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('security.title')}
            </CardTitle>
            <CardDescription>
              {t('security.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{t('security.two_factor')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('security.two_factor_desc')}
                </p>
              </div>
              <Button variant="outline" size="sm">
                {t('security.enable_2fa')}
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{t('security.change_password')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('security.change_password_desc')}
                </p>
              </div>
              <Button variant="outline" size="sm">
                {t('security.update_password')}
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{t('security.login_history')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('security.login_history_desc')}
                </p>
              </div>
              <Button variant="outline" size="sm">
                {t('security.view_history')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              {t('danger_zone.title')}
            </CardTitle>
            <CardDescription>
              {t('danger_zone.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <div>
                <h4 className="font-medium text-red-600">{t('danger_zone.delete_account')}</h4>
                <p className="text-sm text-red-600/80">
                  {t('danger_zone.delete_account_desc')}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('danger_zone.delete_account')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? tCommon('loading') : tCommon('save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
