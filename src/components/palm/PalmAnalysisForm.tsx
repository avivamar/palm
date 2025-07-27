"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        throw new Error(data.error || '上传失败');
      }
      
      // 显示成功消息
      toast.success('照片上传成功！正在启动分析...');
      
      // 跳转到结果页面
      router.push(`/palm/results/${data.sessionId}`);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : '上传失败，请重试');
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
            返回首页
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
                免费体验模式
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                您将获得免费的基础手相分析报告。如需更详细的分析和个性化建议，可在结果页面升级到完整版报告。
              </p>
              <div className="flex items-center gap-4 text-xs text-green-600 dark:text-green-400">
                <span>✓ 基础性格特质</span>
                <span>✓ 主要手相线条</span>
                <span>✓ 简要运势解读</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}