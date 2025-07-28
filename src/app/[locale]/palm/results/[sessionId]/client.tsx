"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import PalmResultDisplayDetailed from "@/components/palm/PalmResultDisplayDetailed";
import { PalmProgressIndicator } from "@/components/palm/PalmProgressIndicator";
import LottieAnimation from "@/components/ui/LottieAnimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
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
  const locale = params.locale as string;
  const { user } = useAuth();
  const t = useTranslations('palm');
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // 获取会话数据
  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/palm/sessions/${sessionId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('results.errors.loadFailed'));
      }
      
      setSession(data.session);
      
      // 如果还在处理中，继续轮询
      if (data.session.status === 'pending' || data.session.status === 'processing') {
        setTimeout(fetchSession, 2000); // 每2秒轮询一次
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      toast.error(t('results.errors.loadFailed'));
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
      toast.info(t('results.auth.loginBenefit'));
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
        throw new Error(data.error || t('common.uploadFailed'));
      }

      // 跳转到支付页面
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error(t('common.uploadFailed'));
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
          <div className="w-24 h-24 mx-auto mb-4">
            <LottieAnimation
              src="/logoloading.lottie"
              fallbackVideoSrc="/logoloading.webm"
              loop={true}
              autoplay={true}
              className="w-full h-full"
            />
          </div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t('results.errors.notFound')}</CardTitle>
            <CardDescription>
              {t('results.errors.notFoundDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/${locale}/palm/analysis`)} className="w-full">
              {t('common.restartAnalysis')}
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
            <h1 className="text-4xl font-bold mb-4">{t('results.processing.title')}</h1>
            <p className="text-xl text-muted-foreground">
              {t('results.processing.subtitle')}
            </p>
          </div>

          <PalmProgressIndicator
            session={{ ...session, sessionId }}
          />

          {/* 分析期间的提示 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t('results.processing.analyzing')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('results.processing.description', {
                  type: session.analysisType === 'quick' ? t('results.processing.quick') : t('results.processing.complete'),
                  time: session.analysisType === 'quick' ? t('results.processing.quickTime') : t('results.processing.completeTime')
                })}
              </p>
              
              {/* 如果是未登录用户，显示登录提示 */}
              {!user && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {t('results.auth.createAccount')}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {t('results.auth.loginBenefit')}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSignIn}
                        className="mt-2"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {t('results.auth.loginButton')}
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
            <CardTitle className="text-destructive">{t('results.errors.failed')}</CardTitle>
            <CardDescription>
              {t('results.errors.failedDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/${locale}/palm/analysis`)} className="w-full">
              {t('common.restartAnalysis')}
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
          <h1 className="text-4xl font-bold mb-4">{t('results.title')}</h1>
          <p className="text-xl text-muted-foreground">
            {session.analysisType === 'quick' ? t('results.subtitle.quick') : t('results.subtitle.complete')}
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
                      {t('results.auth.saveResults')}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {t('results.auth.saveDescription')}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignIn}>
                  {t('results.auth.loginButton')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 分析结果展示 */}
        <PalmResultDisplayDetailed
          result={session.analysisResult}
          analysisType={session.analysisType}
        />

        {/* 快速分析的升级提示 */}
        {session.analysisType === 'quick' && (
          <Card className="mt-8 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t('results.upgrade.title')}
              </CardTitle>
              <CardDescription>
                {t('results.upgrade.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <h4 className="font-medium">{t('results.upgrade.features.title')}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✓ {t('results.upgrade.features.personality')}</li>
                    <li>✓ {t('results.upgrade.features.health')}</li>
                    <li>✓ {t('results.upgrade.features.career')}</li>
                    <li>✓ {t('results.upgrade.features.love')}</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">{t('results.upgrade.extras.title')}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✓ {t('results.upgrade.extras.pdf')}</li>
                    <li>✓ {t('results.upgrade.extras.lifetime')}</li>
                    <li>✓ {t('results.upgrade.extras.updates')}</li>
                    <li>✓ {t('results.upgrade.extras.guidance')}</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{t('results.upgrade.price')}</p>
                  <p className="text-sm text-muted-foreground">{t('results.upgrade.priceDescription')}</p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isUpgrading ? (
                    <>{t('results.upgrade.processing')}</>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {t('results.upgrade.upgradeButton')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 其他操作 */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push(`/${locale}/palm/analysis`)}>
            {t('results.actions.analyzeAgain')}
          </Button>
          {user && (
            <Button variant="outline" onClick={() => router.push(`/${locale}/palm/history`)}>
              {t('results.actions.viewHistory')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}