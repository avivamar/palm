'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Progress } from '@/components/ui';
import { 
  BarChart, 
  Bar, 
  Line, 
  LineChart,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from '../../../lib/recharts-compat';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Brain,
  Sparkles,
  Cpu,
  Cloud,
  AlertCircle
} from 'lucide-react';
import type { AIProvider } from '../types';

// 模拟数据
const mockUsageData = [
  { date: '2024-01-01', openai: 1200, claude: 800, gemini: 400, azure: 200 },
  { date: '2024-01-02', openai: 1400, claude: 900, gemini: 500, azure: 300 },
  { date: '2024-01-03', openai: 1100, claude: 1000, gemini: 600, azure: 250 },
  { date: '2024-01-04', openai: 1500, claude: 1100, gemini: 700, azure: 400 },
  { date: '2024-01-05', openai: 1300, claude: 950, gemini: 550, azure: 350 },
  { date: '2024-01-06', openai: 1600, claude: 1200, gemini: 800, azure: 450 },
  { date: '2024-01-07', openai: 1450, claude: 1050, gemini: 650, azure: 380 },
];

const mockCostData = [
  { date: '2024-01-01', cost: 120.50 },
  { date: '2024-01-02', cost: 145.20 },
  { date: '2024-01-03', cost: 115.80 },
  { date: '2024-01-04', cost: 165.90 },
  { date: '2024-01-05', cost: 135.40 },
  { date: '2024-01-06', cost: 178.60 },
  { date: '2024-01-07', cost: 152.30 },
];

const mockModelUsage = [
  { name: 'GPT-4', value: 35, color: '#0ea5e9' },
  { name: 'Claude 3', value: 30, color: '#8b5cf6' },
  { name: 'GPT-3.5', value: 20, color: '#06b6d4' },
  { name: 'Gemini Pro', value: 10, color: '#10b981' },
  { name: 'Others', value: 5, color: '#6b7280' },
];

const mockPerformanceData = [
  { hour: '00:00', avgResponseTime: 1.2, requests: 45 },
  { hour: '04:00', avgResponseTime: 0.9, requests: 23 },
  { hour: '08:00', avgResponseTime: 1.5, requests: 156 },
  { hour: '12:00', avgResponseTime: 2.1, requests: 234 },
  { hour: '16:00', avgResponseTime: 1.8, requests: 189 },
  { hour: '20:00', avgResponseTime: 1.3, requests: 167 },
];

const providerColors: Record<AIProvider, string> = {
  openai: '#0ea5e9',
  claude: '#8b5cf6',
  gemini: '#10b981',
  azure: '#f59e0b'
};

export function AIMonitoring() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'all'>('all');

  const totalRequests = 12543;
  const totalCost = 845.20;
  const avgResponseTime = 1.45;
  const errorRate = 0.23;

  const costTrend = 12.5; // positive means increase
  const requestTrend = 20.1;
  const performanceTrend = -5.2; // negative is good for response time

  return (
    <div className="space-y-6">
      {/* 时间范围和过滤器 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as AIProvider | 'all')}>
            <SelectTrigger className="w-[150px]">
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
        <Button variant="outline">
          Export Report
        </Button>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Requests
              {requestTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={requestTrend > 0 ? 'text-green-500' : 'text-red-500'}>
                {requestTrend > 0 ? '+' : ''}{requestTrend}%
              </span>
              {' '}from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Cost
              {costTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={costTrend > 0 ? 'text-red-500' : 'text-green-500'}>
                {costTrend > 0 ? '+' : ''}{costTrend}%
              </span>
              {' '}from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Avg Response Time
              {performanceTrend < 0 ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={performanceTrend < 0 ? 'text-green-500' : 'text-red-500'}>
                {performanceTrend > 0 ? '+' : ''}{performanceTrend}%
              </span>
              {' '}from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Error Rate
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorRate}%</div>
            <Progress value={errorRate * 10} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* 使用趋势图表 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Volume by Provider</CardTitle>
            <CardDescription>Daily request count for each AI provider</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedProvider === 'all' ? (
                  <>
                    <Area 
                      type="monotone" 
                      dataKey="openai" 
                      stackId="1"
                      stroke={providerColors.openai}
                      fill={providerColors.openai}
                      fillOpacity={0.6}
                      name="OpenAI"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="claude" 
                      stackId="1"
                      stroke={providerColors.claude}
                      fill={providerColors.claude}
                      fillOpacity={0.6}
                      name="Claude"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="gemini" 
                      stackId="1"
                      stroke={providerColors.gemini}
                      fill={providerColors.gemini}
                      fillOpacity={0.6}
                      name="Gemini"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="azure" 
                      stackId="1"
                      stroke={providerColors.azure}
                      fill={providerColors.azure}
                      fillOpacity={0.6}
                      name="Azure"
                    />
                  </>
                ) : (
                  <Area 
                    type="monotone" 
                    dataKey={selectedProvider} 
                    stroke={providerColors[selectedProvider as AIProvider]}
                    fill={providerColors[selectedProvider as AIProvider]}
                    fillOpacity={0.6}
                    name={selectedProvider}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>Daily AI service costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value}`} />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 模型使用分布和性能指标 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Model Usage Distribution</CardTitle>
            <CardDescription>Percentage of requests by model</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockModelUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: any; percent: any }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockModelUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Response time and request volume by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="requests" 
                  fill="#0ea5e9" 
                  name="Requests"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avgResponseTime" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b' }}
                  name="Avg Response (s)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 提供商状态 */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Status</CardTitle>
          <CardDescription>Current status and health of AI providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(['openai', 'claude', 'gemini', 'azure'] as AIProvider[]).map(provider => (
              <div key={provider} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full bg-green-500`} />
                  <div className="flex items-center gap-2">
                    {provider === 'openai' && <Brain className="h-5 w-5" />}
                    {provider === 'claude' && <Sparkles className="h-5 w-5" />}
                    {provider === 'gemini' && <Cpu className="h-5 w-5" />}
                    {provider === 'azure' && <Cloud className="h-5 w-5" />}
                    <span className="font-medium capitalize">{provider}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <div className="text-muted-foreground">Uptime</div>
                    <div className="font-medium">99.9%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground">Avg Response</div>
                    <div className="font-medium">1.2s</div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground">Rate Limit</div>
                    <div className="font-medium">45/60 rpm</div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    <Activity className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}