"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  Share2, 
  RefreshCw, 
  Crown, 
  Heart, 
  Brain, 
  Briefcase, 
  Activity,
  DollarSign,
  Star,
  Lock,
  Clock,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface SafePalmResultProps {
  result: any; // 完全宽松的类型，内部安全处理
  analysisType: 'quick' | 'complete';
}

export default function PalmResultDisplaySafe({ result, analysisType }: SafePalmResultProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // 完全安全的数据提取
  const safeGet = (obj: any, path: string, defaultValue: any = '') => {
    try {
      return path.split('.').reduce((current, key) => current && current[key], obj) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // 安全获取数据
  const report = result?.report || {};
  const conversionHints = result?.conversionHints || {};
  const isQuickReport = analysisType === 'quick';

  // 如果没有基本数据，显示加载状态
  if (!result || !report || Object.keys(report).length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">正在加载分析结果...</p>
        </div>
      </div>
    );
  }

  // 格式化处理时间
  const formatProcessingTime = (ms: number) => {
    if (!ms || typeof ms !== 'number') return '未知';
    const seconds = Math.round(ms / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.round(seconds / 60)}m`;
  };

  // 安全获取处理时间
  const processingTime = safeGet(report, 'metadata.processingTime', 0);

  return (
    <div className="space-y-6">
      {/* 报告头部信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI 手相分析报告
                {isQuickReport && <Badge variant="secondary">快速版</Badge>}
              </CardTitle>
              <CardDescription>
                生成时间: {formatProcessingTime(processingTime)} | 
                置信度: {Math.round((safeGet(report, 'confidence', 0.85) * 100))}% | 
                语言: {safeGet(report, 'metadata.language', 'zh').toUpperCase()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {}}>
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
              <Button variant="outline" size="sm" onClick={() => {}}>
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 分析结果内容 */}
      <Tabs defaultValue="personality" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personality">个性</TabsTrigger>
          <TabsTrigger value="health">健康</TabsTrigger>
          <TabsTrigger value="career">事业</TabsTrigger>
          <TabsTrigger value="relationship">感情</TabsTrigger>
          <TabsTrigger value="fortune">财运</TabsTrigger>
        </TabsList>

        {/* 个性分析 */}
        <TabsContent value="personality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                个性特征分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {safeGet(report, 'personality.summary', '您具有独特的个性特征，展现出丰富的内在世界。')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    性格优势
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(safeGet(report, 'personality.strengths', ['坚韧不拔', '富有创造力']) || []).slice(0, 3).map((strength: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    成长方向
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(safeGet(report, 'personality.challenges', ['需要更多自信', '学会放松']) || []).slice(0, 3).map((challenge: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {challenge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 健康分析 */}
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                健康运势分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">整体活力指数</span>
                  <span className="text-sm text-muted-foreground">
                    {safeGet(report, 'health.vitality', 85)}/100
                  </span>
                </div>
                <Progress value={safeGet(report, 'health.vitality', 85)} className="h-2" />
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {safeGet(report, 'health.summary', '整体健康状况良好，建议保持规律的生活作息。')}
              </p>
              
              <div>
                <h4 className="font-medium mb-2">健康建议</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {(safeGet(report, 'health.recommendations', ['保持运动', '均衡饮食']) || []).map((rec: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 事业分析 */}
        <TabsContent value="career">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                事业发展分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {safeGet(report, 'career.summary', '您具有出色的职业发展潜力，适合从事需要创新思维的工作。')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">职业天赋</h4>
                  <div className="flex flex-wrap gap-2">
                    {(safeGet(report, 'career.aptitudes', ['领导能力', '创新思维']) || []).map((apt: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {apt}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">发展机遇</h4>
                  <div className="flex flex-wrap gap-2">
                    {(safeGet(report, 'career.opportunities', ['管理职位', '创业机会']) || []).map((opp: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {opp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 感情分析 */}
        <TabsContent value="relationship">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                感情生活分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {safeGet(report, 'relationship.summary', '您在感情方面表现出真诚和深情，重视长期稳定的关系。')}
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">理想伴侣类型</h4>
                  <div className="flex flex-wrap gap-2">
                    {(safeGet(report, 'relationship.compatibility', ['理解型伴侣', '共同成长']) || []).map((comp: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">沟通方式</h4>
                  <div className="flex flex-wrap gap-2">
                    {(safeGet(report, 'relationship.communication', ['直接表达', '倾听理解']) || []).map((comm: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {comm}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 财运分析 */}
        <TabsContent value="fortune">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                财运分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {safeGet(report, 'fortune.summary', '您的财运呈现稳步上升的趋势，适合稳健的投资策略。')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">财富来源</h4>
                  <div className="flex flex-wrap gap-2">
                    {(safeGet(report, 'fortune.financial', ['稳定收入', '投资机会']) || []).map((fin: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {fin}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">最佳时机</h4>
                  <div className="flex flex-wrap gap-2">
                    {(safeGet(report, 'fortune.timing', ['春季有利', '秋季收获']) || []).map((time: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 升级提示 (快速版) */}
      {isQuickReport && (
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              升级到完整版分析
            </CardTitle>
            <CardDescription>
              解锁更深入的分析内容和个性化建议
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">¥29.9</p>
                <p className="text-sm text-muted-foreground">一次性付费，终身保存</p>
              </div>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Crown className="h-4 w-4 mr-2" />
                立即升级
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}