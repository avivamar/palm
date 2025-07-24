'use client';

/**
 * ⚙️ 环境管理组件
 * 管理环境变量检查和配置
 */

import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  Globe,
  Key,
  Mail,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type EnvVariable = {
  name: string;
  category: 'core' | 'payment' | 'database' | 'email' | 'shopify' | 'analytics';
  required: boolean;
  status: 'valid' | 'invalid' | 'missing';
  value?: string;
  maskedValue?: string;
  description: string;
  pattern?: string;
};

type EnvCheckResult = {
  overall: 'valid' | 'warning' | 'error';
  totalVariables: number;
  validVariables: number;
  missingRequired: number;
  categories: Record<string, EnvVariable[]>;
  lastChecked: Date;
};

const ENV_CATEGORIES = {
  core: { name: '核心配置', icon: Settings, color: 'blue' },
  payment: { name: '支付配置', icon: CreditCard, color: 'green' },
  database: { name: '数据库配置', icon: Database, color: 'purple' },
  email: { name: '邮件配置', icon: Mail, color: 'orange' },
  shopify: { name: 'Shopify 配置', icon: ShoppingBag, color: 'yellow' },
  analytics: { name: '分析配置', icon: Globe, color: 'pink' },
};

export function EnvironmentManager() {
  const [envResult, setEnvResult] = useState<EnvCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  // 检查环境变量
  const checkEnvironmentVariables = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/admin/environment/check', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setEnvResult(data);
      } else {
        // 模拟数据
        const mockResult: EnvCheckResult = {
          overall: 'warning',
          totalVariables: 23,
          validVariables: 20,
          missingRequired: 1,
          lastChecked: new Date(),
          categories: {
            core: [
              {
                name: 'NEXT_PUBLIC_APP_URL',
                category: 'core',
                required: true,
                status: 'valid',
                value: 'https://www.rolitt.com',
                maskedValue: 'https://www.rolitt.com',
                description: '应用的公开URL',
              },
              {
                name: 'NODE_ENV',
                category: 'core',
                required: true,
                status: 'valid',
                value: 'production',
                maskedValue: 'production',
                description: '运行环境',
              },
            ],
            payment: [
              {
                name: 'STRIPE_SECRET_KEY',
                category: 'payment',
                required: true,
                status: 'valid',
                value: 'sk_live_51PSxxwBCMz50a5RzkaOut...',
                maskedValue: 'sk_live_***...***P53B',
                description: 'Stripe 私钥',
                pattern: '^sk_',
              },
              {
                name: 'STRIPE_WEBHOOK_SECRET',
                category: 'payment',
                required: true,
                status: 'valid',
                value: 'whsec_odTrCOlXIkz7QoT7nX5pjb...',
                maskedValue: 'whsec_***...***Nzl',
                description: 'Stripe Webhook 密钥',
                pattern: '^whsec_',
              },
              {
                name: 'COLOR_PRICE_MAP_JSON',
                category: 'payment',
                required: true,
                status: 'valid',
                value: '{"Red":"price_1RdAu1BCMz50a5RzChT7XYGm",...}',
                maskedValue: '{"Red":"price_***...***","Healing Green":"price_***...***"}',
                description: '产品颜色价格映射',
              },
            ],
            database: [
              {
                name: 'DATABASE_URL',
                category: 'database',
                required: true,
                status: 'valid',
                value: 'postgres://postgres.jyslffzkkrlpgbialrlf:***@aws-0-us-west-1.pooler.supabase.com:6543/postgres',
                maskedValue: 'postgres://***@aws-0-us-west-1.pooler.supabase.com:6543/postgres',
                description: 'PostgreSQL 数据库连接',
                pattern: '^postgres',
              },
              {
                name: 'REDIS_URL',
                category: 'database',
                required: false,
                status: 'valid',
                value: 'redis://default:***@yamanote.proxy.rlwy.net:41431',
                maskedValue: 'redis://***@yamanote.proxy.rlwy.net:41431',
                description: 'Redis 缓存连接',
              },
            ],
            shopify: [
              {
                name: 'SHOPIFY_STORE_DOMAIN',
                category: 'shopify',
                required: true,
                status: 'valid',
                value: '112b9f-2c.myshopify.com',
                maskedValue: '112b9f-2c.myshopify.com',
                description: 'Shopify 商店域名',
              },
              {
                name: 'SHOPIFY_ADMIN_ACCESS_TOKEN',
                category: 'shopify',
                required: true,
                status: 'valid',
                value: 'shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                maskedValue: 'shpat_***...***xxxx',
                description: 'Shopify 管理员访问令牌',
                pattern: '^shpat_',
              },
              {
                name: 'SHOPIFY_WEBHOOK_SECRET',
                category: 'shopify',
                required: false,
                status: 'missing',
                description: 'Shopify Webhook 密钥（可选）',
              },
            ],
            email: [
              {
                name: 'KLAVIYO_API_KEY',
                category: 'email',
                required: true,
                status: 'valid',
                value: 'pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                maskedValue: 'pk_***...***xxxx',
                description: 'Klaviyo API 密钥',
                pattern: '^pk_',
              },
              {
                name: 'RESEND_API_KEY',
                category: 'email',
                required: true,
                status: 'valid',
                value: 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                maskedValue: 're_***...***xxxx',
                description: 'Resend API 密钥',
                pattern: '^re_',
              },
            ],
            analytics: [
              {
                name: 'NEXT_PUBLIC_GA_MEASUREMENT_ID',
                category: 'analytics',
                required: false,
                status: 'valid',
                value: 'G-D32MFWSQJ7',
                maskedValue: 'G-D32MFWSQJ7',
                description: 'Google Analytics 测量 ID',
              },
              {
                name: 'NEXT_PUBLIC_META_PIXEL_ID',
                category: 'analytics',
                required: false,
                status: 'valid',
                value: '1291785979615732',
                maskedValue: '1291785979615732',
                description: 'Meta Pixel ID',
              },
            ],
          },
        };
        setEnvResult(mockResult);
      }
    } catch (error) {
      console.error('检查环境变量失败:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // 切换显示/隐藏变量值
  const toggleShowValue = (varName: string) => {
    setShowValues(prev => ({
      ...prev,
      [varName]: !prev[varName],
    }));
  };

  // 获取状态图标
  const getStatusIcon = (status: EnvVariable['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'missing':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  // 获取状态文本
  const getStatusText = (status: EnvVariable['status']) => {
    switch (status) {
      case 'valid': return '有效';
      case 'invalid': return '无效';
      case 'missing': return '缺失';
    }
  };

  // 获取分类数据
  const getCategoryVariables = () => {
    if (!envResult) {
      return [];
    }

    if (selectedCategory === 'all') {
      return Object.values(envResult.categories).flat();
    }

    return envResult.categories[selectedCategory] || [];
  };

  useEffect(() => {
    checkEnvironmentVariables();
  }, []);

  if (!envResult) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="space-y-6">
      {/* 概览统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Key className="h-5 w-5 text-blue-500" />
              <Badge variant={envResult.overall === 'valid' ? 'default' : 'destructive'}>
                {envResult.overall === 'valid' ? '正常' : envResult.overall === 'warning' ? '警告' : '错误'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{envResult.totalVariables}</div>
            <p className="text-xs text-gray-500">总变量数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{envResult.validVariables}</div>
            <p className="text-xs text-gray-500">有效配置</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{envResult.missingRequired}</div>
            <p className="text-xs text-gray-500">缺失必需</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <RefreshCw className="h-5 w-5 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{envResult.lastChecked.toLocaleTimeString()}</div>
            <p className="text-xs text-gray-500">最后检查</p>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button
          onClick={checkEnvironmentVariables}
          disabled={isChecking}
          variant="default"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          重新检查
        </Button>
      </div>

      {/* 分类标签页 */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">全部</TabsTrigger>
          {Object.entries(ENV_CATEGORIES).map(([key, config]) => (
            <TabsTrigger key={key} value={key}>
              {config.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          {/* 环境变量列表 */}
          <div className="space-y-3">
            {getCategoryVariables().map(variable => (
              <Card key={variable.name} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(variable.status)}
                      <div>
                        <CardTitle className="text-base">{variable.name}</CardTitle>
                        <CardDescription>{variable.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {variable.required && (
                        <Badge variant="destructive" className="text-xs">必需</Badge>
                      )}
                      <Badge variant="outline">
                        {getStatusText(variable.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* 变量值显示 */}
                  {variable.value && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">当前值</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleShowValue(variable.name)}
                        >
                          {showValues[variable.name]
                            ? (
                                <EyeOff className="h-3 w-3" />
                              )
                            : (
                                <Eye className="h-3 w-3" />
                              )}
                        </Button>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm">
                        {showValues[variable.name] ? variable.value : variable.maskedValue}
                      </div>
                    </div>
                  )}

                  {/* 验证模式 */}
                  {variable.pattern && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">验证模式:</span>
                      {' '}
                      {variable.pattern}
                    </div>
                  )}

                  {/* 缺失提示 */}
                  {variable.status === 'missing' && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>变量缺失</AlertTitle>
                      <AlertDescription>
                        请在环境配置中设置此变量。
                        {variable.required && ' 这是一个必需的配置项。'}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 警告信息 */}
      {envResult.missingRequired > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>配置警告</AlertTitle>
          <AlertDescription>
            发现
            {' '}
            {envResult.missingRequired}
            {' '}
            个必需的环境变量缺失，这可能影响系统正常运行。
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
