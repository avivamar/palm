/**
 * Subscription Error Page
 */

'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';

export default function SubscriptionErrorPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'An unknown error occurred';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Subscription Error
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          There was an error processing your subscription:
        </p>

        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 dark:text-red-200 break-words">
            {decodeURIComponent(errorMessage)}
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="/subscription/test"
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </a>

          <a
            href="/"
            className="block w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
