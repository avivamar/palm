"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Share2, 
  Crown, 
  Heart, 
  Brain, 
  Briefcase, 
  DollarSign,
  Star,
  Lock,
  TrendingUp,
  User,
  Target,
  Shield,
  Lightbulb,
  Calendar,
  Gem
} from "lucide-react";
import { toast } from "sonner";
import LottieAnimation from "@/components/ui/LottieAnimation";

interface DetailedPalmResultProps {
  result: any;
  analysisType: 'quick' | 'complete';
}

export default function PalmResultDisplayDetailed({ result, analysisType }: DetailedPalmResultProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const t = useTranslations('palm.results');

  // 安全的数据提取函数
  const safeGet = (obj: any, path: string, defaultValue: any = '') => {
    try {
      return path.split('.').reduce((current, key) => current && current[key], obj) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // 获取报告数据
  const report = result?.report || {};
  const isQuickReport = analysisType === 'quick';

  // 处理分享
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: t('share.title'),
          text: t('share.text'),
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t('share.copied'));
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error(t('share.failed'));
    } finally {
      setIsSharing(false);
    }
  };

  // 处理下载
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    
    try {
      // 这里可以实现 PDF 生成逻辑
      toast.success(t('download.comingSoon'));
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(t('download.failed'));
    } finally {
      setIsDownloading(false);
    }
  };

  if (!report || Object.keys(report).length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <LottieAnimation
              src="/logoloading.lottie"
              fallbackVideoSrc="/logoloading.webm"
              loop={true}
              autoplay={true}
              className="w-full h-full"
            />
          </div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 palm-results-container">
      {/* 分析概览卡片 - 突出显示 */}
      <Card className="border-2 border-primary/30 shadow-lg bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="text-center pb-8">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t('title')}
          </CardTitle>
          <div className="space-y-2">
            <CardDescription className="text-lg">
              {isQuickReport ? t('subtitle.quick') : t('subtitle.complete')}
            </CardDescription>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {t('confidence')}: {Math.round((safeGet(report, 'analysis_metadata.confidence_level', 0.85) * 100))}%
              </span>
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={handleShare} disabled={isSharing} variant="outline" size="sm" className="hover:scale-105 transition-transform">
              <Share2 className="h-4 w-4 mr-2" />
              {isSharing ? t('actions.sharing') : t('actions.share')}
            </Button>
            <Button onClick={handleDownload} disabled={isDownloading} variant="outline" size="sm" className="hover:scale-105 transition-transform">
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? t('actions.downloading') : t('actions.downloadPDF')}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 主要分析内容区域 */}
      <div className="grid gap-8">
        {/* 性格分析 */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              {t('sections.personality.title')}
            </CardTitle>
            <CardDescription className="text-base mt-2">{t('sections.personality.description')}</CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">{t('sections.personality.coreTraits')}</h4>
            <div className="flex flex-wrap gap-2">
              {safeGet(report, 'personality_analysis.core_traits', []).slice(0, isQuickReport ? 2 : 5).map((trait: string, index: number) => (
                <Badge key={index} variant="secondary">{trait}</Badge>
              ))}
              {isQuickReport && safeGet(report, 'personality_analysis.core_traits', []).length > 2 && (
                <Badge variant="outline" className="border-dashed border-amber-400 text-amber-600">
                  +{safeGet(report, 'personality_analysis.core_traits', []).length - 2} {t('sections.personality.moreTraits')} 🔒
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">{t('sections.personality.behaviorPatterns')}</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {safeGet(report, 'personality_analysis.behavioral_patterns', []).slice(0, isQuickReport ? 1 : 5).map((pattern: string, index: number) => (
                <li key={index}>{pattern}</li>
              ))}
              {isQuickReport && (
                <li className="text-amber-600 font-medium">
                  <Lock className="h-3 w-3 inline mr-1" />
                  {t('sections.personality.moreBehaviors', { count: Math.max(0, safeGet(report, 'personality_analysis.behavioral_patterns', []).length - 1) })}
                </li>
              )}
            </ul>
          </div>

          {!isQuickReport && (
            <div>
              <h4 className="font-medium mb-2">{t('sections.personality.communicationStyle')}</h4>
              <p className="text-sm text-muted-foreground">
                {safeGet(report, 'personality_analysis.communication_style', t('common.noData'))}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 text-green-600">{t('sections.personality.strengths')}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {safeGet(report, 'personality_analysis.strengths', []).slice(0, isQuickReport ? 2 : 5).map((strength: string, index: number) => (
                  <li key={index} className="text-green-700">{strength}</li>
                ))}
                {isQuickReport && safeGet(report, 'personality_analysis.strengths', []).length > 2 && (
                  <li className="text-amber-600 font-medium text-xs">
                    <Lock className="h-3 w-3 inline mr-1" />
                    {t('sections.personality.unlockStrengths', { count: safeGet(report, 'personality_analysis.strengths', []).length })}
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-orange-600">{t('sections.personality.growthAreas')}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {safeGet(report, 'personality_analysis.development_areas', []).slice(0, isQuickReport ? 1 : 5).map((area: string, index: number) => (
                  <li key={index} className="text-orange-700">{area}</li>
                ))}
                {isQuickReport && (
                  <li className="text-amber-600 font-medium text-xs">
                    <Crown className="h-3 w-3 inline mr-1" />
                    {t('sections.personality.upgradeProfessionalAdvice')}
                  </li>
                )}
              </ul>
            </div>
          </div>

          {isQuickReport && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">{t('sections.personality.aiInsights')}</span>
                <Lock className="h-3 w-3 text-amber-500" />
              </div>
              <p className="text-sm text-blue-700 leading-relaxed">
                {t('sections.personality.aiInsightsDescription')}
              </p>
              <div className="mt-2 text-xs text-blue-600 bg-white/50 px-2 py-1 rounded inline-block">
                {t('sections.personality.fullVersionFeatures')}
              </div>
            </div>
          )}
          </CardContent>
        </Card>

        {/* 人生路径分析 */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              {t('sections.lifePath.title')}
            </CardTitle>
            <CardDescription className="text-base mt-2">{t('sections.lifePath.description')}</CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">{t('sections.lifePath.purpose')}</h4>
            <p className="text-sm bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg">
              {safeGet(report, 'life_path_analysis.life_purpose', t('common.noData'))}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-3">{t('sections.lifePath.majorPhases')}</h4>
            <div className="space-y-3">
              {safeGet(report, 'life_path_analysis.major_life_phases', []).map((phase: any, index: number) => (
                <div key={index} className="border-l-4 border-purple-400 pl-4">
                  <h5 className="font-medium text-purple-700">{phase.period}</h5>
                  <p className="text-sm text-muted-foreground mb-1">{phase.focus}</p>
                  <div className="text-xs text-muted-foreground">
                    <span className="inline-block mr-4">{t('sections.lifePath.challenges')}: {phase.challenges}</span>
                    <span>{t('sections.lifePath.opportunities')}: {phase.opportunities}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">{t('sections.lifePath.lessons')}</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {safeGet(report, 'life_path_analysis.life_lessons', []).map((lesson: string, index: number) => (
                <li key={index}>{lesson}</li>
              ))}
            </ul>
          </div>
          </CardContent>
        </Card>

        {/* 事业财运 */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              {t('sections.career.title')}
            </CardTitle>
            <CardDescription className="text-base mt-2">{t('sections.career.description')}</CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">{t('sections.career.aptitudes')}</h4>
            <div className="flex flex-wrap gap-2">
              {safeGet(report, 'career_fortune.career_aptitude', []).slice(0, isQuickReport ? 2 : 6).map((aptitude: string, index: number) => (
                <Badge key={index} variant="outline" className="border-green-500 text-green-700">{aptitude}</Badge>
              ))}
              {isQuickReport && safeGet(report, 'career_fortune.career_aptitude', []).length > 2 && (
                <Badge variant="outline" className="border-dashed border-amber-400 text-amber-600">
                  <Lock className="h-3 w-3 mr-1" />
                  +{safeGet(report, 'career_fortune.career_aptitude', []).length - 2} {t('sections.career.moreFields')}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">{t('sections.career.leadership')}</h4>
              {isQuickReport ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-2">🌟 {t('sections.career.leadershipPreview')}</p>
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <Crown className="h-3 w-3" />
                    {t('sections.career.leadershipUpgrade')}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {safeGet(report, 'career_fortune.leadership_potential', t('common.noData'))}
                </p>
              )}
            </div>
            <div>
              <h4 className="font-medium mb-2">{t('sections.career.entrepreneurship')}</h4>
              {isQuickReport ? (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-2">💼 {t('sections.career.entrepreneurshipPreview')}</p>
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <Lock className="h-3 w-3" />
                    {t('sections.career.entrepreneurshipUpgrade')}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {safeGet(report, 'career_fortune.entrepreneurship', t('common.noData'))}
                </p>
              )}
            </div>
          </div>

          {isQuickReport ? (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">{t('sections.career.wealthPreview')}</span>
                <Lock className="h-3 w-3 text-amber-500" />
              </div>
              <p className="text-sm text-yellow-700 leading-relaxed mb-2">
                {t('sections.career.wealthDescription')}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/50 px-2 py-1 rounded">💰 最佳投资时机</div>
                <div className="bg-white/50 px-2 py-1 rounded">🚀 收入爆发期预测</div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-medium mb-2">财富积累模式</h4>
              <p className="text-sm bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                {safeGet(report, 'career_fortune.wealth_accumulation', '暂无数据')}
              </p>
            </div>
          )}

          {/* 事业时间线 - 仅完整版显示 */}
          {!isQuickReport && safeGet(report, 'career_fortune.career_timeline', []).length > 0 && (
            <div>
              <h4 className="font-medium mb-3">事业发展时间线</h4>
              <div className="space-y-3">
                {report.career_fortune.career_timeline.map((timeline: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-1 text-green-600" />
                    <div>
                      <h5 className="font-medium text-green-700">{timeline.period}</h5>
                      <p className="text-sm text-muted-foreground">{timeline.forecast}</p>
                      <p className="text-xs text-green-600 mt-1">建议: {timeline.advice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </CardContent>
        </Card>

        {/* 感情关系 */}
        <Card className="border-l-4 border-l-pink-500 hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-pink-50/50 to-transparent dark:from-pink-950/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              {t('sections.relationship.title')}
            </CardTitle>
            <CardDescription className="text-base mt-2">{t('sections.relationship.description')}</CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">{t('sections.relationship.idealPartner')}</h4>
            <div className="flex flex-wrap gap-2">
              {safeGet(report, 'relationship_insights.love_compatibility.ideal_partner_traits', []).map((trait: string, index: number) => (
                <Badge key={index} variant="outline" className="border-pink-500 text-pink-700">{trait}</Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">{t('sections.relationship.loveExpression')}</h4>
              <p className="text-sm text-muted-foreground">
                {safeGet(report, 'relationship_insights.love_compatibility.love_expression', t('common.noData'))}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t('sections.relationship.commitment')}</h4>
              <p className="text-sm text-muted-foreground">
                {safeGet(report, 'relationship_insights.love_compatibility.commitment_style', t('common.noData'))}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">{t('sections.relationship.challenges')}</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {safeGet(report, 'relationship_insights.love_compatibility.relationship_challenges', []).map((challenge: string, index: number) => (
                <li key={index}>{challenge}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 健康养生 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            健康养生指导
          </CardTitle>
          <CardDescription>了解您的体质特点和养生建议</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">体质类型</h4>
            <p className="text-sm bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
              {safeGet(report, 'health_wellness.constitutional_type', '暂无数据')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 text-green-600">健康优势</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {safeGet(report, 'health_wellness.health_strengths', []).map((strength: string, index: number) => (
                  <li key={index} className="text-green-700">{strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-orange-600">需要关注</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {safeGet(report, 'health_wellness.health_vulnerabilities', []).map((vulnerability: string, index: number) => (
                  <li key={index} className="text-orange-700">{vulnerability}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 生活方式建议 */}
          {safeGet(report, 'health_wellness.lifestyle_recommendations', null) && (
            <div>
              <h4 className="font-medium mb-3">生活方式建议</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>饮食:</strong> {report.health_wellness.lifestyle_recommendations.diet}
                </div>
                <div>
                  <strong>运动:</strong> {report.health_wellness.lifestyle_recommendations.exercise}
                </div>
                <div>
                  <strong>压力管理:</strong> {report.health_wellness.lifestyle_recommendations.stress_management}
                </div>
                <div>
                  <strong>作息:</strong> {report.health_wellness.lifestyle_recommendations.sleep_patterns}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 精神成长 */}
      {safeGet(report, 'spiritual_growth', null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              精神成长指引
            </CardTitle>
            <CardDescription>探索您的内在智慧和精神发展方向</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">内在智慧</h4>
              <p className="text-sm text-muted-foreground">
                {safeGet(report, 'spiritual_growth.inner_wisdom', '暂无数据')}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">精神成长路径</h4>
              <p className="text-sm text-muted-foreground">
                {safeGet(report, 'spiritual_growth.spiritual_path', '暂无数据')}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">直觉能力</h4>
              <p className="text-sm text-muted-foreground">
                {safeGet(report, 'spiritual_growth.intuitive_abilities', '暂无数据')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 实用指导 */}
      {safeGet(report, 'practical_guidance', null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              实用行动指南
            </CardTitle>
            <CardDescription>立即可行的改善建议和长期规划</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">立即行动建议</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {safeGet(report, 'practical_guidance.immediate_actions', []).map((action: string, index: number) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 幸运元素 */}
      {safeGet(report, 'lucky_elements', null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gem className="h-5 w-5 text-violet-600" />
              幸运元素指南
            </CardTitle>
            <CardDescription>有助于提升运势的颜色、数字和方位</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">幸运色彩</h4>
                <div className="flex flex-wrap gap-1">
                  {safeGet(report, 'lucky_elements.favorable_colors', []).map((color: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">{color}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">幸运数字</h4>
                <div className="flex flex-wrap gap-1">
                  {safeGet(report, 'lucky_elements.lucky_numbers', []).map((number: number, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">{number}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">吉利方位</h4>
                <div className="flex flex-wrap gap-1">
                  {safeGet(report, 'lucky_elements.auspicious_directions', []).map((direction: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">{direction}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">适合宝石</h4>
                <div className="flex flex-wrap gap-1">
                  {safeGet(report, 'lucky_elements.favorable_stones', []).map((stone: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">{stone}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 快速版升级提示 - 只显示$19.9选项 */}
      {isQuickReport && (
        <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Crown className="h-5 w-5" />
              升级解锁完整版分析
            </CardTitle>
            <CardDescription className="text-amber-700">
              解锁深度洞察，获得专业人生指导
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 升级特色 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-amber-800 mb-2">🔮 深度分析</h4>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• 完整人生时间线预测</li>
                    <li>• 详细的月度行动指南</li>
                    <li>• 专业健康养生建议</li>
                    <li>• 精神成长路径规划</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-amber-800 mb-2">💎 专业服务</h4>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• 高清PDF专业报告</li>
                    <li>• 个性化幸运元素指南</li>
                    <li>• 终身账户保存</li>
                    <li>• 24/7随时查看</li>
                  </ul>
                </div>
              </div>

              {/* 价格和按钮 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-amber-800">$19.9</span>
                      <span className="text-sm text-amber-600 line-through">$39.9</span>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">限时50%折扣</span>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">一次付费，终身使用</p>
                  </div>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-6"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    立即解锁
                  </Button>
                </div>
              </div>

              {/* 安全保障 */}
              <div className="text-center">
                <p className="text-xs text-amber-600 flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" />
                  30天无理由退款保证 • 数据安全加密保护
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}