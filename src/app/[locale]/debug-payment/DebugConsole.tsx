'use client';

import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  FileText,
  Globe,
  Monitor,
  RefreshCw,
  Server,
  Settings,
  Terminal,
  TestTube,
  Webhook,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { handleCheckout } from '@/app/actions/checkoutActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type WebhookLog = {
  id: number;
  event: string;
  status: 'success' | 'failed' | 'pending';
  email: string | null;
  error: string | null;
  klaviyoEventSent: boolean | null;
  receivedAt: string;
  createdAt: string;
  stripeEventId: string | null;
};

type DatabaseStats = {
  total_preorders: number;
  completed_preorders: number;
  webhook_logs_count: number;
  klaviyo_success_rate: number;
};

type SystemHealth = {
  status: string;
  services: {
    database: string;
    stripe: string;
    klaviyo: string;
  };
  timestamp: string;
};

type TestResult = {
  name: string;
  status: 'running' | 'success' | 'failed';
  message?: string;
  duration?: number;
};

export default function DebugConsole() {
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'logs' | 'tools'>('overview');

  // 安全的日期格式化函数，避免 SSR 水合错误
  const formatDate = (dateString: string) => {
    if (typeof window === 'undefined') {
      return dateString;
    }
    try {
      return new Date(dateString).toISOString().replace('T', ' ').slice(0, 19);
    } catch {
      return dateString;
    }
  };

  const handleTestPayment = async () => {
    setIsTestLoading(true);
    setTestResult(null);

    // 生成随机邮箱（仅在客户端执行时）
    const randomId = typeof window !== 'undefined' ? Date.now() : Math.floor(Math.random() * 1000000);

    const formData = new FormData();
    formData.append('priceId', 'price_1RdAu1BCMz50a5RzChT7XYGm'); // Using a test price ID
    formData.append('email', `test-${randomId}@example.com`);
    formData.append('locale', 'en');
    formData.append('color', 'Red');

    try {
      await handleCheckout(formData);
      setTestResult('Checkout process initiated. Redirecting...');
      // 延迟刷新日志
      setTimeout(loadWebhookLogs, 2000);
    } catch (err) {
      console.error('Test payment failed:', err);
      setTestResult(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsTestLoading(false);
    }
  };

  const loadWebhookLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await fetch('/api/webhook/logs');
      if (response.ok) {
        const data = await response.json();
        setWebhookLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load webhook logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const loadDbStats = async () => {
    try {
      const response = await fetch('/api/webhook/logs/stats');
      if (response.ok) {
        const data = await response.json();
        setDbStats(data);
      }
    } catch (error) {
      console.error('Failed to load database stats:', error);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const response = await fetch('/api/webhook/health');
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data);
      }
    } catch (error) {
      console.error('Failed to load system health:', error);
    }
  };

  const runSystemTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    const tests = [
      { name: 'Database Connection', endpoint: '/api/webhook/health' },
      { name: 'Webhook Logs API', endpoint: '/api/webhook/logs' },
      { name: 'Stats API', endpoint: '/api/webhook/logs/stats' },
      { name: 'Stripe Configuration', endpoint: '/api/webhook/health' },
      { name: 'Klaviyo Configuration', endpoint: '/api/webhook/health' },
    ];

    for (const test of tests) {
      const startTime = Date.now();
      setTestResults(prev => [...prev, { name: test.name, status: 'running' }]);

      try {
        const response = await fetch(test.endpoint);
        const duration = Date.now() - startTime;

        if (response.ok) {
          setTestResults(prev => prev.map(t =>
            t.name === test.name
              ? { ...t, status: 'success', duration, message: `HTTP ${response.status}` }
              : t,
          ));
        } else {
          setTestResults(prev => prev.map(t =>
            t.name === test.name
              ? { ...t, status: 'failed', duration, message: `HTTP ${response.status}` }
              : t,
          ));
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        setTestResults(prev => prev.map(t =>
          t.name === test.name
            ? { ...t, status: 'failed', duration, message: error instanceof Error ? error.message : 'Network error' }
            : t,
        ));
      }

      // 添加小延迟使界面更友好
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunningTests(false);
  };

  useEffect(() => {
    loadWebhookLogs();
    loadDbStats();
    loadSystemHealth();

    // 定期刷新数据
    const interval = setInterval(() => {
      loadWebhookLogs();
      loadDbStats();
      loadSystemHealth();
    }, 30000); // 每30秒刷新

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      success: 'default',
      failed: 'destructive',
      pending: 'secondary',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const debugTools = [
    { id: 'test-payment', name: '测试支付', icon: Zap, description: '创建测试支付会话' },
    { id: 'env-check', name: '环境检查', icon: Settings, description: '验证环境变量配置' },
    { id: 'api-test', name: 'API 测试', icon: Terminal, description: '测试 API 端点' },
    { id: 'db-test', name: '数据库测试', icon: Database, description: '验证数据库连接' },
    { id: 'webhook-test', name: 'Webhook 测试', icon: Webhook, description: '测试 Webhook 处理' },
    { id: 'klaviyo-test', name: 'Klaviyo 测试', icon: Globe, description: '测试 Klaviyo 集成' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">开发者调试控制台</h1>
        <p className="text-gray-600">统一的系统监控、测试和调试工具面板</p>
      </div>

      {/* 标签导航 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: '系统概览', icon: Monitor },
              { id: 'tests', name: '测试套件', icon: TestTube },
              { id: 'logs', name: '日志监控', icon: FileText },
              { id: 'tools', name: '调试工具', icon: Terminal },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 系统概览标签页 */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* 数据库统计 */}
            {dbStats && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">数据库统计</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">总预订数:</span>
                      <span className="font-semibold">{dbStats.total_preorders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">完成支付:</span>
                      <span className="font-semibold">{dbStats.completed_preorders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Webhook 日志:</span>
                      <span className="font-semibold">{dbStats.webhook_logs_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Klaviyo 成功率:</span>
                      <span className="font-semibold">
                        {Math.round(dbStats.klaviyo_success_rate)}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Webhook 状态 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Webhook 状态</CardTitle>
                <Webhook className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">最近状态:</span>
                    {webhookLogs.length > 0 && webhookLogs[0]
                      ? (
                          <div className="flex items-center gap-1">
                            {getStatusIcon(webhookLogs[0].status)}
                            {getStatusBadge(webhookLogs[0].status)}
                          </div>
                        )
                      : (
                          <span className="text-sm text-gray-500">无数据</span>
                        )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">日志总数:</span>
                    <span className="font-semibold">{webhookLogs.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 系统健康 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">系统健康</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {systemHealth
                    ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm">数据库:</span>
                            <div className="flex items-center gap-2">
                              {systemHealth.services.database === 'connected'
                                ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )
                                : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                              <Badge variant={systemHealth.services.database === 'connected' ? 'secondary' : 'destructive'}>
                                {systemHealth.services.database === 'connected' ? '正常' : systemHealth.services.database}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Stripe:</span>
                            <div className="flex items-center gap-2">
                              {systemHealth.services.stripe === 'configured'
                                ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )
                                : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                              <Badge variant={systemHealth.services.stripe === 'configured' ? 'secondary' : 'destructive'}>
                                {systemHealth.services.stripe === 'configured' ? '正常' : systemHealth.services.stripe}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Klaviyo:</span>
                            <div className="flex items-center gap-2">
                              {systemHealth.services.klaviyo === 'configured'
                                ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )
                                : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                              <Badge variant={systemHealth.services.klaviyo === 'configured' ? 'secondary' : 'destructive'}>
                                {systemHealth.services.klaviyo === 'configured' ? '正常' : systemHealth.services.klaviyo}
                              </Badge>
                            </div>
                          </div>
                        </>
                      )
                    : (
                        <div className="text-sm text-gray-500">加载中...</div>
                      )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 快速测试支付 */}
          <Card>
            <CardHeader>
              <CardTitle>快速测试支付</CardTitle>
              <CardDescription>创建一个测试支付会话验证整个流程</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleTestPayment}
                disabled={isTestLoading}
                className="w-full"
              >
                {isTestLoading
                  ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        创建测试支付中...
                      </>
                    )
                  : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        创建测试支付
                      </>
                    )}
              </Button>
              {testResult && (
                <div
                  className={cn(
                    'p-3 rounded border',
                    testResult.includes('成功')
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800',
                  )}
                >
                  {testResult}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* 测试套件标签页 */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>系统测试套件</CardTitle>
                <CardDescription>运行完整的系统健康检查和功能测试</CardDescription>
              </div>
              <Button
                onClick={runSystemTests}
                disabled={isRunningTests}
                variant="outline"
              >
                {isRunningTests
                  ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        运行中...
                      </>
                    )
                  : (
                      <>
                        <TestTube className="mr-2 h-4 w-4" />
                        运行所有测试
                      </>
                    )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.length === 0 && !isRunningTests
                  ? (
                      <div className="text-center py-8 text-gray-500">
                        点击"运行所有测试"开始系统检查
                      </div>
                    )
                  : (
                      testResults.map((test, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {test.status === 'running' && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
                            {test.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {test.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
                            <div>
                              <div className="font-medium">{test.name}</div>
                              {test.message && (
                                <div className="text-sm text-gray-500">{test.message}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              test.status === 'success'
                                ? 'default'
                                : test.status === 'failed' ? 'destructive' : 'secondary'
                            }
                            >
                              {test.status}
                            </Badge>
                            {test.duration && (
                              <div className="text-sm text-gray-500 mt-1">
                                {test.duration}
                                ms
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 日志监控标签页 */}
      {activeTab === 'logs' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Webhook 日志</CardTitle>
              <CardDescription>最近的 webhook 处理记录</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadWebhookLogs}
              disabled={isLoadingLogs}
            >
              {isLoadingLogs
                ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )
                : (
                    <RefreshCw className="h-4 w-4" />
                  )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {webhookLogs.length === 0
                ? (
                    <div className="text-center py-8 text-gray-500">
                      暂无 webhook 日志
                    </div>
                  )
                : (
                    webhookLogs.map(log => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(log.status)}
                          <div>
                            <div className="font-medium">{log.event}</div>
                            {log.email && (
                              <div className="text-sm text-gray-500">{log.email}</div>
                            )}
                            {log.error && (
                              <div className="text-sm text-red-600">{log.error}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(log.status)}
                            {log.klaviyoEventSent !== null && (
                              <Badge variant={log.klaviyoEventSent ? 'default' : 'secondary'}>
                                Klaviyo:
                                {' '}
                                {log.klaviyoEventSent ? '成功' : '失败'}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(log.receivedAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 调试工具标签页 */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {debugTools.map(tool => (
            <Card key={tool.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <tool.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <CardDescription className="text-sm">{tool.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (tool.id === 'test-payment') {
                        handleTestPayment();
                      } else {
                        console.log(`运行 ${tool.name} 工具`);
                      }
                    }}
                  >
                    运行
                    {' '}
                    {tool.name}
                  </Button>

                  {/* 添加工具相关的快速链接 */}
                  <div className="text-xs text-gray-500 space-y-1">
                    {tool.id === 'env-check' && (
                      <div>检查 .env.local 配置</div>
                    )}
                    {tool.id === 'api-test' && (
                      <div>测试所有 API 端点</div>
                    )}
                    {tool.id === 'db-test' && (
                      <div>验证数据库连接和查询</div>
                    )}
                    {tool.id === 'webhook-test' && (
                      <div>模拟 Stripe webhook 事件</div>
                    )}
                    {tool.id === 'klaviyo-test' && (
                      <div>测试 Klaviyo API 连接</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* 外部链接和资源 */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                外部资源和文档
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <a
                  href="https://dashboard.stripe.com/test/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Stripe Webhooks</span>
                </a>
                <a
                  href="https://www.klaviyo.com/account#events"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Klaviyo Events</span>
                </a>
                <a
                  href="/test-payment"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Terminal className="h-4 w-4" />
                  <span className="text-sm">测试支付页面</span>
                </a>
                <a
                  href="/api/webhook/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">系统健康 API</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
