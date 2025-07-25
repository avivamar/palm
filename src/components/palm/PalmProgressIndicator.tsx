"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, X, Eye, Brain, FileText, Sparkles } from "lucide-react";

interface AnalysisSession {
  sessionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  analysisType: 'quick' | 'complete';
  result?: any;
  error?: string;
  processingTime?: number;
}

interface PalmProgressIndicatorProps {
  session: AnalysisSession | null;
  onCancel?: () => void;
}

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedTime: number; // 估计时间（秒）
}

const ANALYSIS_STEPS: ProgressStep[] = [
  {
    id: 'image_processing',
    title: 'Processing Image',
    description: 'Analyzing palm image quality and preparing for feature extraction',
    icon: Eye,
    estimatedTime: 5,
  },
  {
    id: 'feature_extraction',
    title: 'Extracting Features',
    description: 'Identifying palm lines, shape, and finger characteristics',
    icon: Brain,
    estimatedTime: 15,
  },
  {
    id: 'ai_analysis',
    title: 'AI Analysis',
    description: 'Generating personalized insights using advanced AI models',
    icon: Sparkles,
    estimatedTime: 25,
  },
  {
    id: 'report_generation',
    title: 'Creating Report',
    description: 'Compiling your personalized palm reading report',
    icon: FileText,
    estimatedTime: 15,
  },
];

export function PalmProgressIndicator({ session, onCancel }: PalmProgressIndicatorProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(60);

  // 模拟进度更新
  useEffect(() => {
    if (!session || session.status !== 'processing') {
      return;
    }

    const totalEstimatedTime = ANALYSIS_STEPS.reduce((sum, step) => sum + step.estimatedTime, 0);
    let currentProgress = 0;
    let currentTime = 0;

    const interval = setInterval(() => {
      currentTime += 1;
      setElapsedTime(currentTime);

      // 计算当前步骤
      let accumulatedTime = 0;
      let newStepIndex = 0;
      
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        accumulatedTime += ANALYSIS_STEPS[i].estimatedTime;
        if (currentTime < accumulatedTime) {
          newStepIndex = i;
          break;
        }
        newStepIndex = ANALYSIS_STEPS.length - 1;
      }

      setCurrentStepIndex(newStepIndex);

      // 计算进度百分比
      const progressPercentage = Math.min((currentTime / totalEstimatedTime) * 100, 95);
      setProgress(progressPercentage);

      // 计算剩余时间
      const remaining = Math.max(totalEstimatedTime - currentTime, 0);
      setEstimatedTimeRemaining(remaining);

      // 如果超过预计时间，停止更新
      if (currentTime >= totalEstimatedTime * 1.5) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // 监听会话状态变化
  useEffect(() => {
    if (session?.status === 'completed') {
      setProgress(100);
      setCurrentStepIndex(ANALYSIS_STEPS.length - 1);
    } else if (session?.status === 'failed') {
      // 保持当前进度，不重置
    }
  }, [session?.status]);

  if (!session) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const isCompleted = session.status === 'completed';
  const isFailed = session.status === 'failed';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Loader2 className={`h-5 w-5 ${!isCompleted && !isFailed ? 'animate-spin' : ''}`} />
          {isCompleted ? 'Analysis Complete!' : 
           isFailed ? 'Analysis Failed' : 
           'Analyzing Your Palm'}
        </CardTitle>
        <CardDescription>
          {isCompleted ? 'Your personalized palm reading is ready!' :
           isFailed ? 'Something went wrong during analysis' :
           session.analysisType === 'quick' ? 
           'Generating your quick palm reading report...' : 
           'Creating your complete palm analysis...'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 主要进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* 时间信息 */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Elapsed: {formatTime(elapsedTime)}</span>
          {!isCompleted && !isFailed && (
            <span>Est. remaining: {formatTime(estimatedTimeRemaining)}</span>
          )}
        </div>

        {/* 步骤列表 */}
        <div className="space-y-4">
          {ANALYSIS_STEPS.map((step, index) => {
            const isCurrentStep = index === currentStepIndex && !isCompleted && !isFailed;
            const isCompletedStep = index < currentStepIndex || isCompleted;
            const isPendingStep = index > currentStepIndex && !isCompleted;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
                  isCurrentStep ? 'bg-primary/5 border border-primary/20' :
                  isCompletedStep ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`mt-1 p-2 rounded-full ${
                  isCurrentStep ? 'bg-primary text-primary-foreground' :
                  isCompletedStep ? 'bg-green-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {isCompletedStep ? (
                    <div className="w-4 h-4 flex items-center justify-center">✓</div>
                  ) : isCurrentStep ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium ${
                    isCurrentStep ? 'text-primary' :
                    isCompletedStep ? 'text-green-700' :
                    'text-gray-600'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    isCurrentStep ? 'text-primary/80' :
                    isCompletedStep ? 'text-green-600' :
                    'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground">
                  {isCompletedStep ? '✓' : 
                   isCurrentStep ? 'Processing...' : 
                   `~${step.estimatedTime}s`}
                </div>
              </div>
            );
          })}
        </div>

        {/* 错误信息 */}
        {isFailed && session.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Error Details</h4>
            <p className="text-sm text-red-700">{session.error}</p>
          </div>
        )}

        {/* 取消按钮 */}
        {!isCompleted && onCancel && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel Analysis
            </Button>
          </div>
        )}

        {/* 分析类型提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {session.analysisType === 'quick' ? 'Q' : 'C'}
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">
                {session.analysisType === 'quick' ? 'Quick Analysis' : 'Complete Analysis'}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {session.analysisType === 'quick' 
                  ? 'Get essential insights about your personality, health, and future in under 60 seconds.'
                  : 'Receive comprehensive insights including detailed predictions, compatibility analysis, and personalized recommendations.'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}