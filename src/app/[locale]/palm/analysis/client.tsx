"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { PalmUploadForm, type PalmAnalysisFormData } from "@/components/palm/PalmUploadForm";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PalmAnalysisClientProps {
  locale: string;
}

export function PalmAnalysisClient({ locale }: PalmAnalysisClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();
  const t = useTranslations('palm');

  const handleFormSubmit = async (formData: PalmAnalysisFormData) => {
    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      
      // 添加图片文件
      if (formData.leftHandImage) {
        uploadData.append("leftHandImage", formData.leftHandImage);
      }
      if (formData.rightHandImage) {
        uploadData.append("rightHandImage", formData.rightHandImage);
      }
      
      // 添加其他数据
      uploadData.append("data", JSON.stringify({
        analysisType: formData.analysisType,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthLocation: formData.birthLocation,
        hasLeftHand: !!formData.leftHandImage,
        hasRightHand: !!formData.rightHandImage,
        userId: user?.id || null, // 可选的用户ID
      }));

      // Submit to API
      const response = await fetch("/api/palm/upload", {
        method: "POST",
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('common.uploadFailed'));
      }

      toast.success(t('common.success'));
      
      // Redirect to analysis results page
      router.push(`/${locale}/palm/results/${result.sessionId}`);

    } catch (error) {
      console.error("Palm analysis submission error:", error);
      toast.error(error instanceof Error ? error.message : t('common.uploadFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center palm-page-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4 palm-spin"></div>
          <p className="text-muted-foreground palm-fade-in">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen palm-page-bg py-12 px-4">
      <div className="palm-container">
        <div className="text-center mb-8 palm-fade-in">
          <h1 className="text-4xl font-bold mb-4">{t('form.upload.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('form.upload.description')}
          </p>
        </div>

        <div className="palm-slide-in">
          <PalmUploadForm 
            onSubmit={handleFormSubmit} 
            isLoading={isSubmitting} 
          />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center palm-fade-in">
          <div className="palm-card p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📸</span>
            </div>
            <h3 className="font-semibold mb-2">{t('form.steps.upload')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('form.tips.lighting')}
            </p>
          </div>

          <div className="palm-card p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-semibold mb-2">{t('form.steps.analysis')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('form.steps.analysisDescription')}
            </p>
          </div>

          <div className="palm-card p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold mb-2">{t('form.steps.insights')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('form.steps.insightsDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}