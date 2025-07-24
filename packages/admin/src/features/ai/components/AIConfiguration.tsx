'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Switch } from '@/components/ui';
import { Button } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui';
import { 
  Save, 
  RefreshCw, 
  Key, 
  CheckCircle,
  Brain,
  Sparkles,
  Cpu,
  Cloud
} from 'lucide-react';
import type { AIProvider, AIProviderConfig, AIConfigForm } from '../types';

const DEFAULT_CONFIG: AIConfigForm = {
  providers: {
    openai: {
      provider: 'openai',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      enabled: true,
      models: [],
      rateLimitPerMinute: 60,
      monthlyQuota: 1000000
    },
    claude: {
      provider: 'claude',
      apiKey: '',
      baseUrl: 'https://api.anthropic.com',
      enabled: false,
      models: [],
      rateLimitPerMinute: 40,
      monthlyQuota: 500000
    },
    gemini: {
      provider: 'gemini',
      apiKey: '',
      baseUrl: 'https://generativelanguage.googleapis.com',
      enabled: false,
      models: [],
      rateLimitPerMinute: 60,
      monthlyQuota: 1000000
    },
    azure: {
      provider: 'azure',
      apiKey: '',
      baseUrl: '',
      enabled: false,
      models: [],
      rateLimitPerMinute: 60,
      monthlyQuota: 1000000
    }
  },
  defaultProvider: 'openai',
  cache: {
    enabled: true,
    ttl: 3600,
    maxSize: 100
  },
  rateLimiting: {
    enabled: true,
    globalLimitPerMinute: 100,
    perUserLimitPerMinute: 10
  },
  monitoring: {
    logRequests: true,
    logResponses: false,
    retentionDays: 30
  }
};

const providerIcons: Record<AIProvider, React.ReactNode> = {
  openai: <Brain className="h-4 w-4" />,
  claude: <Sparkles className="h-4 w-4" />,
  gemini: <Cpu className="h-4 w-4" />,
  azure: <Cloud className="h-4 w-4" />
};

