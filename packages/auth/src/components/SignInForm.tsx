/**
 * Sign In Form Component
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type { FormEvent } from 'react';
import type { SignInFormProps } from '../types';
import { useState } from 'react';
import { useAuth } from './AuthProvider';

export function SignInForm({
  locale,
  translations,
  onSuccess,
  onError,
  redirectTo,
}: SignInFormProps) {
  const { signIn, signInWithProvider, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result = await signIn(email, password);

      if (result.success && result.user) {
        onSuccess?.(result.user);
        if (redirectTo) {
          window.location.href = redirectTo;
        }
      } else if (result.error) {
        const errorMessage = result.error.message;
        setError(errorMessage);
        onError?.(result.error);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      onError?.({
        code: 'unexpected_error',
        message: errorMessage,
        provider: 'supabase',
        originalError: err,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithProvider('google');

      if (result.success && result.user) {
        onSuccess?.(result.user);
      } else if (result.error) {
        setError(result.error.message);
        onError?.(result.error);
      }
    } catch (err) {
      const errorMessage = 'Google sign in failed';
      setError(errorMessage);
      onError?.({
        code: 'google_sign_in_failed',
        message: errorMessage,
        provider: 'supabase',
        originalError: err,
      });
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center">{translations.title}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            {translations.emailLabel}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={translations.emailPlaceholder}
            disabled={loading}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            required
          />
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            {translations.passwordLabel}
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={translations.passwordPlaceholder}
            disabled={loading}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            required
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? translations.processing : translations.submitButton}
        </button>

        {/* Forgot password link */}
        <div className="text-center">
          <a
            href={`/${locale}/forgot-password`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {translations.forgotPassword}
          </a>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Google sign in button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {translations.googleSignIn}
        </button>

        {/* Sign up link */}
        <div className="text-center text-sm">
          <span className="text-gray-600">
            {translations.signUpText}
            {' '}
          </span>
          <a
            href={`/${locale}/sign-up`}
            className="text-blue-600 hover:text-blue-800"
          >
            {translations.signUpLink}
          </a>
        </div>
      </form>
    </div>
  );
}
