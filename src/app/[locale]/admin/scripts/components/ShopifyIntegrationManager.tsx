'use client';

/**
 * 🛍️ Shopify 集成管理组件
 * 专门管理 Shopify 相关的脚本和配置
 */

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  Package,
  Play,
  RefreshCw,
  Settings,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

type ShopifyStatus = {
  apiConnection: 'connected' | 'disconnected' | 'error';
  productSync: 'synced' | 'pending' | 'error';
  orderSync: 'synced' | 'pending' | 'error';
  inventorySync: 'synced' | 'pending' | 'error';
  webhooks: 'active' | 'inactive' | 'error';
  lastSync: Date;
  totalProducts: number;
  totalOrders: number;
  syncProgress?: number;
};

type ShopifyOperation = {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'error';
  progress?: number;
  output?: string[];
  critical: boolean;
};

const SHOPIFY_OPERATIONS: ShopifyOperation[] = [
  {
    id: 'shopify-health-check',
    name: 'Shopify 健康检查',
    description: '检查 Shopify API 连接和基本配置',
    status: 'idle',
    critical: true,
  },
  {
    id: 'product-sync',
    name: '产品信息同步',
    description: '同步产品数据到 Shopify',
    status: 'idle',
    critical: true,
  },
  {
    id: 'inventory-sync',
    name: '库存同步',
    description: '同步库存数据',
    status: 'idle',
    critical: false,
  },
  {
    id: 'order-sync',
    name: '订单同步',
    description: '将订单数据推送到 Shopify',
    status: 'idle',
    critical: true,
  },
  {
    id: 'webhook-setup',
    name: 'Webhook 配置',
    description: '配置 Shopify Webhooks',
    status: 'idle',
    critical: false,
  },
  {
    id: 'integration-test',
    name: '集成测试',
    description: '运行完整的集成测试套件',
    status: 'idle',
    critical: false,
  },
];

