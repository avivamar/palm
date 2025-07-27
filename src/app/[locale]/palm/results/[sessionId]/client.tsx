"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PalmResultDisplay } from "@/components/palm/PalmResultDisplay";
import { PalmProgressIndicator } from "@/components/palm/PalmProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@rolitt/auth";
import { Lock, CreditCard, User } from "lucide-react";

interface SessionData {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  analysisType: 'quick' | 'complete';
  analysisResult?: any;
  leftHandImageUrl?: string;
  rightHandImageUrl?: string;
  userId?: string;
}

export default function PalmResultsClient() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { user } = useAuth();
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // 获取会话数据
  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/palm/sessions/${sessionId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取会话失败');
      }
      
      setSession(data.session);
      
      // 如果还在处理中，继续轮询
      if (data.session.status === 'pending' || data.session.status === 'processing') {
        setTimeout(fetchSession, 2000); // 每2秒轮询一次
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      toast.error('获取分析结果失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  // 处理升级到完整报告
  const handleUpgrade = async () => {
    if (!user) {
      // 如果未登录，先提示登录
      toast.info('请先登录以升级到完整报告');
      router.push(`/sign-in?redirect=/palm/results/${sessionId}`);
      return;
    }

    setIsUpgrading(true);
    
    try {
      const response = await fetch('/api/palm/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '升级失败');
      }

      // 跳转到支付页面
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('升级失败，请重试');
    } finally {
      setIsUpgrading(false);
    }
  };

  // 处理登录引导
  const handleSignIn = () => {
    router.push(`/sign-in?redirect=/palm/results/${sessionId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载分析结果...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>会话未找到</CardTitle>
            <CardDescription>
              无法找到该分析会话，请重新开始分析。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/palm/analysis')} className="w-full">
              重新开始分析
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 分析进行中
  if (session.status === 'pending' || session.status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">AI 正在分析您的手相</h1>
            <p className="text-xl text-muted-foreground">
              请稍候，我们正在为您生成专业的手相分析报告
            </p>
          </div>

          <PalmProgressIndicator
            sessionId={sessionId}
            analysisType={session.analysisType}
            onComplete={() => fetchSession()}
            onError={(error) => toast.error(error)}
          />

          {/* 分析期间的提示 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>分析进行中...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                我们的AI正在分析您的手掌线条、形状和特征。{session.analysisType === 'quick' ? '快速' : '完整'}分析通常需要 {session.analysisType === 'quick' ? '60秒' : '3-5分钟'}。
              </p>
              
              {/* 如果是未登录用户，显示登录提示 */}
              {!user && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        创建账户保存您的分析结果
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        登录后可以保存分析历史，随时查看您的手相报告。
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSignIn}
                        className="mt-2"
                      >
                        <User className="h-4 w-4 mr-2" />
                        立即登录
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 分析失败
  if (session.status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">分析失败</CardTitle>
            <CardDescription>
              很抱歉，分析过程中出现了错误。请重新尝试。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/palm/analysis')} className="w-full">
              重新开始分析
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 分析完成 - 显示结果
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题部分 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">您的手相分析报告</h1>
          <p className="text-xl text-muted-foreground">
            {session.analysisType === 'quick' ? '快速分析报告' : '完整分析报告'} - 基于AI技术的专业解读
          </p>
        </div>

        {/* 未登录用户提示 */}
        {!user && (
          <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      登录保存您的分析结果
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      创建免费账户，永久保存您的手相分析报告
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignIn}>
                  立即登录
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 分析结果展示 */}
        <PalmResultDisplay
          sessionId={sessionId}
          analysisData={session.analysisResult}
          canUpgrade={session.analysisType === 'quick'}
        />

        {/* 快速分析的升级提示 */}
        {session.analysisType === 'quick' && (
          <Card className="mt-8 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                解锁完整分析报告
              </CardTitle>
              <CardDescription>
                升级到完整报告，获得更深入的分析和个性化建议
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <h4 className="font-medium">完整报告包含：</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✓ 详细的性格特质分析</li>
                    <li>✓ 深入的健康洞察</li>
                    <li>✓ 事业发展建议</li>
                    <li>✓ 感情运势解读</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">额外功能：</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✓ PDF报告下载</li>
                    <li>✓ 终身访问权限</li>
                    <li>✓ 定期更新解读</li>
                    <li>✓ 专业建议指导</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">$19.9</p>
                  <p className="text-sm text-muted-foreground">一次性付费，终身访问</p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isUpgrading ? (
                    <>正在处理...</>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      立即升级
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 其他操作 */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push('/palm/analysis')}>
            再次分析
          </Button>
          {user && (
            <Button variant="outline" onClick={() => router.push('/palm/history')}>
              查看历史
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}