"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { PalmUploadForm, PalmAnalysisFormData } from "./PalmUploadForm";
import { PalmProgressIndicator } from "./PalmProgressIndicator";
import { PalmResultDisplay } from "./PalmResultDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";

type AnalysisStep = 'upload' | 'processing' | 'results' | 'error';

interface AnalysisSession {
  sessionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  analysisType: 'quick' | 'complete';
  result?: any;
  error?: string;
  processingTime?: number;
}

interface PalmAnalysisFlowProps {
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export function PalmAnalysisFlow({ onComplete, onError }: PalmAnalysisFlowProps) {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('upload');
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 处理表单提交
  const handleFormSubmit = useCallback(async (formData: PalmAnalysisFormData) => {
    try {
      setIsLoading(true);
      setCurrentStep('processing');

      // 1. 创建分析会话
      const sessionResponse = await createAnalysisSession(formData);
      if (!sessionResponse.success) {
        throw new Error(sessionResponse.error || 'Failed to create analysis session');
      }

      const newSession: AnalysisSession = {
        sessionId: sessionResponse.sessionId,
        status: 'pending',
        analysisType: formData.analysisType,
      };
      setSession(newSession);

      // 2. 开始分析
      const analysisResponse = await startAnalysis(sessionResponse.sessionId, formData.analysisType);
      if (!analysisResponse.success) {
        throw new Error(analysisResponse.error || 'Analysis failed');
      }

      // 3. 更新会话状态
      const completedSession: AnalysisSession = {
        ...newSession,
        status: 'completed',
        result: analysisResponse.result,
        processingTime: analysisResponse.processingTime,
      };
      setSession(completedSession);
      setCurrentStep('results');

      // 调用完成回调
      onComplete?.(analysisResponse.result);
      
      toast.success('Analysis completed successfully!');

    } catch (error) {
      console.error('Analysis flow error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setSession(prev => prev ? { ...prev, status: 'failed', error: errorMessage } : null);
      setCurrentStep('error');
      
      onError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onComplete, onError]);

  // 重新开始分析
  const handleRestart = useCallback(() => {
    setCurrentStep('upload');
    setSession(null);
    setIsLoading(false);
  }, []);

  // 重试分析
  const handleRetry = useCallback(async () => {
    if (!session?.sessionId) return;

    try {
      setIsLoading(true);
      setCurrentStep('processing');

      // 重试分析
      const response = await retryAnalysis(session.sessionId);
      if (!response.success) {
        throw new Error(response.error || 'Retry failed');
      }

      // 重新开始分析流程
      const analysisResponse = await startAnalysis(session.sessionId, session.analysisType);
      if (!analysisResponse.success) {
        throw new Error(analysisResponse.error || 'Analysis failed');
      }

      const updatedSession: AnalysisSession = {
        ...session,
        status: 'completed',
        result: analysisResponse.result,
        processingTime: analysisResponse.processingTime,
      };
      setSession(updatedSession);
      setCurrentStep('results');

      onComplete?.(analysisResponse.result);
      toast.success('Analysis completed successfully!');

    } catch (error) {
      console.error('Retry error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Retry failed';
      
      setSession(prev => prev ? { ...prev, error: errorMessage } : null);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [session, onComplete]);

  // 渲染当前步骤
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <PalmUploadForm
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
          />
        );

      case 'processing':
        return (
          <PalmProgressIndicator
            session={session}
            onCancel={() => setCurrentStep('upload')}
          />
        );

      case 'results':
        return session?.result ? (
          <PalmResultDisplay
            result={session.result}
            analysisType={session.analysisType}
            processingTime={session.processingTime}
            onRestart={handleRestart}
          />
        ) : null;

      case 'error':
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">
                  Analysis Failed
                </h3>
                <p className="text-red-700 mb-4">
                  {session?.error || 'An unexpected error occurred during analysis.'}
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Start Over
                </Button>
                
                {session?.sessionId && (
                  <Button
                    onClick={handleRetry}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Retry Analysis
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 步骤指示器 */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <StepIndicator
            step={1}
            title="Upload"
            isActive={currentStep === 'upload'}
            isCompleted={['processing', 'results', 'error'].includes(currentStep)}
          />
          <div className={`h-1 w-12 ${
            ['processing', 'results', 'error'].includes(currentStep) ? 'bg-primary' : 'bg-gray-200'
          }`} />
          <StepIndicator
            step={2}
            title="Analysis"
            isActive={currentStep === 'processing'}
            isCompleted={['results'].includes(currentStep)}
          />
          <div className={`h-1 w-12 ${
            ['results'].includes(currentStep) ? 'bg-primary' : 'bg-gray-200'
          }`} />
          <StepIndicator
            step={3}
            title="Results"
            isActive={currentStep === 'results'}
            isCompleted={false}
          />
        </div>
      </div>

      {/* 当前步骤内容 */}
      {renderCurrentStep()}
    </div>
  );
}

// 步骤指示器组件
function StepIndicator({ 
  step, 
  title, 
  isActive, 
  isCompleted 
}: { 
  step: number; 
  title: string; 
  isActive: boolean; 
  isCompleted: boolean; 
}) {
  return (
    <div className="flex flex-col items-center">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
        ${isCompleted ? 'bg-primary text-primary-foreground' : 
          isActive ? 'bg-primary text-primary-foreground' : 
          'bg-gray-200 text-gray-600'}
      `}>
        {isCompleted ? '✓' : step}
      </div>
      <span className={`mt-2 text-sm ${
        isActive || isCompleted ? 'text-primary font-medium' : 'text-gray-500'
      }`}>
        {title}
      </span>
    </div>
  );
}

// API 调用函数
async function createAnalysisSession(formData: PalmAnalysisFormData) {
  const apiFormData = new FormData();
  apiFormData.append('image', formData.image);
  apiFormData.append('data', JSON.stringify({
    handType: formData.handType,
    analysisType: formData.analysisType,
    birthDate: formData.birthDate,
    birthTime: formData.birthTime,
    birthLocation: formData.birthLocation,
  }));

  const response = await fetch('/api/palm/sessions', {
    method: 'POST',
    body: apiFormData,
  });

  return response.json();
}

async function startAnalysis(sessionId: string, analysisType: 'quick' | 'complete') {
  const response = await fetch('/api/palm/analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      analysisType,
    }),
  });

  return response.json();
}

async function retryAnalysis(sessionId: string) {
  const response = await fetch(`/api/palm/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'retry',
    }),
  });

  return response.json();
}