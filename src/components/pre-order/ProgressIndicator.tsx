/**
 * 支付流程进度指示器组件
 * 显示用户在支付流程中的当前步骤
 */

'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type ProgressStep = 'product' | 'details' | 'payment' | 'confirmation';

type ProgressIndicatorProps = {
  currentStep: ProgressStep;
  completedSteps?: ProgressStep[];
  className?: string;
};

const steps: ProgressStep[] = ['product', 'details', 'payment', 'confirmation'];

export function ProgressIndicator({
  currentStep,
  completedSteps = [],
  className,
}: ProgressIndicatorProps) {
  const t = useTranslations('preOrder.progress');

  const getStepStatus = (step: ProgressStep) => {
    if (completedSteps.includes(step)) {
      return 'completed';
    }
    if (step === currentStep) {
      return 'current';
    }
    return 'pending';
  };

  const getStepIndex = (step: ProgressStep) => steps.indexOf(step);
  const currentStepIndex = getStepIndex(currentStep);

  return (
    <div className={cn('w-full max-w-2xl mx-auto mb-8', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          const isPending = status === 'pending';

          return (
            <div key={step} className="flex flex-col items-center relative">
              {/* 连接线 */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-4 left-8 w-full h-0.5 -translate-y-1/2',
                    'transition-colors duration-300',
                    index < currentStepIndex || isCompleted
                      ? 'bg-primary'
                      : 'bg-muted',
                  )}
                  style={{ width: 'calc(100vw / 4 - 2rem)' }}
                />
              )}

              {/* 步骤圆圈 */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'bg-primary/10 border-primary text-primary animate-pulse',
                  isPending && 'bg-background border-muted-foreground/30 text-muted-foreground',
                )}
              >
                {isCompleted
                  ? (
                      <Check className="h-4 w-4" />
                    )
                  : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
              </div>

              {/* 步骤标签 */}
              <div className="mt-2 text-center">
                <div
                  className={cn(
                    'text-sm font-medium transition-colors duration-300',
                    (isCompleted || isCurrent) && 'text-primary',
                    isPending && 'text-muted-foreground',
                  )}
                >
                  {t(`steps.${step}.title`)}
                </div>
                <div
                  className={cn(
                    'text-xs mt-1 transition-colors duration-300',
                    (isCompleted || isCurrent) && 'text-primary/70',
                    isPending && 'text-muted-foreground/70',
                  )}
                >
                  {t(`steps.${step}.description`)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 进度条 */}
      <div className="mt-6 bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{
            width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
          }}
        />
      </div>

      {/* 当前步骤提示 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t('currentStep', {
            step: currentStepIndex + 1,
            total: steps.length,
            stepName: t(`steps.${currentStep}.title`),
          })}
        </p>
      </div>
    </div>
  );
}
