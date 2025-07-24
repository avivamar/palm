'use client';

import { Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function VerifyEmailForm() {
  const { user, signOut, resendVerificationEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleResendVerification = async () => {
    if (!user) {
      toast.error('You must be logged in to resend a verification email.');
      return;
    }
    setIsLoading(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent!', {
        description: 'Please check your inbox for the new verification link.',
      });
    } catch (error) {
      toast.error('Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <p className="text-gray-600">
        A verification link has been sent to
        <strong className="font-medium text-gray-900">{user?.email}</strong>
        .
        Please check your inbox and spam folder.
      </p>
      <Button
        onClick={handleResendVerification}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Resend Verification Email
      </Button>
      <Button
        onClick={signOut}
        variant="outline"
        className="w-full"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
