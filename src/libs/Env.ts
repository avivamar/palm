/**
 * Enhanced Environment Variable Validation
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式，安全性优先
 *
 * Separates build-time and runtime validation for better performance and flexibility
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Build-time detection with multiple fallbacks for different environments
const isBuildTime =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NEXT_PHASE === 'phase-development-build' ||
  process.env.NODE_ENV === 'test' ||
  process.argv.some(
    arg => arg.includes('build') || arg.includes('lint') || arg.includes('type-check'),
  ) ||
  (typeof window === 'undefined' && process.env.BUILDING === 'true') ||
  // Railway specific build detection
  (process.env.RAILWAY_ENVIRONMENT === 'production' &&
    !process.env.RAILWAY_SERVICE_NAME) ||
  // Docker build detection
  process.env.NIXPACKS_BUILD_PHASE === 'build' ||
  // General CI/build environment detection
  (process.env.CI === 'true' &&
    typeof process !== 'undefined' &&
    !process.env.PORT);

// Runtime detection
const isRuntime = !isBuildTime;

// Production environment detection
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Build-time validation schema
 * Only validates essential variables needed during build
 */
const buildTimeSchema = {
  server: {
    // Essential for build-time only
    NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  },
  client: {
    // Public variables that might be needed during build
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  },
};

/**
 * Runtime validation schema
 * Full validation for all variables needed during application runtime
 */
const runtimeSchema = {
  server: {
    // Database (required in production)
    DATABASE_URL: z.string().optional(),
    PG_SSL_CERT: z.string().optional(),

    // Redis (optional but recommended)
    REDIS_URL: z.string().optional(),

    // Authentication (optional during build, required at runtime)
    NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

    // Firebase (optional, for backup auth)
    FIREBASE_PROJECT_ID: z.string().min(1).optional(),
    FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
    FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
    FIREBASE_SERVICE_ACCOUNT_KEY: z.string().min(1).optional(),

    // Payment processing (optional for flexibility)
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PRODUCT_ID: z.string().startsWith('prod_').optional(),
    COLOR_PRICE_MAP_JSON: z.string().min(1).optional(),

    // Email service (optional)
    RESEND_API_KEY: z.string().startsWith('re_').optional(),

    // Marketing (optional)
    KLAVIYO_API_KEY: z.string().optional(),
    KLAVIYO_WEBHOOK_SECRET: z.string().optional(),
    KLAVIYO_LIST_ID: z.string().optional(),

    // Monitoring (optional)
    LOGTAIL_SOURCE_TOKEN: z.string().optional(),
    WEBHOOK_LOGS_API_KEY: z.string().optional(),

    // Third-party integrations (optional)
    NOTION_TOKEN: z.string().optional(),
    NOTION_DATABASE_ID: z.string().optional(),
    NOTION_CONTACT_DATABASE_ID: z.string().optional(),

    // App configuration
    APP_URL: z.string().url().optional(),

    // Admin configuration
    ADMIN_EMAIL: z.string().email().optional(),

    // AI Services (optional but recommended for AI features)
    OPENAI_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    GOOGLE_AI_API_KEY: z.string().min(1).optional(),
    REDIS_TOKEN: z.string().min(1).optional(),
  },
  client: {
    // Application (optional for flexibility)
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

    // Firebase client (optional)
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1).optional(),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().min(1).optional(),

    // Payment client (optional for flexibility)
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

    // Marketing analytics (optional)
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
    NEXT_PUBLIC_CLARITY_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_TIKTOK_PIXEL_ID: z.string().optional(),
    NEXT_PUBLIC_KLAVIYO_COMPANY_ID: z.string().optional(),

    // Error monitoring (optional)

  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).default('development'),
  },
};

// Choose schema based on context
const activeSchema = isBuildTime ? buildTimeSchema : runtimeSchema;

