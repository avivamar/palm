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

interface PalmResultDisplayProps {
  result: {
    report: {
      personality: {
        traits: string[];
        strengths: string[];
        challenges: string[];
        summary: string;
      };
      health: {
        vitality: number;
        areas: string[];
        recommendations: string[];
        summary: string;
      };
      career: {
        aptitudes: string[];
        opportunities: string[];
        challenges: string[];
        summary: string;
      };
      relationship: {
        compatibility: string[];
        communication: string[];
        challenges: string[];
        summary: string;
      };
      fortune: {
        financial: string[];
        opportunities: string[];
        timing: string[];
        summary: string;
      };
      metadata: {
        id: string;
        createdAt: string;
        language: string;
        processingTime: number;
      };
    };
    conversionHints: {
      highlightedDimensions: string[];
      personalizedMessage: string;
      urgencyLevel: 'low' | 'medium' | 'high';
      discount?: number;
    };
  };
  analysisType: 'quick' | 'complete';
  processingTime?: number;
  onRestart?: () => void;
}

export function PalmResultDisplay({ 
  result, 
  analysisType, 
  processingTime,
  onRestart 
}: PalmResultDisplayProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const { report, conversionHints } = result;
  const isQuickReport = analysisType === 'quick';

  // 格式化处理时间
  const formatProcessingTime = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.round(seconds / 60)}m`;
  };

  // 处理下载报告
  const handleDownload = async (format: 'pdf' | 'html' | 'json' = 'pdf') => {
    try {
      setIsDownloading(true);
      
      const response = await fetch('/api/palm/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: report.metadata.id,
          format,
          language: report.metadata.language,
          includeImages: false,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate report');
      }

      if (format === 'json') {
        // JSON 直接下载
        const blob = new Blob([JSON.stringify(data.report, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `palm-report-${report.metadata.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (data.report?.downloadUrl) {
        // PDF 通过链接下载
        window.open(data.report.downloadUrl, '_blank');
      }

      toast.success(`${format.toUpperCase()} report downloaded successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  // 处理分享
  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Palm Reading Report',
          text: 'Check out my personalized palm reading analysis!',
          url: window.location.href,
        });
      } else {
        // 备选：复制链接到剪贴板
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share report');
    } finally {
      setIsSharing(false);
    }
  };

  // 升级到完整版
  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      
      // 创建支付会话用于升级到完整分析
      const response = await fetch('/api/palm/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: report.metadata.id,
          upgradeType: 'complete_analysis',
          currentAnalysisType: analysisType,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create upgrade session');
      }

      // 重定向到支付页面
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }

    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to initiate upgrade. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 头部总览 */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <CardTitle className="text-2xl">Your Palm Reading Report</CardTitle>
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <CardDescription>
            {isQuickReport ? 'Quick Analysis' : 'Complete Analysis'} • 
            Generated in {formatProcessingTime(processingTime || report.metadata.processingTime)}
          </CardDescription>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant={isQuickReport ? "secondary" : "default"} className="text-sm">
              {isQuickReport ? 'Essential Insights' : 'Complete Analysis'}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {report.metadata.language.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Button 
              onClick={() => handleDownload('pdf')} 
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            
            {onRestart && (
              <Button 
                variant="outline" 
                onClick={onRestart}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                New Analysis
              </Button>
            )}
          </div>

          {/* 升级提示（仅快速分析） */}
          {isQuickReport && conversionHints && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Crown className="w-6 h-6 text-purple-600 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Unlock Your Complete Palm Reading
                  </h4>
                  <p className="text-purple-700 text-sm mb-3">
                    {conversionHints.personalizedMessage}
                  </p>
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={handleUpgrade} 
                      disabled={isUpgrading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isUpgrading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade Now
                          {conversionHints.discount && (
                            <Badge variant="secondary" className="ml-2">
                              {conversionHints.discount}% OFF
                            </Badge>
                          )}
                        </>
                      )}
                    </Button>
                    {conversionHints.urgencyLevel === 'high' && !isUpgrading && (
                      <div className="flex items-center gap-1 text-orange-600 text-sm">
                        <Clock className="w-4 h-4" />
                        Limited time offer
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分析内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="personality" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Personality
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Health
          </TabsTrigger>
          <TabsTrigger value="career" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Career
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Love
          </TabsTrigger>
        </TabsList>

        {/* 总览标签页 */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 个性概览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  Personality Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {report.personality.summary.substring(0, 120)}...
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Key Traits:</h4>
                  <div className="flex flex-wrap gap-1">
                    {report.personality.traits.slice(0, 3).map((trait, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 健康概览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Health & Vitality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Vitality Score</span>
                      <span className="text-sm text-muted-foreground">
                        {report.health.vitality}/100
                      </span>
                    </div>
                    <Progress value={report.health.vitality} className="h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {report.health.summary.substring(0, 100)}...
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 事业概览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Career Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {report.career.summary.substring(0, 120)}...
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Top Aptitudes:</h4>
                  <div className="flex flex-wrap gap-1">
                    {report.career.aptitudes.slice(0, 2).map((aptitude, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {aptitude}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 财运概览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                  Fortune & Wealth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {report.fortune.summary.substring(0, 120)}...
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Financial Opportunities:</h4>
                  <div className="flex flex-wrap gap-1">
                    {report.fortune.opportunities.slice(0, 2).map((opportunity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {opportunity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 个性分析标签页 */}
        <TabsContent value="personality" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-600" />
                Personality Analysis
              </CardTitle>
              <CardDescription>
                Deep insights into your character, strengths, and areas for growth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Summary</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {report.personality.summary}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3 text-green-700">✨ Strengths</h4>
                  <ul className="space-y-2">
                    {report.personality.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-orange-700">🎯 Growth Areas</h4>
                  <ul className="space-y-2">
                    {report.personality.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Personality Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {report.personality.traits.map((trait, index) => (
                    <Badge key={index} variant="secondary">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 其他标签页的实现... */}
        <TabsContent value="health" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-green-600" />
                Health & Wellness Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {report.health.vitality}
                  </div>
                  <div className="text-sm text-muted-foreground">Vitality Score</div>
                </div>
                <div className="flex-1">
                  <Progress value={report.health.vitality} className="h-3" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Health Summary</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {report.health.summary}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">Focus Areas</h4>
                  <ul className="space-y-2">
                    {report.health.areas.map((area, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Activity className="w-4 h-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {report.health.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 锁定内容（仅快速分析显示） */}
        {isQuickReport && (
          <>
            <TabsContent value="career" className="mt-6">
              <LockedContent 
                title="Career & Success Analysis"
                preview={report.career.summary.substring(0, 150) + "..."}
                onUpgrade={handleUpgrade}
                isUpgrading={isUpgrading}
              />
            </TabsContent>

            <TabsContent value="relationships" className="mt-6">
              <LockedContent 
                title="Love & Relationships"
                preview={report.relationship.summary.substring(0, 150) + "..."}
                onUpgrade={handleUpgrade}
                isUpgrading={isUpgrading}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

// 锁定内容组件
function LockedContent({ 
  title, 
  preview, 
  onUpgrade,
  isUpgrading = false
}: { 
  title: string; 
  preview: string; 
  onUpgrade: () => void;
  isUpgrading?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 z-10" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-6 h-6 text-gray-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground blur-sm">
          {preview}
        </p>
        <div className="text-center z-20 relative">
          <div className="bg-white border rounded-lg p-6 shadow-lg">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Unlock Complete Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get detailed insights about your {title.toLowerCase()} with our complete analysis.
            </p>
            <Button onClick={onUpgrade} disabled={isUpgrading} className="w-full">
              {isUpgrading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Complete Reading
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}