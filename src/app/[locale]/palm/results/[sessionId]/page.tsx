"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PalmAnalysisFlow } from "@/components/palm/PalmAnalysisFlow";
import { PalmResultDisplay } from "@/components/palm/PalmResultDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AnalysisSession {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  analysisType: 'quick' | 'complete';
  result?: any;
  error?: string;
  processingTime?: number;
}

export default function PalmResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for upgrade success/cancel from URL params
  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      toast.success('Successfully upgraded to complete analysis!');
    } else if (searchParams.get('upgrade_cancelled') === 'true') {
      toast.info('Upgrade cancelled. You can upgrade anytime from your results.');
    }
  }, [searchParams]);

  // Fetch analysis session data
  useEffect(() => {
    async function fetchSession() {
      if (!user || !sessionId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/palm/sessions/${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch analysis session');
        }

        if (!data.success) {
          throw new Error(data.error || 'Analysis session not found');
        }

        setSession(data.session);

      } catch (error) {
        console.error('Failed to fetch session:', error);
        setError(error instanceof Error ? error.message : 'Failed to load analysis');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, [user, sessionId]);

  // Poll for updates if analysis is still processing
  useEffect(() => {
    if (!session || session.status !== 'processing') return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/palm/sessions/${sessionId}`);
        const data = await response.json();

        if (data.success && data.session) {
          setSession(data.session);

          // Stop polling if completed or failed
          if (data.session.status !== 'processing') {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Failed to poll session status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [session, sessionId]);

  // Authentication check
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
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your analysis results.
            </p>
            <Button onClick={() => router.push("/auth/signin")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Loading Your Results</h1>
            <p className="text-muted-foreground">Please wait while we fetch your palm reading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-red-900 mb-2">
                Analysis Not Found
              </h1>
              <p className="text-red-700 mb-6">
                {error || 'The requested analysis session could not be found.'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/palm')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Palm Reading
                </Button>
                <Button
                  onClick={() => router.push('/palm/analysis')}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Start New Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render based on session status
  const renderContent = () => {
    switch (session.status) {
      case 'pending':
      case 'processing':
        // Show processing state - this could use PalmProgressIndicator
        return (
          <div className="max-w-4xl mx-auto">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold mb-2">
                  {session.status === 'pending' ? 'Starting Analysis' : 'Analyzing Your Palm'}
                </h1>
                <p className="text-muted-foreground mb-4">
                  {session.analysisType === 'quick' 
                    ? 'Generating your quick palm reading report...' 
                    : 'Creating your complete palm analysis...'}
                </p>
                <div className="text-sm text-muted-foreground">
                  This usually takes 30-60 seconds
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'completed':
        if (!session.result) {
          return (
            <div className="max-w-4xl mx-auto">
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-8 text-center">
                  <h1 className="text-2xl font-bold mb-2">Analysis Complete</h1>
                  <p className="text-muted-foreground mb-4">
                    Your analysis is ready, but the results are not available yet.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        }

        // Show results
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => router.push('/palm')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Palm Reading
              </Button>
            </div>
            
            <PalmResultDisplay
              result={session.result}
              analysisType={session.analysisType}
              processingTime={session.processingTime}
              onRestart={() => router.push('/palm/analysis')}
            />
          </div>
        );

      case 'failed':
        return (
          <div className="max-w-4xl mx-auto">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-red-900 mb-2">
                  Analysis Failed
                </h1>
                <p className="text-red-700 mb-6">
                  {session.error || 'An unexpected error occurred during analysis.'}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/palm')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Palm Reading
                  </Button>
                  <Button
                    onClick={() => router.push('/palm/analysis')}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4">
      {renderContent()}
    </div>
  );
}