'use client';

/**
 * 🚀 部署工具组件
 * 管理构建、部署相关的工具和脚本
 */

import {
  AlertTriangle,
  Building,
  CheckCircle,
  Clock,
  GitBranch,
  Play,
  RefreshCw,
  Rocket,
  Square,
  Terminal,
  TestTube,
  XCircle,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

type DeploymentTask = {
  id: string;
  name: string;
  description: string;
  type: 'validation' | 'build' | 'test' | 'deploy';
  status: 'idle' | 'running' | 'success' | 'error';
  duration?: number;
  output?: string[];
  progress?: number;
  critical: boolean;
};

type DeploymentStatus = {
  environment: 'development' | 'staging' | 'production';
  lastDeploy?: Date;
  version?: string;
  health: 'healthy' | 'warning' | 'error';
  uptime?: string;
};

const DEPLOYMENT_TASKS: DeploymentTask[] = [
  {
    id: 'pre-push-validation',
    name: '预推送验证',
    description: '运行完整的预推送验证流程',
    type: 'validation',
    status: 'idle',
    critical: true,
  },
  {
    id: 'type-check',
    name: 'TypeScript 类型检查',
    description: '验证 TypeScript 类型定义',
    type: 'validation',
    status: 'idle',
    critical: true,
  },
  {
    id: 'lint-check',
    name: 'ESLint 代码检查',
    description: '运行 ESLint 代码质量检查',
    type: 'validation',
    status: 'idle',
    critical: true,
  },
  {
    id: 'unit-tests',
    name: '单元测试',
    description: '运行所有单元测试',
    type: 'test',
    status: 'idle',
    critical: true,
  },
  {
    id: 'integration-tests',
    name: '集成测试',
    description: '运行集成测试套件',
    type: 'test',
    status: 'idle',
    critical: false,
  },
  {
    id: 'build-next',
    name: 'Next.js 构建',
    description: '构建 Next.js 应用',
    type: 'build',
    status: 'idle',
    critical: true,
  },
  {
    id: 'build-workers',
    name: 'Cloudflare Workers 构建',
    description: '构建 Cloudflare Workers',
    type: 'build',
    status: 'idle',
    critical: false,
  },
  {
    id: 'deploy-vercel',
    name: 'Vercel 部署',
    description: '部署到 Vercel 平台',
    type: 'deploy',
    status: 'idle',
    critical: false,
  },
];

const DEPLOYMENT_ENVIRONMENTS: DeploymentStatus[] = [
  {
    environment: 'development',
    health: 'healthy',
    uptime: '99.9%',
  },
  {
    environment: 'staging',
    lastDeploy: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
    version: 'v1.2.3-staging',
    health: 'healthy',
    uptime: '99.5%',
  },
  {
    environment: 'production',
    lastDeploy: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
    version: 'v1.2.2',
    health: 'healthy',
    uptime: '99.8%',
  },
];

export function DeploymentTools() {
  const [tasks, setTasks] = useState<DeploymentTask[]>(DEPLOYMENT_TASKS);
  const [environments] = useState<DeploymentStatus[]>(DEPLOYMENT_ENVIRONMENTS);
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set());
  const [currentPipeline, setCurrentPipeline] = useState<string | null>(null);

  // 执行任务
  const executeTask = async (taskId: string) => {
    setRunningTasks(prev => new Set([...prev, taskId]));

    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: 'running', progress: 0, output: ['开始执行...'] }
        : task,
    ));

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setTasks(prev => prev.map(task =>
          task.id === taskId && task.status === 'running'
            ? { ...task, progress: Math.min((task.progress || 0) + 15, 90) }
            : task,
        ));
      }, 800);

      // 模拟执行时间
      const executionTime = Math.random() * 3000 + 2000; // 2-5秒
      await new Promise(resolve => setTimeout(resolve, executionTime));

      clearInterval(progressInterval);

      // 模拟结果
      const success = Math.random() > 0.15; // 85% 成功率
      const mockOutput = success
        ? [
            '正在初始化...',
            '检查依赖项...',
            '执行主要任务...',
            '验证结果...',
            '任务完成！',
          ]
        : [
            '正在初始化...',
            '检查依赖项...',
            '错误: 发现问题',
            '任务失败',
          ];

      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: success ? 'success' : 'error',
              progress: 100,
              output: mockOutput,
              duration: Math.round(executionTime),
            }
          : task,
      ));
    } catch (error) {
      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: 'error',
              progress: 0,
              output: [`执行失败: ${error instanceof Error ? error.message : '未知错误'}`],
            }
          : task,
      ));
    } finally {
      setRunningTasks((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  // 运行完整部署流水线
  const runDeploymentPipeline = async () => {
    setCurrentPipeline('full');
    const pipelineTasks = ['pre-push-validation', 'type-check', 'lint-check', 'unit-tests', 'build-next'];

    for (const taskId of pipelineTasks) {
      await executeTask(taskId);
      // 等待任务完成
      await new Promise((resolve) => {
        const checkStatus = () => {
          const task = tasks.find(t => t.id === taskId);
          if (task && (task.status === 'success' || task.status === 'error')) {
            resolve(undefined);
          } else {
            setTimeout(checkStatus, 500);
          }
        };
        checkStatus();
      });

      // 如果任务失败，停止流水线
      const task = tasks.find(t => t.id === taskId);
      if (task?.status === 'error') {
        break;
      }
    }

    setCurrentPipeline(null);
  };

  // 快速验证
  const runQuickValidation = async () => {
    setCurrentPipeline('validation');
    const validationTasks = ['type-check', 'lint-check'];

    for (const taskId of validationTasks) {
      await executeTask(taskId);
    }

    setCurrentPipeline(null);
  };

  // 获取状态图标
  const getStatusIcon = (status: DeploymentTask['status']) => {
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

  // 获取任务类型图标
  const getTypeIcon = (type: DeploymentTask['type']) => {
    switch (type) {
      case 'validation':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'build':
        return <Building className="h-4 w-4 text-orange-500" />;
      case 'test':
        return <TestTube className="h-4 w-4 text-purple-500" />;
      case 'deploy':
        return <Rocket className="h-4 w-4 text-green-500" />;
    }
  };

  // 获取环境健康图标
  const getHealthIcon = (health: DeploymentStatus['health']) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 环境状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {environments.map(env => (
          <Card key={env.environment}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">{env.environment}</CardTitle>
                {getHealthIcon(env.health)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {env.version && (
                <div className="flex justify-between text-sm">
                  <span>版本</span>
                  <Badge variant="outline">{env.version}</Badge>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>正常运行时间</span>
                <span className="text-green-600">{env.uptime}</span>
              </div>
              {env.lastDeploy && (
                <div className="flex justify-between text-sm">
                  <span>最后部署</span>
                  <span className="text-gray-500">
                    {env.lastDeploy.toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快速操作 */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={runDeploymentPipeline}
          disabled={runningTasks.size > 0 || currentPipeline !== null}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Rocket className="h-4 w-4 mr-2" />
          完整部署流水线
        </Button>
        <Button
          variant="outline"
          onClick={runQuickValidation}
          disabled={runningTasks.size > 0 || currentPipeline !== null}
        >
          <Zap className="h-4 w-4 mr-2" />
          快速验证
        </Button>
      </div>

      {/* 流水线状态 */}
      {currentPipeline && (
        <Alert>
          <GitBranch className="h-4 w-4" />
          <AlertTitle>流水线运行中</AlertTitle>
          <AlertDescription>
            {currentPipeline === 'full' ? '完整部署流水线' : '快速验证'}
            {' '}
            正在执行中...
          </AlertDescription>
        </Alert>
      )}

      {/* 任务列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tasks.map(task => (
          <Card key={task.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(task.type)}
                  <div>
                    <CardTitle className="text-base">{task.name}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.critical && (
                    <Badge variant="destructive" className="text-xs">关键</Badge>
                  )}
                  {getStatusIcon(task.status)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* 进度条 */}
              {task.status === 'running' && task.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>执行进度</span>
                    <span>
                      {task.progress}
                      %
                    </span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              )}

              {/* 执行时间 */}
              {task.duration && (
                <div className="flex justify-between text-sm">
                  <span>执行时间</span>
                  <span>
                    {task.duration}
                    ms
                  </span>
                </div>
              )}

              {/* 执行输出 */}
              {task.output && task.output.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Terminal className="h-3 w-3" />
                    执行日志
                  </div>
                  <ScrollArea className="h-20 w-full rounded border">
                    <div className="p-2 space-y-1">
                      {task.output.map((line, index) => (
                        <div key={index} className="text-xs font-mono text-gray-700 dark:text-gray-300">
                          {line}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2 pt-2">
                {task.status === 'running'
                  ? (
                      <Button size="sm" variant="outline" disabled>
                        <Square className="h-3 w-3 mr-1" />
                        运行中
                      </Button>
                    )
                  : (
                      <Button
                        size="sm"
                        onClick={() => executeTask(task.id)}
                        disabled={runningTasks.size > 0 || currentPipeline !== null}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        执行
                      </Button>
                    )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 运行状态提示 */}
      {runningTasks.size > 0 && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertTitle>任务执行中</AlertTitle>
          <AlertDescription>
            {runningTasks.size}
            {' '}
            个任务正在运行中，请等待完成。
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
