"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PalmUploadForm, type PalmAnalysisFormData } from "@/components/palm/PalmUploadForm";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function PalmAnalysisPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleFormSubmit = async (formData: PalmAnalysisFormData) => {
    if (!user) {
      toast.error("Please sign in to start palm analysis");
      router.push("/auth/signin");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append("image", formData.image);
      uploadData.append("data", JSON.stringify({
        handType: formData.handType,
        analysisType: formData.analysisType,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthLocation: formData.birthLocation,
      }));

      // Submit to API
      const response = await fetch("/api/palm/analysis", {
        method: "POST",
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to start analysis");
      }

      toast.success("Palm analysis started successfully!");
      
      // Redirect to analysis results page
      router.push(`/palm/analysis/${result.sessionId}`);

    } catch (error) {
      console.error("Palm analysis submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start analysis");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access palm reading services.
          </p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Palm Reading Analysis</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload a clear photo of your palm to receive personalized insights about your life, 
            personality, and future possibilities through the ancient art of palmistry.
          </p>
        </div>

        <PalmUploadForm 
          onSubmit={handleFormSubmit} 
          isLoading={isSubmitting} 
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📸</span>
            </div>
            <h3 className="font-semibold mb-2">Upload Your Palm</h3>
            <p className="text-sm text-muted-foreground">
              Take a clear photo of your palm in good lighting
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-semibold mb-2">AI Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Our advanced AI analyzes your palm lines and features
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold mb-2">Get Insights</h3>
            <p className="text-sm text-muted-foreground">
              Receive detailed insights about your personality and future
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}