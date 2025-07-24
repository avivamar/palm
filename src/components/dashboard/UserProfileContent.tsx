'use client';

import { Calendar, Camera, Edit, Mail, Save, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

export function UserProfileContent() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('dashboard.profile');
  const tCommon = useTranslations('dashboard');

  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    location: '',
    phone: '',
    website: '',
    company: '',
    jobTitle: '',
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement profile save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsEditing(false);
      toast.success(t('save_success'));
    } catch {
      toast.error(t('save_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile({
      displayName: user?.displayName || '',
      email: user?.email || '',
      bio: '',
      location: '',
      phone: '',
      website: '',
      company: '',
      jobTitle: '',
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-muted rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">{t('please_sign_in')}</h2>
        <p className="text-muted-foreground mb-6">{t('need_sign_in')}</p>
        <Button asChild>
          <Link href="/sign-in">{t('sign_in')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('description')}
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            {t('edit_profile')}
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback className="text-2xl">
                    {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">
                    {user.displayName || 'User'}
                  </h2>
                  <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                    {user.emailVerified ? t('verified') : t('unverified')}
                  </Badge>
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('member_since', {
                    date: user.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Unknown',
                  })}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('basic_info.title')}</CardTitle>
            <CardDescription>
              {t('basic_info.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('basic_info.display_name')}</Label>
                <Input
                  id="displayName"
                  value={profile.displayName}
                  onChange={e => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  disabled={!isEditing}
                  placeholder={t('basic_info.display_name_placeholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('basic_info.email_address')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">{t('basic_info.bio')}</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                placeholder={t('basic_info.bio_placeholder')}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">{t('basic_info.location')}</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={e => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!isEditing}
                  placeholder={t('basic_info.location_placeholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('basic_info.phone')}</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder={t('basic_info.phone_placeholder')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">{t('basic_info.website')}</Label>
              <Input
                id="website"
                value={profile.website}
                onChange={e => setProfile(prev => ({ ...prev, website: e.target.value }))}
                disabled={!isEditing}
                placeholder={t('basic_info.website_placeholder')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('professional_info.title')}</CardTitle>
            <CardDescription>
              {t('professional_info.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">{t('professional_info.company')}</Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={e => setProfile(prev => ({ ...prev, company: e.target.value }))}
                  disabled={!isEditing}
                  placeholder={t('professional_info.company_placeholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">{t('professional_info.job_title')}</Label>
                <Input
                  id="jobTitle"
                  value={profile.jobTitle}
                  onChange={e => setProfile(prev => ({ ...prev, jobTitle: e.target.value }))}
                  disabled={!isEditing}
                  placeholder={t('professional_info.job_title_placeholder')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t('account_stats.title')}</CardTitle>
            <CardDescription>
              {t('account_stats.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">{t('account_stats.total_orders')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-sm text-muted-foreground">{t('account_stats.total_spent')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {user.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">{t('account_stats.member_since')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {user.metadata?.lastSignInTime
                    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">{t('account_stats.last_active')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? tCommon('loading') : tCommon('save')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
