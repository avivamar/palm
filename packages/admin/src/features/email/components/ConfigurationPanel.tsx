'use client';

import React, { useState } from 'react';
import { 
  Palette, 
  Globe, 
  Database, 
  Mail, 
  TestTube,
  CheckCircle,
  XCircle,
  Save,
  RotateCcw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useEmailConfiguration } from '../hooks';
import type { BrandConfig } from '@rolitt/email';
import { SUPPORTED_LOCALES } from '@rolitt/email';

const LOCALE_LABELS = {
  en: 'English',
  es: 'Español',
  'zh-HK': '繁體中文', 
  ja: '日本語'
};

export const ConfigurationPanel: React.FC = () => {
  const {
    configuration,
    updateConfiguration,
    resetConfiguration,
    validateSupabaseConnection,
  } = useEmailConfiguration();

  const [isValidating, setIsValidating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [isSaving, setIsSaving] = useState(false);

  const handleBrandConfigUpdate = (updates: Partial<BrandConfig>) => {
    updateConfiguration({
      brandConfig: { ...configuration.brandConfig, ...updates }
    });
  };

  const handleSupabaseConfigUpdate = (field: string, value: string) => {
    updateConfiguration({
      supabaseConfig: { ...configuration.supabaseConfig, [field]: value }
    });
  };

  const handleSmtpConfigUpdate = (field: string, value: string | number | boolean) => {
    updateConfiguration({
      smtpConfig: { ...configuration.smtpConfig, [field]: value }
    });
  };

  const handleSmtpAuthUpdate = (authField: string, value: string) => {
    updateConfiguration({
      smtpConfig: { 
        ...configuration.smtpConfig, 
        auth: { 
          ...configuration.smtpConfig.auth, 
          [authField]: value 
        }
      }
    });
  };

  const handleValidateConnection = async () => {
    setIsValidating(true);
    try {
      const isValid = await validateSupabaseConnection();
      setConnectionStatus(isValid ? 'valid' : 'invalid');
    } catch (error) {
      setConnectionStatus('invalid');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetConfiguration = () => {
    resetConfiguration();
    setConnectionStatus('idle');
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button onClick={handleSaveConfiguration} disabled={isSaving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
        <Button variant="outline" onClick={handleResetConfiguration} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>

      <Tabs defaultValue="brand" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="brand" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Brand
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Localization
          </TabsTrigger>
          <TabsTrigger value="supabase" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Supabase
          </TabsTrigger>
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            SMTP
          </TabsTrigger>
        </TabsList>

        {/* Brand Configuration */}
        <TabsContent value="brand">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Configuration
              </CardTitle>
              <CardDescription>
                Configure your brand settings that will be used in email templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={configuration.brandConfig.brandName}
                    onChange={(e) => handleBrandConfigUpdate({ brandName: e.target.value })}
                    placeholder="Your Company Name"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={configuration.brandConfig.primaryColor}
                      onChange={(e) => handleBrandConfigUpdate({ primaryColor: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={configuration.brandConfig.primaryColor}
                      onChange={(e) => handleBrandConfigUpdate({ primaryColor: e.target.value })}
                      placeholder="#EBFF7F"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    value={configuration.brandConfig.logoUrl || ''}
                    onChange={(e) => handleBrandConfigUpdate({ logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="website-url">Website URL</Label>
                  <Input
                    id="website-url"
                    value={configuration.brandConfig.websiteUrl || ''}
                    onChange={(e) => handleBrandConfigUpdate({ websiteUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={configuration.brandConfig.supportEmail || ''}
                    onChange={(e) => handleBrandConfigUpdate({ supportEmail: e.target.value })}
                    placeholder="support@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Localization Configuration */}
        <TabsContent value="localization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Localization Settings
              </CardTitle>
              <CardDescription>
                Configure language settings for your email templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Default Language</Label>
                  <div className="flex items-center gap-2">
                    {SUPPORTED_LOCALES.map(locale => (
                      <div key={locale} className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={`default-${locale}`}
                          name="defaultLocale"
                          checked={configuration.defaultLocale === locale}
                          onChange={() => updateConfiguration({ defaultLocale: locale })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`default-${locale}`} className="text-sm">
                          {LOCALE_LABELS[locale]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-2">
                  <Label>Supported Languages</Label>
                  <div className="grid gap-2">
                    {SUPPORTED_LOCALES.map(locale => (
                      <div key={locale} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Switch
                            id={`locale-${locale}`}
                            checked={configuration.supportedLocales.includes(locale)}
                            onCheckedChange={(checked) => {
                              const newLocales = checked
                                ? [...configuration.supportedLocales, locale]
                                : configuration.supportedLocales.filter(l => l !== locale);
                              updateConfiguration({ supportedLocales: newLocales });
                            }}
                          />
                          <Label htmlFor={`locale-${locale}`} className="font-medium">
                            {LOCALE_LABELS[locale]}
                          </Label>
                        </div>
                        <Badge variant={configuration.supportedLocales.includes(locale) ? "default" : "secondary"}>
                          {configuration.supportedLocales.includes(locale) ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supabase Configuration */}
        <TabsContent value="supabase">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Supabase Integration
              </CardTitle>
              <CardDescription>
                Configure Supabase connection for email template deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="supabase-url">Project URL</Label>
                  <Input
                    id="supabase-url"
                    value={configuration.supabaseConfig.projectUrl || ''}
                    onChange={(e) => handleSupabaseConfigUpdate('projectUrl', e.target.value)}
                    placeholder="https://your-project.supabase.co"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="supabase-anon-key">Anonymous Key</Label>
                  <Input
                    id="supabase-anon-key"
                    type="password"
                    value={configuration.supabaseConfig.anonKey || ''}
                    onChange={(e) => handleSupabaseConfigUpdate('anonKey', e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="supabase-service-key">Service Role Key</Label>
                  <Input
                    id="supabase-service-key"
                    type="password"
                    value={configuration.supabaseConfig.serviceRoleKey || ''}
                    onChange={(e) => handleSupabaseConfigUpdate('serviceRoleKey', e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleValidateConnection}
                    disabled={isValidating}
                    className="flex items-center gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    {isValidating ? 'Validating...' : 'Test Connection'}
                  </Button>
                  
                  {connectionStatus !== 'idle' && (
                    <Badge variant={connectionStatus === 'valid' ? "default" : "destructive"}>
                      {connectionStatus === 'valid' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Connection Valid</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Connection Failed</>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMTP Configuration */}
        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for email testing (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    value={configuration.smtpConfig.host || ''}
                    onChange={(e) => handleSmtpConfigUpdate('host', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={configuration.smtpConfig.port || ''}
                    onChange={(e) => handleSmtpConfigUpdate('port', parseInt(e.target.value) || 587)}
                    placeholder="587"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="smtp-username">Username</Label>
                  <Input
                    id="smtp-username"
                    value={configuration.smtpConfig.auth?.user || ''}
                    onChange={(e) => handleSmtpAuthUpdate('user', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="smtp-password">Password</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={configuration.smtpConfig.auth?.pass || ''}
                    onChange={(e) => handleSmtpAuthUpdate('pass', e.target.value)}
                    placeholder="your-app-password"
                  />
                </div>
                
                <div className="flex items-center gap-2 md:col-span-2">
                  <Switch
                    id="smtp-secure"
                    checked={configuration.smtpConfig.secure || false}
                    onCheckedChange={(checked) => handleSmtpConfigUpdate('secure', checked)}
                  />
                  <Label htmlFor="smtp-secure">Use SSL/TLS</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};