export function ShopifyIntegrationManager() {
  const [shopifyStatus, setShopifyStatus] = useState<ShopifyStatus | null>(null);
  const [operations, setOperations] = useState<ShopifyOperation[]>(SHOPIFY_OPERATIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [runningOperations, setRunningOperations] = useState<Set<string>>(new Set());

  // 获取 Shopify 状态
  const fetchShopifyStatus = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/shopify/status');
      if (response.ok) {
        const data = await response.json();
        setShopifyStatus(data);
      } else {
        // 模拟数据
        const mockStatus: ShopifyStatus = {
          apiConnection: 'connected',
          productSync: 'synced',
          orderSync: 'pending',
          inventorySync: 'synced',
          webhooks: 'active',
          lastSync: new Date(Date.now() - 1000 * 60 * 15), // 15分钟前
          totalProducts: 5,
          totalOrders: 127,
        };
        setShopifyStatus(mockStatus);
      }
    } catch (error) {
      console.error('获取 Shopify 状态失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 执行 Shopify 操作
  const executeOperation = async (operationId: string) => {
    setRunningOperations(prev => new Set([...prev, operationId]));

    setOperations(prev => prev.map(op =>
      op.id === operationId
        ? { ...op, status: 'running', progress: 0, output: ['开始执行...'] }
        : op,
    ));

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setOperations(prev => prev.map(op =>
          op.id === operationId && op.status === 'running'
            ? { ...op, progress: Math.min((op.progress || 0) + 20, 90) }
            : op,
        ));
      }, 1000);

      // 这里可以调用实际的API，暂时使用模拟结果
      // const response = await fetch('/api/admin/shopify/execute', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ operationId }),
      // });

      clearInterval(progressInterval);

      // 模拟结果
      const success = Math.random() > 0.2; // 80% 成功率
      const mockOutput = success
        ? ['连接 Shopify API...', '验证配置...', '执行操作...', '操作完成!']
        : ['连接 Shopify API...', '验证配置...', '错误: API 限流'];

      setOperations(prev => prev.map(op =>
        op.id === operationId
          ? {
              ...op,
              status: success ? 'success' : 'error',
              progress: 100,
              output: mockOutput,
            }
          : op,
      ));

      // 刷新状态
      await fetchShopifyStatus();
    } catch (error) {
      setOperations(prev => prev.map(op =>
        op.id === operationId
          ? {
              ...op,
              status: 'error',
              progress: 0,
              output: [`执行失败: ${error instanceof Error ? error.message : '未知错误'}`],
            }
          : op,
      ));
    } finally {
      setRunningOperations((prev) => {
        const next = new Set(prev);
        next.delete(operationId);
        return next;
      });
    }
  };

  // 批量执行关键操作
  const runCriticalOperations = async () => {
    const criticalOps = operations.filter(op => op.critical);
    for (const op of criticalOps) {
      await executeOperation(op.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  useEffect(() => {
    fetchShopifyStatus();
  }, []);

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'synced':
      case 'active':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'disconnected':
      case 'inactive':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return '已连接';
      case 'disconnected': return '未连接';
      case 'synced': return '已同步';
      case 'pending': return '待同步';
      case 'active': return '活跃';
      case 'inactive': return '未激活';
      case 'error': return '错误';
      case 'running': return '运行中';
      case 'success': return '成功';
      default: return status;
    }
  };

  if (!shopifyStatus) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Shopify 状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <ShoppingBag className="h-5 w-5 text-blue-500" />
              {getStatusIcon(shopifyStatus.apiConnection)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusText(shopifyStatus.apiConnection)}</div>
            <p className="text-xs text-gray-500">API 连接</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Package className="h-5 w-5 text-green-500" />
              {getStatusIcon(shopifyStatus.productSync)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopifyStatus.totalProducts}</div>
            <p className="text-xs text-gray-500">产品数量</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Database className="h-5 w-5 text-purple-500" />
              {getStatusIcon(shopifyStatus.orderSync)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopifyStatus.totalOrders}</div>
            <p className="text-xs text-gray-500">订单数量</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-orange-500" />
              {getStatusIcon(shopifyStatus.webhooks)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusText(shopifyStatus.webhooks)}</div>
            <p className="text-xs text-gray-500">Webhooks</p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={runCriticalOperations}
          disabled={runningOperations.size > 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Play className="h-4 w-4 mr-2" />
          运行关键同步
        </Button>
        <Button variant="outline" onClick={fetchShopifyStatus} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          刷新状态
        </Button>
      </div>

      {/* 操作列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {operations.map(operation => (
          <Card key={operation.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(operation.status)}
                  <CardTitle className="text-lg">{operation.name}</CardTitle>
                  {operation.critical && (
                    <Badge variant="destructive" className="text-xs">关键</Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => executeOperation(operation.id)}
                  disabled={runningOperations.size > 0}
                >
                  <Play className="h-3 w-3 mr-1" />
                  执行
                </Button>
              </div>
              <CardDescription>{operation.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* 进度条 */}
              {operation.status === 'running' && operation.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>执行进度</span>
                    <span>
                      {operation.progress}
                      %
                    </span>
                  </div>
                  <Progress value={operation.progress} className="h-2" />
                </div>
              )}

              {/* 执行输出 */}
              {operation.output && operation.output.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">执行日志</div>
                  <ScrollArea className="h-20 w-full rounded border">
                    <div className="p-2 space-y-1">
                      {operation.output.map((line, index) => (
                        <div key={index} className="text-xs font-mono text-gray-700 dark:text-gray-300">
                          {line}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 同步信息 */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertTitle>同步信息</AlertTitle>
        <AlertDescription>
          最后同步时间:
          {' '}
          {shopifyStatus.lastSync.toLocaleString()}
          {shopifyStatus.syncProgress && (
            <span className="ml-4">
              同步进度:
              {shopifyStatus.syncProgress}
              %
            </span>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
