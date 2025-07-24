'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge, 
  Progress, 
  Input, 
  Label, 
  Switch, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow, 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Search,
  Eye,
  HardDrive,
  Zap,
  TrendingUp,
  AlertCircle,
  Settings
} from 'lucide-react';
import type { AICacheConfig } from '../types';

// 模拟缓存数据
const mockCacheEntries = [
  {
    key: 'ai:text:openai:en:abc123',
    content: 'Write a compelling product description for an AI companion device...',
    response: 'Meet the future of personal assistance with our revolutionary AI companion device...',
    size: 1024,
    hits: 15,
    lastAccess: '2024-01-25T10:30:00Z',
    createdAt: '2024-01-24T14:20:00Z',
    ttl: 3600,
    provider: 'openai'
  },
  {
    key: 'ai:chat:claude:es:def456',
    content: 'Ayúdame a escribir una respuesta de soporte al cliente...',
    response: 'Gracias por contactarnos. Entendemos su preocupación...',
    size: 512,
    hits: 8,
    lastAccess: '2024-01-25T09:15:00Z',
    createdAt: '2024-01-24T16:45:00Z',
    ttl: 3600,
    provider: 'claude'
  },
  {
    key: 'ai:text:gemini:ja:ghi789',
    content: 'マーケティングコピーを生成してください...',
    response: '革新的なAIアシスタント機能を備えた...',
    size: 768,
    hits: 3,
    lastAccess: '2024-01-25T08:45:00Z',
    createdAt: '2024-01-25T07:30:00Z',
    ttl: 3600,
    provider: 'gemini'
  }
];

export function CacheManager() {
  const [cacheEntries, setCacheEntries] = useState(mockCacheEntries);
  const [selectedEntry, setSelectedEntry] = useState<typeof mockCacheEntries[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 缓存配置
  const [cacheConfig, setCacheConfig] = useState<AICacheConfig>({
    enabled: true,
    ttl: 3600,
    maxSize: 100,
    hitRate: 75.2,
    totalCached: 1248,
    totalSize: 45.7
  });

  // 缓存统计
  const totalEntries = cacheEntries.length;
  const totalHits = cacheEntries.reduce((sum, entry) => sum + entry.hits, 0);
  const avgHits = totalHits / totalEntries;

  const filteredEntries = cacheEntries.filter(entry =>
    entry.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetail = (entry: typeof mockCacheEntries[0]) => {
    setSelectedEntry(entry);
    setIsDetailOpen(true);
  };

  const handleDeleteEntry = (key: string) => {
    setCacheEntries(prev => prev.filter(entry => entry.key !== key));
  };

  const handleClearAll = () => {
    setCacheEntries([]);
  };

  const handleRefreshStats = () => {
    // 模拟刷新统计数据
    setCacheConfig(prev => ({
      ...prev,
      hitRate: Math.random() * 20 + 70, // 70-90%
      totalCached: Math.floor(Math.random() * 500 + 1000),
      totalSize: Math.random() * 20 + 30
    }));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Cache Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage AI response cache
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleClearAll}
            disabled={cacheEntries.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* 缓存统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheConfig.totalCached?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Currently cached responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheConfig.hitRate?.toFixed(1)}%</div>
            <Progress value={cacheConfig.hitRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Storage Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheConfig.totalSize?.toFixed(1)} MB</div>
            <Progress value={(cacheConfig.totalSize || 0) / cacheConfig.maxSize * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Avg Hits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHits.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Per cache entry
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 缓存配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cache Configuration
          </CardTitle>
          <CardDescription>
            Configure cache behavior and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cache-enabled">Enable Caching</Label>
              <p className="text-sm text-muted-foreground">
                Cache AI responses to improve performance
              </p>
            </div>
            <Switch
              id="cache-enabled"
              checked={cacheConfig.enabled}
              onCheckedChange={(checked) => 
                setCacheConfig(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {cacheConfig.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cache-ttl">TTL (seconds)</Label>
                <Input
                  id="cache-ttl"
                  type="number"
                  value={cacheConfig.ttl}
                  onChange={(e) => setCacheConfig(prev => ({ 
                    ...prev, 
                    ttl: parseInt(e.target.value) 
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cache-max-size">Max Size (MB)</Label>
                <Input
                  id="cache-max-size"
                  type="number"
                  value={cacheConfig.maxSize}
                  onChange={(e) => setCacheConfig(prev => ({ 
                    ...prev, 
                    maxSize: parseInt(e.target.value) 
                  }))}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 缓存条目列表 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Cache Entries ({filteredEntries.length})</CardTitle>
              <CardDescription>
                Cached AI responses with usage statistics
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cache entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Hits</TableHead>
                <TableHead>Last Access</TableHead>
                <TableHead>TTL</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => {
                const timeUntilExpiry = entry.ttl - 
                  Math.floor((new Date().getTime() - new Date(entry.createdAt).getTime()) / 1000);
                const isExpiringSoon = timeUntilExpiry < 300; // 5 minutes
                
                return (
                  <TableRow key={entry.key}>
                    <TableCell>
                      <div className="font-mono text-xs max-w-[200px] truncate">
                        {entry.key}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {entry.provider}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px] truncate text-sm">
                        {entry.content}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatBytes(entry.size)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span className="font-medium">{entry.hits}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatTimeAgo(entry.lastAccess)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm ${isExpiringSoon ? 'text-red-600' : ''}`}>
                        {isExpiringSoon && <AlertCircle className="h-3 w-3 inline mr-1" />}
                        {Math.max(timeUntilExpiry, 0)}s
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(entry)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.key)}
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

          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No matching cache entries found' : 'No cache entries available'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cache Entry Detail</DialogTitle>
            <DialogDescription>
              Detailed information about the cached response
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Cache Key</Label>
                  <div className="text-sm font-mono p-2 bg-muted rounded">
                    {selectedEntry.key}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Provider</Label>
                  <div className="text-sm capitalize">{selectedEntry.provider}</div>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">{selectedEntry.hits}</div>
                      <div className="text-sm text-muted-foreground">Cache Hits</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">{formatBytes(selectedEntry.size)}</div>
                      <div className="text-sm text-muted-foreground">Size</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {formatTimeAgo(selectedEntry.createdAt)}
                      </div>
                      <div className="text-sm text-muted-foreground">Created</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {formatTimeAgo(selectedEntry.lastAccess)}
                      </div>
                      <div className="text-sm text-muted-foreground">Last Access</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 缓存内容 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Cached Prompt</Label>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedEntry.content}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Cached Response</Label>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedEntry.response}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}