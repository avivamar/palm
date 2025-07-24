'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Switch } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Progress } from '@/components/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { 
  Shield, 
  Users, 
  Clock, 
  AlertTriangle, 
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Settings
} from 'lucide-react';
import type { AIProvider, AIQuotaLimit } from '../types';

// 模拟数据
const mockQuotaLimits: AIQuotaLimit[] = [
  {
    userId: 'user_123',
    provider: 'openai',
    type: 'monthly',
    limit: 10000,
    used: 7500,
    resetAt: '2024-02-01T00:00:00Z'
  },
  {
    userId: 'user_456',
    provider: 'claude',
    type: 'monthly',
    limit: 5000,
    used: 2100,
    resetAt: '2024-02-01T00:00:00Z'
  },
  {
    provider: 'openai',
    type: 'daily',
    limit: 1000,
    used: 850,
    resetAt: '2024-01-26T00:00:00Z'
  }
];

const providers = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'azure', label: 'Azure' }
];

const limitTypes = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'monthly', label: 'Monthly' }
];

export function RateLimitManager() {
  const [quotaLimits, setQuotaLimits] = useState<AIQuotaLimit[]>(mockQuotaLimits);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLimit, setEditingLimit] = useState<Partial<AIQuotaLimit> | null>(null);

  // 全局速率限制设置
  const [globalSettings, setGlobalSettings] = useState({
    enabled: true,
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    burstLimit: 10,
    blockDuration: 300 // 秒
  });

  const handleSaveGlobalSettings = () => {
    // TODO: 保存全局设置
    console.log('Saving global settings:', globalSettings);
  };

  const handleCreateLimit = () => {
    setEditingLimit({
      provider: 'openai',
      type: 'monthly',
      limit: 1000,
      used: 0,
      resetAt: new Date().toISOString()
    });
    setIsEditing(true);
  };

  const handleEditLimit = (limit: AIQuotaLimit) => {
    setEditingLimit(limit);
    setIsEditing(true);
  };

  const handleSaveLimit = () => {
    if (!editingLimit) return;

    if (editingLimit.userId && quotaLimits.find(l => l.userId === editingLimit.userId && l.provider === editingLimit.provider)) {
      // 更新现有限制
      setQuotaLimits(prev => prev.map(l => 
        l.userId === editingLimit.userId && l.provider === editingLimit.provider 
          ? { ...editingLimit as AIQuotaLimit }
          : l
      ));
    } else {
      // 创建新限制
      setQuotaLimits(prev => [...prev, editingLimit as AIQuotaLimit]);
    }

    setIsEditing(false);
    setEditingLimit(null);
  };

  const handleDeleteLimit = (limit: AIQuotaLimit) => {
    setQuotaLimits(prev => prev.filter(l => 
      !(l.userId === limit.userId && l.provider === limit.provider && l.type === limit.type)
    ));
  };

  const handleResetUsage = (limit: AIQuotaLimit) => {
    setQuotaLimits(prev => prev.map(l => 
      l.userId === limit.userId && l.provider === limit.provider && l.type === limit.type
        ? { ...l, used: 0 }
        : l
    ));
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageStatus = (used: number, limit: number) => {
    const percentage = getUsagePercentage(used, limit);
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold">Rate Limiting & Quotas</h2>
        <p className="text-muted-foreground">
          Manage API usage limits and prevent abuse
        </p>
      </div>

      {/* 全局设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Rate Limiting
          </CardTitle>
          <CardDescription>
            Configure system-wide rate limiting rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-rate-limiting">Enable Rate Limiting</Label>
              <p className="text-sm text-muted-foreground">
                Apply rate limits to all API requests
              </p>
            </div>
            <Switch
              id="enable-rate-limiting"
              checked={globalSettings.enabled}
              onCheckedChange={(checked) => 
                setGlobalSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {globalSettings.enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requests-per-minute">Requests per Minute</Label>
                  <Input
                    id="requests-per-minute"
                    type="number"
                    value={globalSettings.requestsPerMinute}
                    onChange={(e) => setGlobalSettings(prev => ({ 
                      ...prev, 
                      requestsPerMinute: parseInt(e.target.value) 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requests-per-hour">Requests per Hour</Label>
                  <Input
                    id="requests-per-hour"
                    type="number"
                    value={globalSettings.requestsPerHour}
                    onChange={(e) => setGlobalSettings(prev => ({ 
                      ...prev, 
                      requestsPerHour: parseInt(e.target.value) 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requests-per-day">Requests per Day</Label>
                  <Input
                    id="requests-per-day"
                    type="number"
                    value={globalSettings.requestsPerDay}
                    onChange={(e) => setGlobalSettings(prev => ({ 
                      ...prev, 
                      requestsPerDay: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="burst-limit">Burst Limit</Label>
                  <Input
                    id="burst-limit"
                    type="number"
                    value={globalSettings.burstLimit}
                    onChange={(e) => setGlobalSettings(prev => ({ 
                      ...prev, 
                      burstLimit: parseInt(e.target.value) 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum requests allowed in a burst
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="block-duration">Block Duration (seconds)</Label>
                  <Input
                    id="block-duration"
                    type="number"
                    value={globalSettings.blockDuration}
                    onChange={(e) => setGlobalSettings(prev => ({ 
                      ...prev, 
                      blockDuration: parseInt(e.target.value) 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long to block after limit exceeded
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSaveGlobalSettings}>
              Save Global Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 配额限制列表 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quota Limits
              </CardTitle>
              <CardDescription>
                Manage individual user and provider quotas
              </CardDescription>
            </div>
            <Button onClick={handleCreateLimit}>
              <Plus className="h-4 w-4 mr-2" />
              Add Limit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User/Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Reset At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotaLimits.map((limit, index) => {
                const usagePercentage = getUsagePercentage(limit.used, limit.limit);
                const status = getUsageStatus(limit.used, limit.limit);
                
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {limit.userId ? (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {limit.userId}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Global
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {limit.provider}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {limit.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {limit.used.toLocaleString()} / {limit.limit.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress 
                          value={usagePercentage} 
                          className={`w-[100px] ${
                            status === 'danger' ? 'bg-red-100' :
                            status === 'warning' ? 'bg-yellow-100' :
                            'bg-green-100'
                          }`}
                        />
                        <div className="text-xs text-center">
                          {usagePercentage.toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(limit.resetAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          status === 'danger' ? 'destructive' :
                          status === 'warning' ? 'default' :
                          'secondary'
                        }
                      >
                        {status === 'danger' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {status === 'danger' ? 'Over Limit' :
                         status === 'warning' ? 'High Usage' :
                         'Normal'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLimit(limit)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetUsage(limit)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLimit(limit)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 编辑配额对话框 */}
      {isEditing && editingLimit && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>
              {editingLimit.userId ? 'Edit Quota Limit' : 'Create Quota Limit'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-user-id">User ID (Optional)</Label>
                <Input
                  id="edit-user-id"
                  value={editingLimit.userId || ''}
                  onChange={(e) => setEditingLimit(prev => ({ 
                    ...prev, 
                    userId: e.target.value || undefined 
                  }))}
                  placeholder="Leave empty for global limit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-provider">Provider</Label>
                <Select 
                  value={editingLimit.provider} 
                  onValueChange={(value: string) => 
                    setEditingLimit(prev => ({ ...prev, provider: value as AIProvider }))
                  }
                >
                  <SelectTrigger id="edit-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(provider => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Limit Type</Label>
                <Select 
                  value={editingLimit.type} 
                  onValueChange={(value: string) => 
                    setEditingLimit(prev => ({ ...prev, type: value as 'monthly' | 'daily' | 'hourly' }))
                  }
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {limitTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-limit">Limit</Label>
                <Input
                  id="edit-limit"
                  type="number"
                  value={editingLimit.limit}
                  onChange={(e) => setEditingLimit(prev => ({ 
                    ...prev, 
                    limit: parseInt(e.target.value) 
                  }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditingLimit(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveLimit}>
                Save Limit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}