// Create environment validation
export const Env = createEnv({
  server: activeSchema.server as any,
  client: activeSchema.client as any,
  shared: activeSchema.shared as any,

  // Runtime environment mapping
  runtimeEnv: {
    // Server variables
    DATABASE_URL: process.env.DATABASE_URL,
    PG_SSL_CERT: process.env.PG_SSL_CERT,
    REDIS_URL: process.env.REDIS_URL,

    // Firebase server
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,

    // Payment server
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRODUCT_ID: process.env.STRIPE_PRODUCT_ID,
    COLOR_PRICE_MAP_JSON: process.env.COLOR_PRICE_MAP_JSON,

    // Email
    RESEND_API_KEY: process.env.RESEND_API_KEY,

    // Marketing
    KLAVIYO_API_KEY: process.env.KLAVIYO_API_KEY,
    KLAVIYO_WEBHOOK_SECRET: process.env.KLAVIYO_WEBHOOK_SECRET,
    KLAVIYO_LIST_ID: process.env.KLAVIYO_LIST_ID,

    // Monitoring
    LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
    WEBHOOK_LOGS_API_KEY: process.env.WEBHOOK_LOGS_API_KEY,

    // Third-party
    NOTION_TOKEN: process.env.NOTION_TOKEN,
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
    NOTION_CONTACT_DATABASE_ID: process.env.NOTION_CONTACT_DATABASE_ID,

    // App configuration
    APP_URL: process.env.APP_URL,

    // Admin configuration
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,

    // AI Services
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
    REDIS_TOKEN: process.env.REDIS_TOKEN,

    // Client variables
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,

    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    NEXT_PUBLIC_CLARITY_PROJECT_ID: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
    NEXT_PUBLIC_TIKTOK_PIXEL_ID: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
    NEXT_PUBLIC_KLAVIYO_COMPANY_ID: process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID,



    // Shared
    NODE_ENV: process.env.NODE_ENV,
  },

  // Skip validation during build time for performance
  skipValidation: isBuildTime,
});

/**
 * Environment validation utilities
 */

export type EnvValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  missingOptional: string[];
};

/**
 * Validate specific environment variables at runtime
 */
export function validateEnvironment(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    missingRequired: [],
    missingOptional: [],
  };

  // Required variables check
  const requiredVars: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  // Production-only required variables
  if (isProduction) {
    requiredVars.DATABASE_URL = process.env.DATABASE_URL;
    requiredVars.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    requiredVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  }

  // Check required variables
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      result.missingRequired.push(key);
      result.errors.push(`Missing required environment variable: ${key}`);
      result.isValid = false;
    }
  }

  // Optional but recommended variables
  const recommendedVars: Record<string, string | undefined> = {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  };

  // Check recommended variables (only warn if missing)
  for (const [key, value] of Object.entries(recommendedVars)) {
    if (!value && !requiredVars[key]) {
      result.missingOptional.push(key);
      result.warnings.push(`Recommended environment variable missing: ${key}`);
    }
  }

  return result;
}

/**
 * Check if a specific feature is available based on environment variables
 */
export function isFeatureAvailable(feature: string): boolean {
  switch (feature) {
    case 'database':
      return !!process.env.DATABASE_URL;
    case 'redis':
      return !!process.env.REDIS_URL;
    case 'stripe':
      return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    case 'firebase':
      return !!(process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        || (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL));
    case 'klaviyo':
      return !!process.env.KLAVIYO_API_KEY;
    case 'notion':
      return !!process.env.NOTION_TOKEN;
    case 'resend':
      return !!process.env.RESEND_API_KEY;
    case 'ai-openai':
      return !!process.env.OPENAI_API_KEY;
    case 'ai-claude':
      return !!process.env.ANTHROPIC_API_KEY;
    case 'ai-gemini':
      return !!process.env.GOOGLE_AI_API_KEY;
    case 'ai-core':
      return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_AI_API_KEY);
    default:
      return false;
  }
}

/**
 * Get environment information for debugging
 */
export function getEnvironmentInfo(): {
  nodeEnv: string;
  isBuildTime: boolean;
  isProduction: boolean;
  availableFeatures: string[];
  validation: EnvValidationResult;
} {
  const availableFeatures = [
    'database',
    'redis',
    'stripe',
    'firebase',
    'klaviyo',
    'notion',
    'resend',
    'ai-openai',
    'ai-claude',
    'ai-gemini',
    'ai-core',
  ].filter(isFeatureAvailable);

  return {
    nodeEnv: process.env.NODE_ENV || 'unknown',
    isBuildTime,
    isProduction,
    availableFeatures,
    validation: validateEnvironment(),
  };
}

// Export validation schemas for testing
export const ValidationSchemas = {
  buildTime: buildTimeSchema,
  runtime: runtimeSchema,
};

// Development helper
if (process.env.NODE_ENV === 'development' && isRuntime) {
  const envInfo = getEnvironmentInfo();

  console.log('🔧 Environment Validation:', {
    isValid: envInfo.validation.isValid,
    availableFeatures: envInfo.availableFeatures,
    errors: envInfo.validation.errors.length,
    warnings: envInfo.validation.warnings.length,
  });

  if (envInfo.validation.errors.length > 0) {
    console.error('❌ Environment Errors:', envInfo.validation.errors);
  }

  if (envInfo.validation.warnings.length > 0) {
    console.warn('⚠️  Environment Warnings:', envInfo.validation.warnings);
  }
}
