"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { PalmUploadForm, PalmAnalysisFormData } from "./PalmUploadForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface PalmAnalysisFormProps {
  onBack?: () => void;
  embedded?: boolean;
}

export function PalmAnalysisForm({ onBack, embedded = false }: PalmAnalysisFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('palmindex');

  const handleSubmit = async (formData: PalmAnalysisFormData) => {
    setIsLoading(true);
    
    try {
      // 创建 FormData 对象
      const uploadFormData = new FormData();
      
      // 添加图片文件
      if (formData.leftHandImage) {
        uploadFormData.append('leftHandImage', formData.leftHandImage);
      }
      if (formData.rightHandImage) {
        uploadFormData.append('rightHandImage', formData.rightHandImage);
      }
      
      // 添加配置数据
      const configData = {
        analysisType: 'quick', // 强制使用免费的快速分析
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthLocation: formData.birthLocation,
        hasLeftHand: !!formData.leftHandImage,
        hasRightHand: !!formData.rightHandImage,
      };
      
      uploadFormData.append('data', JSON.stringify(configData));
      
      // 发送上传请求
      const response = await fetch('/api/palm/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('common.uploadFailed'));
      }
      
      // 显示成功消息
      toast.success(t('common.success'));
      
      // 跳转到结果页面
      router.push(`/palm/results/${data.sessionId}`);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : t('common.uploadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* 如果是嵌入式模式且有回退函数，显示返回按钮 */}
      {embedded && onBack && (
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isLoading}
            className="palm-btn palm-btn-ghost"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('form.backButton')}
          </Button>
        </div>
      )}

      {/* 分析表单 */}
      <PalmUploadForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {/* 免费模式提示 */}
      {embedded && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-green-600 dark:text-green-400 mt-0.5">🎁</div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {t('form.freemium.title')}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('form.freemium.description')}
              </p>
              <div className="flex items-center gap-4 text-xs text-green-600 dark:text-green-400">
                <span>✓ {t('form.freemium.features.personality')}</span>
                <span>✓ {t('form.freemium.features.lines')}</span>
                <span>✓ {t('form.freemium.features.fortune')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}