'use client';

import { useState } from 'react';
import { createClient } from '@/libs/supabase/config';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GoogleSignInButtonProps {
  redirectTo?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
}

export function GoogleSignInButton({
  redirectTo,
  className = '',
  variant = 'outline',
  size = 'default',
  fullWidth = true,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      const supabase = createClient();
      
      // Get the current URL for redirect
      const origin = window.location.origin;
      const redirectUrl = redirectTo || `${origin}/auth/callback`;
      
      console.log('🚀 Starting Google OAuth flow...');
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
        toast.error('Failed to sign in with Google');
        return;
      }

      if (data?.url) {
        // OAuth flow started successfully
        // The browser will redirect to Google
        console.log('✅ Redirecting to Google OAuth...');
      }
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Signing in...
        </>
      ) : (
        <>
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            />
          </svg>
          Continue with Google
        </>
      )}
    </Button>
  );
}