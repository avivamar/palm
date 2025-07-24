'use client';

/**
 * 🛠️ 脚本管理客户端组件
 * 提供脚本执行和状态管理功能
 */

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  RefreshCw,
  Square,
  Terminal,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ScriptInfo = {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'setup' | 'testing' | 'shopify';
  status: 'idle' | 'running' | 'success' | 'error';
  lastRun?: Date;
  duration?: number;
  output?: string[];
  critical: boolean;
};

const CORE_SCRIPTS: ScriptInfo[] = [
  {
    id: 'check-env',
    name: '环境变量检查',
    description: '验证所有必需的环境变量配置',
    category: 'core',
    status: 'idle',
    critical: true,
  },
  {
    id: 'stripe-sync',
    name: 'Stripe 产品同步',
    description: '同步 Stripe 产品和价格配置',
    category: 'shopify',
    status: 'idle',
    critical: true,
  },
  {
    id: 'build-validation',
    name: '构建验证',
    description: '验证应用构建和类型检查',
    category: 'core',
    status: 'idle',
    critical: true,
  },
  {
    id: 'db-status',
    name: '数据库状态检查',
    description: '检查数据库连接和表结构',
    category: 'core',
    status: 'idle',
    critical: true,
  },
  {
    id: 'shopify-health',
    name: 'Shopify 健康检查',
    description: '验证 Shopify API 连接和配置',
    category: 'shopify',
    status: 'idle',
    critical: true,
  },
  {
    id: 'locales-validation',
    name: '多语言验证',
    description: '检查所有语言文件的完整性',
    category: 'testing',
    status: 'idle',
    critical: false,
  },
  {
    id: 'webhook-logs-test',
    name: 'Webhook 日志测试',
    description: '测试 Webhook 日志记录功能',
    category: 'testing',
    status: 'idle',
    critical: false,
  },
  {
    id: 'meta-pixel-verification',
    name: 'Meta Pixel 验证',
    description: '验证 Meta Pixel 配置和跟踪',
    category: 'setup',
    status: 'idle',
    critical: false,
  },
];

export function ScriptsManagementClient() {
  const [scripts, setScripts] = useState<ScriptInfo[]>(CORE_SCRIPTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [runningScripts, setRunningScripts] = useState<Set<string>>(new Set());

  // 执行脚本
  const executeScript = async (scriptId: string) => {
    setRunningScripts(prev => new Set([...prev, scriptId]));

    setScripts(prev => prev.map(script =>
      script.id === scriptId
        ? { ...script, status: 'running', output: ['启动脚本执行...'] }
        : script,
    ));

    try {
      const response = await fetch('/api/admin/scripts/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId }),
      });

      const result = await response.json();

      setScripts(prev => prev.map(script =>
        script.id === scriptId
          ? {
              ...script,
              status: result.success ? 'success' : 'error',
              lastRun: new Date(),
              duration: result.duration,
              output: result.output || [],
            }
          : script,
      ));
    } catch (error) {
      setScripts(prev => prev.map(script =>
        script.id === scriptId
          ? {
              ...script,
              status: 'error',
              lastRun: new Date(),
              output: [`执行失败: ${error instanceof Error ? error.message : '未知错误'}`],
            }
          : script,
      ));
    } finally {
      setRunningScripts((prev) => {
        const next = new Set(prev);
        next.delete(scriptId);
        return next;
      });
    }
  };

  // 停止脚本执行
  const stopScript = async (scriptId: string) => {
    try {
      await fetch('/api/admin/scripts/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId }),
      });

      setScripts(prev => prev.map(script =>
        script.id === scriptId
          ? { ...script, status: 'idle', output: ['脚本已停止'] }
          : script,
      ));
    } catch (error) {
      console.error('停止脚本失败:', error);
    }
  };

  // 批量执行关键脚本
  const runCriticalScripts = async () => {
    const criticalScripts = scripts.filter(s => s.critical);
    for (const script of criticalScripts) {
      await executeScript(script.id);
      // 等待脚本完成再执行下一个
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // 过滤脚本
  const filteredScripts = scripts.filter(script =>
    selectedCategory === 'all' || script.category === selectedCategory,
  );

  // 获取状态图标
  const getStatusIcon = (status: ScriptInfo['status']) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: ScriptInfo['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* 快速操作区 */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={runCriticalScripts}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={runningScripts.size > 0}
        >
          <Play className="h-4 w-4 mr-2" />
          运行关键脚本
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新状态
        </Button>
      </div>

      {/* 分类过滤 */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">
            全部 (
            {scripts.length}
            )
          </TabsTrigger>
          <TabsTrigger value="core">
            核心 (
            {scripts.filter(s => s.category === 'core').length}
            )
          </TabsTrigger>
          <TabsTrigger value="shopify">
            Shopify (
            {scripts.filter(s => s.category === 'shopify').length}
            )
          </TabsTrigger>
          <TabsTrigger value="testing">
            测试 (
            {scripts.filter(s => s.category === 'testing').length}
            )
          </TabsTrigger>
          <TabsTrigger value="setup">
            设置 (
            {scripts.filter(s => s.category === 'setup').length}
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          {/* 脚本列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredScripts.map(script => (
              <Card key={script.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(script.status)}
                      <CardTitle className="text-lg">{script.name}</CardTitle>
                      {script.critical && (
                        <Badge variant="destructive" className="text-xs">
                          关键
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {script.status === 'running'
                        ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => stopScript(script.id)}
                              disabled={!runningScripts.has(script.id)}
                            >
                              <Square className="h-3 w-3 mr-1" />
                              停止
                            </Button>
                          )
                        : (
                            <Button
                              size="sm"
                              onClick={() => executeScript(script.id)}
                              disabled={runningScripts.size > 0}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              运行
                            </Button>
                          )}
                    </div>
                  </div>
                  <CardDescription>{script.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* 状态指示器 */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(script.status)}`} />
                    <span className="capitalize">{script.status}</span>
                    {script.lastRun && (
                      <span className="text-gray-500 ml-auto">
                        {script.lastRun.toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {/* 执行时间 */}
                  {script.duration && (
                    <div className="text-sm text-gray-600">
                      执行时间:
                      {' '}
                      {script.duration}
                      ms
                    </div>
                  )}

                  {/* 执行输出 */}
                  {script.output && script.output.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Terminal className="h-3 w-3" />
                        输出日志
                      </div>
                      <ScrollArea className="h-24 w-full rounded border">
                        <div className="p-2 space-y-1">
                          {script.output.map((line, index) => (
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
        </TabsContent>
      </Tabs>

      {/* 运行状态提示 */}
      {runningScripts.size > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>脚本正在执行</AlertTitle>
          <AlertDescription>
            {runningScripts.size}
            {' '}
            个脚本正在运行中，请等待完成后再执行其他操作。
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
