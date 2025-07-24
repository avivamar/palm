'use client';

import React, { useState } from 'react';

import type { EmailTemplateType } from '@rolitt/email';

import {
  CheckCircle,
  Database,
  Globe,
  Loader2,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useEmailDeployment } from '../hooks';

// Email types configuration
const EMAIL_TYPES = [
  { value: 'invite' as EmailTemplateType, label: 'Invitation Email' },
  { value: 'confirmation' as EmailTemplateType, label: 'Confirmation Email' },
  { value: 'recovery' as EmailTemplateType, label: 'Password Recovery' },
  { value: 'magic_link' as EmailTemplateType, label: 'Magic Link' },
  { value: 'email_change' as EmailTemplateType, label: 'Email Change' },
];

// Supported locales
const SUPPORTED_LOCALES = ['en', 'zh-HK', 'ja', 'es'];

// Locale labels
const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  'zh-HK': '繁體中文 (香港)',
  ja: '日本語',
  es: 'Español',
};

/**
 * Email Deployment Panel Component
 * Handles deployment of email templates to Supabase
 */
export const DeploymentPanel: React.FC = () => {
  const {
    isDeploying,
    stats,
    deployToSupabase,
    refreshStats,
  } = useEmailDeployment();

  const [selectedTypes, setSelectedTypes] = useState<EmailTemplateType[]>([
    'invite',
  ]);
  const [selectedLocales, setSelectedLocales] = useState<string[]>(['en']);

  const handleTypeToggle = (type: EmailTemplateType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type],
    );
  };

  const handleLocaleToggle = (locale: string) => {
    setSelectedLocales((prev) =>
      prev.includes(locale)
        ? prev.filter((l) => l !== locale)
        : [...prev, locale],
    );
  };

  const handleDeploy = async () => {
    if (selectedTypes.length === 0) {
      // eslint-disable-next-line no-alert
      alert('Please select at least one email type to deploy');
      return;
    }

    if (selectedLocales.length === 0) {
      // eslint-disable-next-line no-alert
      alert('Please select at least one language to deploy');
      return;
    }

    await deployToSupabase();
  };

  const handleRefresh = async () => {
    await refreshStats();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="deploy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deploy" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Deploy Templates
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Deploy Templates */}
        <TabsContent value="deploy">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Templates</CardTitle>
                <CardDescription>
                  Choose which email templates to deploy to Supabase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="text-sm font-medium">Email Types</div>
                  <div className="grid gap-2">
                    {EMAIL_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        className={`p-3 border rounded-lg cursor-pointer transition-colors text-left ${
                          selectedTypes.includes(type.value)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleTypeToggle(type.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleTypeToggle(type.value);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{type.label}</span>
                          {selectedTypes.includes(type.value) && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="text-sm font-medium">Languages</div>
                  <div className="grid gap-2">
                    {SUPPORTED_LOCALES.map((locale) => (
                      <button
                        key={locale}
                        type="button"
                        className={`p-3 border rounded-lg cursor-pointer transition-colors text-left ${
                          selectedLocales.includes(locale)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleLocaleToggle(locale)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleLocaleToggle(locale);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span className="font-medium">
                              {LOCALE_LABELS[locale]}
                            </span>
                          </div>
                          {selectedLocales.includes(locale) && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deployment Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Deployment Actions</CardTitle>
                <CardDescription>
                  Deploy your selected templates to Supabase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900">
                          Deployment Summary
                        </div>
                        <div className="text-sm text-blue-700 mt-1">
                          <div>
                            Templates:
                            {' '}
                            {selectedTypes.length}
                            {' '}
                            selected
                          </div>
                          <div>
                            Languages:
                            {' '}
                            {selectedLocales.length}
                            {' '}
                            selected
                          </div>
                          <div>
                            Total:
                            {' '}
                            {selectedTypes.length * selectedLocales.length}
                            {' '}
                            templates
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleDeploy}
                      disabled={
                        isDeploying ||
                        selectedTypes.length === 0 ||
                        selectedLocales.length === 0
                      }
                      className="flex items-center gap-2 flex-1"
                    >
                      {isDeploying
                        ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )
                        : (
                          <Upload className="h-4 w-4" />
                        )}
                      {isDeploying ? 'Deploying...' : 'Deploy to Supabase'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Statistics</CardTitle>
              <CardDescription>
                View statistics about your email templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {stats.totalTemplates}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Templates
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {stats.activeTemplates}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Templates
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{stats.testsSent}</div>
                  <div className="text-sm text-muted-foreground">
                    Tests Sent
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {stats.lastDeployment
                      ? new Date(stats.lastDeployment).toLocaleDateString()
                      : 'Never'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last Deployment
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Refresh Statistics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};