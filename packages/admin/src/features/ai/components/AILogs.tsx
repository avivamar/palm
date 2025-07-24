'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Input, 
  Label, 
  Button, 
  Badge, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
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
  DialogTitle, 
  Textarea 
} from '@/components/ui';
import { 
  Search, 
  Eye, 
  Download,
  Clock,
  User,
  DollarSign,
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { AIProvider, AILogEntry, AILogFilter } from '../types';

// 模拟数据
const mockLogs: AILogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-25T10:30:00Z',
    provider: 'openai',
    model: 'gpt-4-turbo',
    requestId: 'req_1234567890',
    userId: 'user_123',
    prompt: 'Write a product description for an AI companion device',
    response: 'Meet the future of personal assistance with our revolutionary AI companion device...',
    tokens: { prompt: 15, completion: 120, total: 135 },
    responseTime: 1250,
    cost: 0.0034,
    metadata: { temperature: 0.7, maxTokens: 500 }
  },
  {
    id: '2',
    timestamp: '2024-01-25T10:25:00Z',
    provider: 'claude',
    model: 'claude-3-sonnet',
    requestId: 'req_0987654321',
    userId: 'user_456',
    prompt: 'Help me write a customer support response',
    response: 'Thank you for reaching out to us. We understand your concern...',
    tokens: { prompt: 12, completion: 89, total: 101 },
    responseTime: 980,
    cost: 0.0021,
    error: undefined,
    metadata: { temperature: 0.3, maxTokens: 300 }
  },
  {
    id: '3',
    timestamp: '2024-01-25T10:20:00Z',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    requestId: 'req_1122334455',
    prompt: 'Generate marketing copy for social media',
    response: '',
    tokens: { prompt: 10, completion: 0, total: 10 },
    responseTime: 5000,
    cost: 0.0001,
    error: 'Rate limit exceeded',
    metadata: { temperature: 0.9, maxTokens: 200 }
  }
];

export function AILogs() {
  const [logs, setLogs] = useState<AILogEntry[]>(mockLogs);
  const [selectedLog, setSelectedLog] = useState<AILogEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // 过滤器状态
  const [filters, setFilters] = useState<AILogFilter>({
    provider: undefined,
    model: undefined,
    userId: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    hasError: undefined,
    minCost: undefined,
    maxCost: undefined
  });
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  // 搜索状态
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤逻辑
  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.response.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.requestId.includes(searchTerm) ||
      log.userId?.includes(searchTerm);

    const matchesProvider = !filters.provider || log.provider === filters.provider;
    const matchesModel = !filters.model || log.model === filters.model;
    const matchesUserId = !filters.userId || log.userId?.includes(filters.userId);
    const matchesError = filters.hasError === undefined || 
      (filters.hasError ? !!log.error : !log.error);
    
    const matchesDateFrom = !filters.dateFrom || 
      new Date(log.timestamp) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || 
      new Date(log.timestamp) <= new Date(filters.dateTo);
    
    const matchesMinCost = filters.minCost === undefined || log.cost >= filters.minCost;
    const matchesMaxCost = filters.maxCost === undefined || log.cost <= filters.maxCost;

    return matchesSearch && matchesProvider && matchesModel && matchesUserId && 
           matchesError && matchesDateFrom && matchesDateTo && 
           matchesMinCost && matchesMaxCost;
  });

  // 分页逻辑
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewDetail = (log: AILogEntry) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ai-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getStatusBadge = (log: AILogEntry) => {
    if (log.error) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <CheckCircle className="h-3 w-3 mr-1" />
        Success
      </Badge>
    );
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime > 3000) return 'text-red-600';
    if (responseTime > 1500) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Request Logs</h2>
          <p className="text-muted-foreground">
            View and analyze AI service request logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLogs([...mockLogs])}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* 搜索和过滤器 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索栏 */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts, responses, request IDs, or user IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 过滤器行 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select 
                value={filters.provider || 'all'} 
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    provider: value === 'all' ? undefined : value as AIProvider 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="azure">Azure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={filters.hasError === undefined ? 'all' : filters.hasError ? 'error' : 'success'} 
                onValueChange={(value) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    hasError: value === 'all' ? undefined : value === 'error' 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success Only</SelectItem>
                  <SelectItem value="error">Errors Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                placeholder="Filter by user"
                value={filters.userId || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  userId: e.target.value || undefined 
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  dateFrom: e.target.value || undefined 
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  dateTo: e.target.value || undefined 
                }))}
              />
            </div>

            <div className="space-y-2 flex items-end">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 日志表格 */}
      <Card>
        <CardHeader>
          <CardTitle>
            Request Logs ({filteredLogs.length})
          </CardTitle>
          <CardDescription>
            Page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Provider/Model</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Prompt Preview</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium capitalize">{log.provider}</div>
                      <div className="text-muted-foreground">{log.model}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {log.userId ? (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.userId}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">System</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm" title={log.prompt}>
                      {log.prompt}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`text-sm font-medium ${getResponseTimeColor(log.responseTime)}`}>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {log.responseTime}ms
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {log.tokens.total}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.tokens.prompt}+{log.tokens.completion}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${log.cost.toFixed(4)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(log)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Detail</DialogTitle>
            <DialogDescription>
              Detailed information about the AI request
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Request ID</Label>
                  <div className="text-sm font-mono">{selectedLog.requestId}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <div className="text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Provider</Label>
                  <div className="text-sm capitalize">{selectedLog.provider}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Model</Label>
                  <div className="text-sm">{selectedLog.model}</div>
                </div>
              </div>

              {/* 性能指标 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold flex items-center justify-center gap-1">
                        <Clock className="h-5 w-5" />
                        {selectedLog.responseTime}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Response Time</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold flex items-center justify-center gap-1">
                        <Zap className="h-5 w-5" />
                        {selectedLog.tokens.total}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Tokens</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold flex items-center justify-center gap-1">
                        <DollarSign className="h-5 w-5" />
                        {selectedLog.cost.toFixed(4)}
                      </div>
                      <div className="text-sm text-muted-foreground">Cost</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {getStatusBadge(selectedLog)}
                      </div>
                      <div className="text-sm text-muted-foreground">Status</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 提示词和响应 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Prompt</Label>
                  <Textarea 
                    value={selectedLog.prompt} 
                    readOnly 
                    className="min-h-[100px] font-mono"
                  />
                </div>

                {selectedLog.error ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-red-600">Error</Label>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {selectedLog.error}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Response</Label>
                    <Textarea 
                      value={selectedLog.response} 
                      readOnly 
                      className="min-h-[150px] font-mono"
                    />
                  </div>
                )}
              </div>

              {/* 元数据 */}
              {selectedLog.metadata && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Metadata</Label>
                  <pre className="p-3 bg-muted rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}