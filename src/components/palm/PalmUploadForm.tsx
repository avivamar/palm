"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

interface PalmUploadFormProps {
  onSubmit: (data: PalmAnalysisFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface PalmAnalysisFormData {
  image: File;
  handType: "left" | "right";
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  analysisType: "quick" | "complete";
}

export function PalmUploadForm({ onSubmit, isLoading = false }: PalmUploadFormProps) {
  const [formData, setFormData] = useState<Partial<PalmAnalysisFormData>>({
    handType: "right",
    analysisType: "quick",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setUploadedFile(file);
      setFormData(prev => ({ ...prev, image: file }));

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    multiple: false,
    disabled: isLoading,
  });

  const removeFile = () => {
    setUploadedFile(null);
    setFormData(prev => ({ ...prev, image: undefined }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      toast.error("Please upload a palm image");
      return;
    }

    if (!formData.handType) {
      toast.error("Please select hand type");
      return;
    }

    try {
      await onSubmit(formData as PalmAnalysisFormData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to start analysis. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Upload Your Palm Image
        </CardTitle>
        <CardDescription>
          Upload a clear photo of your palm to get started with your personalized reading
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Area */}
          <div className="space-y-4">
            <Label>Palm Image *</Label>
            {!uploadedFile ? (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? "Drop your image here" : "Upload palm image"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: JPEG, PNG, WebP (max 10MB)
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                  {previewUrl && (
                    <Image
                      src={previewUrl}
                      alt="Palm preview"
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
                  onClick={removeFile}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="mt-2 text-sm text-muted-foreground">
                  {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              </div>
            )}
          </div>

          {/* Hand Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="handType">Hand Type *</Label>
            <Select
              value={formData.handType}
              onValueChange={(value: "left" | "right") =>
                setFormData(prev => ({ ...prev, handType: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hand type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="right">Right Hand</SelectItem>
                <SelectItem value="left">Left Hand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analysis Type */}
          <div className="space-y-2">
            <Label htmlFor="analysisType">Analysis Type *</Label>
            <Select
              value={formData.analysisType}
              onValueChange={(value: "quick" | "complete") =>
                setFormData(prev => ({ ...prev, analysisType: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select analysis type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quick">Quick Reading (Free)</SelectItem>
                <SelectItem value="complete">Complete Reading ($9.99)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Birth Information (Optional) */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Birth Information (Optional - for enhanced accuracy)
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
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
                <Label htmlFor="birthTime">Birth Time</Label>
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
              <Label htmlFor="birthLocation">Birth Location</Label>
              <Input
                id="birthLocation"
                placeholder="City, Country (e.g., New York, USA)"
                value={formData.birthLocation || ""}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, birthLocation: e.target.value }))
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!formData.image || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting Analysis...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Start Palm Reading
              </>
            )}
          </Button>

          {formData.analysisType === "complete" && (
            <p className="text-xs text-muted-foreground text-center">
              You will be redirected to payment after uploading
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}