/**
 * Location Search Service Configuration
 * 地址搜索服务配置 - 支持三层降级机制
 */

export type LocationServiceConfig = {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit: {
    requestsPerSecond: number;
    requestsPerMonth: number;
  };
  timeout: number;
  retries: number;
};

export type LocationSearchConfig = {
  primary: LocationServiceConfig;
  secondary: LocationServiceConfig;
  fallback: LocationServiceConfig;
  cache: {
    enabled: boolean;
    ttl: number; // Time to live in seconds
    maxSize: number;
  };
  debounce: {
    enabled: boolean;
    delay: number; // Delay in milliseconds
  };
};

// Environment variables with fallbacks
const getEnvVar = (key: string, defaultValue?: string): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use Next.js public env vars
    return (window as any).__NEXT_DATA__?.env?.[key] || defaultValue || '';
  }
  // Server-side: use process.env
  return process.env[key] || defaultValue || '';
};

// Location search service configuration
export const locationConfig: LocationSearchConfig = {
  // Primary: Google Places API (最高精度和覆盖率)
  primary: {
    name: 'Google Places',
    baseUrl: 'https://maps.googleapis.com/maps/api/place',
    apiKey: getEnvVar('GOOGLE_PLACES_API_KEY'),
    rateLimit: {
      requestsPerSecond: 10,
      requestsPerMonth: 100000, // Generous free tier
    },
    timeout: 5000,
    retries: 2,
  },

  // Secondary: Mapbox Geocoding API (平衡性能和成本)
  secondary: {
    name: 'Mapbox Geocoding',
    baseUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    apiKey: getEnvVar('MAPBOX_ACCESS_TOKEN'),
    rateLimit: {
      requestsPerSecond: 10,
      requestsPerMonth: 100000,
    },
    timeout: 4000,
    retries: 2,
  },

  // Fallback: OpenStreetMap Nominatim (免费保底方案)
  fallback: {
    name: 'OpenStreetMap Nominatim',
    baseUrl: 'https://nominatim.openstreetmap.org',
    rateLimit: {
      requestsPerSecond: 1, // Nominatim has strict rate limits
      requestsPerMonth: 1000000, // No monthly limit but daily usage policy
    },
    timeout: 8000,
    retries: 1,
  },

  // Caching configuration
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    maxSize: 1000, // Maximum number of cached entries
  },

  // Debounce configuration
  debounce: {
    enabled: true,
    delay: 300, // 300ms delay for better UX
  },
};

// Service availability check
export const checkServiceAvailability = () => {
  const availability = {
    primary: !!locationConfig.primary.apiKey,
    secondary: !!locationConfig.secondary.apiKey,
    fallback: true, // Nominatim is always available
  };
  
  return {
    ...availability,
    hasAnyService: availability.primary || availability.secondary || availability.fallback,
  };
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: {
    primary: locationConfig.primary.rateLimit.requestsPerSecond * 60,
    secondary: locationConfig.secondary.rateLimit.requestsPerSecond * 60,
    fallback: locationConfig.fallback.rateLimit.requestsPerSecond * 60,
  },
};

export default locationConfig;