"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, X, Loader2, Hand, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

interface PalmUploadFormProps {
  onSubmit: (data: PalmAnalysisFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface PalmAnalysisFormData {
  leftHandImage?: File;
  rightHandImage?: File;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  analysisType: "quick" | "complete";
}

interface HandUploadState {
  file: File | null;
  previewUrl: string | null;
}

export function PalmUploadForm({ onSubmit, isLoading = false }: PalmUploadFormProps) {
  const t = useTranslations('palm.form');
  const [formData, setFormData] = useState<Partial<PalmAnalysisFormData>>({
    analysisType: "quick",
  });
  const [leftHand, setLeftHand] = useState<HandUploadState>({
    file: null,
    previewUrl: null,
  });
  const [rightHand, setRightHand] = useState<HandUploadState>({
    file: null,
    previewUrl: null,
  });
  const [isCapturing, setIsCapturing] = useState<"left" | "right" | null>(null);

  const validateFile = (file: File): boolean => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("请上传图片文件"); // TODO: Add translation key
      return false;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("文件大小不能超过 10MB"); // TODO: Add translation key
      return false;
    }

    return true;
  };

  const handleFileDrop = useCallback((handType: "left" | "right") => 
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && validateFile(file)) {
        const url = URL.createObjectURL(file);
        
        if (handType === "left") {
          if (leftHand.previewUrl) {
            URL.revokeObjectURL(leftHand.previewUrl);
          }
          setLeftHand({ file, previewUrl: url });
          setFormData(prev => ({ ...prev, leftHandImage: file }));
        } else {
          if (rightHand.previewUrl) {
            URL.revokeObjectURL(rightHand.previewUrl);
          }
          setRightHand({ file, previewUrl: url });
          setFormData(prev => ({ ...prev, rightHandImage: file }));
        }
      }
    }, [leftHand.previewUrl, rightHand.previewUrl]);

  const createDropzone = (handType: "left" | "right") => {
    return useDropzone({
      onDrop: handleFileDrop(handType),
      accept: {
        "image/jpeg": [".jpeg", ".jpg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
      },
      multiple: false,
      disabled: isLoading,
    });
  };

  const leftDropzone = createDropzone("left");
  const rightDropzone = createDropzone("right");

  const removeFile = (handType: "left" | "right") => {
    if (handType === "left") {
      if (leftHand.previewUrl) {
        URL.revokeObjectURL(leftHand.previewUrl);
      }
      setLeftHand({ file: null, previewUrl: null });
      setFormData(prev => ({ ...prev, leftHandImage: undefined }));
    } else {
      if (rightHand.previewUrl) {
        URL.revokeObjectURL(rightHand.previewUrl);
      }
      setRightHand({ file: null, previewUrl: null });
      setFormData(prev => ({ ...prev, rightHandImage: undefined }));
    }
  };

  const startCamera = (handType: "left" | "right") => {
    setIsCapturing(handType);
    // 这里可以添加摄像头捕获逻辑
    toast.info("摄像头功能即将推出！"); // TODO: Add translation key
    setIsCapturing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leftHand.file && !rightHand.file) {
      toast.error(t('upload.validation.minOneHand'));
      return;
    }

    try {
      const submitData: PalmAnalysisFormData = {
        ...formData,
        leftHandImage: leftHand.file || undefined,
        rightHandImage: rightHand.file || undefined,
      };
      
      await onSubmit(submitData as PalmAnalysisFormData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("分析启动失败，请重试"); // TODO: Add translation key
    }
  };

  // 创建手掌上传区域组件
  const renderHandUploadArea = (handType: "left" | "right") => {
    const hand = handType === "left" ? leftHand : rightHand;
    const dropzone = handType === "left" ? leftDropzone : rightDropzone;
    const handLabel = handType === "left" ? t('upload.leftHand') : t('upload.rightHand');
    const handIcon = handType === "left" ? "🤚" : "✋";

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium flex items-center gap-2">
            <span className="text-2xl">{handIcon}</span>
            {t('upload.upload', { hand: handLabel })}
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => startCamera(handType)}
            disabled={isLoading || isCapturing !== null}
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            {isCapturing === handType ? t('upload.capturing') : t('upload.camera')}
          </Button>
        </div>

        {!hand.file ? (
          <div
            {...dropzone.getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              dropzone.isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...dropzone.getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium mb-1">
              {dropzone.isDragActive ? t('upload.dragDrop') : t('upload.upload', { hand: handLabel })}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              {t('upload.clickSelect')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('upload.fileTypes')}
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
              {hand.previewUrl && (
                <Image
                  src={hand.previewUrl}
                  alt={t('upload.preview', { hand: handLabel })}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => removeFile(handType)}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="mt-2 text-sm text-muted-foreground">
              {t('upload.fileInfo', { 
                name: hand.file.name, 
                size: (hand.file.size / 1024 / 1024).toFixed(2)
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hand className="h-5 w-5" />
          {t('upload.title')}
        </CardTitle>
        <CardDescription>
          {t('upload.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 双手上传区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderHandUploadArea("left")}
            {renderHandUploadArea("right")}
          </div>

          {/* 上传提示 */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5">💡</div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {t('tips.title')}
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• {t('tips.lighting')}</li>
                  <li>• {t('tips.position')}</li>
                  <li>• {t('tips.orientation')}</li>
                  <li>• {t('tips.recommendation')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 分析类型显示 (固定为免费模式) */}
          <div className="space-y-2">
            <Label>{t('analysisType.title')}</Label>
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">🆓</span>
                  <span className="font-medium text-green-800 dark:text-green-200">
                    {t('analysisType.free')}
                  </span>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {t('analysisType.experience')}
                </div>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {t('analysisType.description')}
              </p>
            </div>
          </div>

          {/* 出生信息 (可选) */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              {t('birthInfo.title')}
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">{t('birthInfo.birthDate')}</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate || ""}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, birthDate: e.target.value }))
                  }
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthTime">{t('birthInfo.birthTime')}</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={formData.birthTime || ""}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, birthTime: e.target.value }))
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthLocation">{t('birthInfo.birthLocation')}</Label>
              <Input
                id="birthLocation"
                placeholder={t('birthInfo.locationPlaceholder')}
                value={formData.birthLocation || ""}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, birthLocation: e.target.value }))
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={(!leftHand.file && !rightHand.file) || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('submit.loading')}
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                {t('submit.button')}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t('submit.privacy')}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}