export function AIConfiguration() {
  const [config, setConfig] = useState<AIConfigForm>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [testingProvider, setTestingProvider] = useState<AIProvider | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<AIProvider, boolean>>({
    openai: false,
    claude: false,
    gemini: false,
    azure: false
  });

  const handleProviderConfigChange = (
    provider: AIProvider, 
    field: keyof AIProviderConfig, 
    value: any
  ) => {
    setConfig(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider]: {
          ...prev.providers[provider],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: 调用保存API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const handleTestConnection = async (provider: AIProvider) => {
    setTestingProvider(provider);
    // TODO: 调用测试API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestingProvider(null);
  };

  const toggleApiKeyVisibility = (provider: AIProvider) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  return (
    <div className="space-y-6">
      {/* 提供商配置 */}
      <Card>
        <CardHeader>
          <CardTitle>AI Provider Configuration</CardTitle>
          <CardDescription>
            Configure API keys and settings for each AI provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="openai" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              {(Object.keys(config.providers) as AIProvider[]).map(provider => (
                <TabsTrigger key={provider} value={provider} className="flex items-center gap-2">
                  {providerIcons[provider]}
                  <span className="capitalize">{provider}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {(Object.entries(config.providers) as [AIProvider, Partial<AIProviderConfig>][]).map(([provider, providerConfig]) => (
              <TabsContent key={provider} value={provider} className="space-y-4">
                <div className="space-y-4">
                  {/* 启用开关 */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={`${provider}-enabled`}>Enable {provider}</Label>
                      <p className="text-sm text-muted-foreground">
                        Use {provider} as an AI provider
                      </p>
                    </div>
                    <Switch
                      id={`${provider}-enabled`}
                      checked={providerConfig.enabled}
                      onCheckedChange={(checked) => 
                        handleProviderConfigChange(provider, 'enabled', checked)
                      }
                    />
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <Label htmlFor={`${provider}-api-key`}>API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={`${provider}-api-key`}
                          type={showApiKeys[provider] ? 'text' : 'password'}
                          value={providerConfig.apiKey || ''}
                          onChange={(e) => 
                            handleProviderConfigChange(provider, 'apiKey', e.target.value)
                          }
                          placeholder={`Enter your ${provider} API key`}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleApiKeyVisibility(provider)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleTestConnection(provider)}
                        disabled={!providerConfig.apiKey || testingProvider === provider}
                      >
                        {testingProvider === provider ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          'Test Connection'
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Base URL (可选) */}
                  {provider !== 'gemini' && (
                    <div className="space-y-2">
                      <Label htmlFor={`${provider}-base-url`}>
                        Base URL
                        <span className="text-muted-foreground ml-2">(Optional)</span>
                      </Label>
                      <Input
                        id={`${provider}-base-url`}
                        value={providerConfig.baseUrl || ''}
                        onChange={(e) => 
                          handleProviderConfigChange(provider, 'baseUrl', e.target.value)
                        }
                        placeholder="Use default URL"
                      />
                    </div>
                  )}

                  {/* 组织ID (仅Azure) */}
                  {provider === 'azure' && (
                    <div className="space-y-2">
                      <Label htmlFor={`${provider}-org-id`}>Organization ID</Label>
                      <Input
                        id={`${provider}-org-id`}
                        value={providerConfig.organizationId || ''}
                        onChange={(e) => 
                          handleProviderConfigChange(provider, 'organizationId', e.target.value)
                        }
                        placeholder="Enter your Azure organization ID"
                      />
                    </div>
                  )}

                  {/* 速率限制 */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`${provider}-rate-limit`}>Rate Limit (per minute)</Label>
                      <Input
                        id={`${provider}-rate-limit`}
                        type="number"
                        value={providerConfig.rateLimitPerMinute || 60}
                        onChange={(e) => 
                          handleProviderConfigChange(provider, 'rateLimitPerMinute', parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${provider}-quota`}>Monthly Quota (tokens)</Label>
                      <Input
                        id={`${provider}-quota`}
                        type="number"
                        value={providerConfig.monthlyQuota || 1000000}
                        onChange={(e) => 
                          handleProviderConfigChange(provider, 'monthlyQuota', parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  {/* 连接状态 */}
                  {providerConfig.enabled && providerConfig.apiKey && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        {provider} is configured and ready to use
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 全局设置 */}
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
          <CardDescription>
            Configure global AI service settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 默认提供商 */}
          <div className="space-y-2">
            <Label htmlFor="default-provider">Default Provider</Label>
            <Select 
              value={config.defaultProvider} 
              onValueChange={(value: string) => 
                setConfig(prev => ({ ...prev, defaultProvider: value as AIProvider }))
              }
            >
              <SelectTrigger id="default-provider">
                <SelectValue placeholder="Select default provider" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(config.providers) as AIProvider[])
                  .filter(p => config.providers[p].enabled)
                  .map(provider => (
                    <SelectItem key={provider} value={provider}>
                      <div className="flex items-center gap-2">
                        {providerIcons[provider]}
                        <span className="capitalize">{provider}</span>
                      </div>
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          {/* 缓存设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cache Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cache-enabled">Enable Caching</Label>
                  <p className="text-sm text-muted-foreground">
                    Cache AI responses to improve performance
                  </p>
                </div>
                <Switch
                  id="cache-enabled"
                  checked={config.cache.enabled}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({
                      ...prev,
                      cache: { ...prev.cache, enabled: checked }
                    }))
                  }
                />
              </div>

              {config.cache.enabled && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cache-ttl">TTL (seconds)</Label>
                    <Input
                      id="cache-ttl"
                      type="number"
                      value={config.cache.ttl}
                      onChange={(e) => 
                        setConfig(prev => ({
                          ...prev,
                          cache: { ...prev.cache, ttl: parseInt(e.target.value) }
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cache-size">Max Size (MB)</Label>
                    <Input
                      id="cache-size"
                      type="number"
                      value={config.cache.maxSize}
                      onChange={(e) => 
                        setConfig(prev => ({
                          ...prev,
                          cache: { ...prev.cache, maxSize: parseInt(e.target.value) }
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 速率限制 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rate Limiting</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rate-limit-enabled">Enable Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">
                    Prevent API abuse and control costs
                  </p>
                </div>
                <Switch
                  id="rate-limit-enabled"
                  checked={config.rateLimiting.enabled}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({
                      ...prev,
                      rateLimiting: { ...prev.rateLimiting, enabled: checked }
                    }))
                  }
                />
              </div>

              {config.rateLimiting.enabled && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="global-limit">Global Limit (per minute)</Label>
                    <Input
                      id="global-limit"
                      type="number"
                      value={config.rateLimiting.globalLimitPerMinute}
                      onChange={(e) => 
                        setConfig(prev => ({
                          ...prev,
                          rateLimiting: { 
                            ...prev.rateLimiting, 
                            globalLimitPerMinute: parseInt(e.target.value) 
                          }
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-limit">Per User Limit (per minute)</Label>
                    <Input
                      id="user-limit"
                      type="number"
                      value={config.rateLimiting.perUserLimitPerMinute}
                      onChange={(e) => 
                        setConfig(prev => ({
                          ...prev,
                          rateLimiting: { 
                            ...prev.rateLimiting, 
                            perUserLimitPerMinute: parseInt(e.target.value) 
                          }
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 监控设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Monitoring</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="log-requests">Log Requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Store request details for analysis
                  </p>
                </div>
                <Switch
                  id="log-requests"
                  checked={config.monitoring.logRequests}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({
                      ...prev,
                      monitoring: { ...prev.monitoring, logRequests: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="log-responses">Log Responses</Label>
                  <p className="text-sm text-muted-foreground">
                    Store AI responses (may use significant storage)
                  </p>
                </div>
                <Switch
                  id="log-responses"
                  checked={config.monitoring.logResponses}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({
                      ...prev,
                      monitoring: { ...prev.monitoring, logResponses: checked }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention-days">Log Retention (days)</Label>
                <Input
                  id="retention-days"
                  type="number"
                  value={config.monitoring.retentionDays}
                  onChange={(e) => 
                    setConfig(prev => ({
                      ...prev,
                      monitoring: { 
                        ...prev.monitoring, 
                        retentionDays: parseInt(e.target.value) 
                      }
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <Button 
          size="lg" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}