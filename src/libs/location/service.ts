/**
 * Location Search Service
 * 地址搜索服务 - 支持三层降级机制和缓存
 */

import type { LocationServiceConfig } from './config';
import { checkServiceAvailability, locationConfig } from './config';
import { LocationErrorHandler, withRetry } from './error-handler';

// Unified location result interface
export type LocationResult = {
  id: string;
  displayName: string;
  name: string;
  country: string;
  state?: string;
  city?: string;
  lat: number;
  lon: number;
  source: 'google' | 'mapbox' | 'nominatim';
  confidence?: number;
};

// Search options
export type LocationSearchOptions = {
  limit?: number;
  countryCode?: string;
  language?: string;
  types?: string[];
};

// Service response interface
type ServiceResponse = {
  success: boolean;
  data?: LocationResult[];
  error?: string;
  source: string;
};

// Cache implementation
class LocationCache {
  private cache = new Map<string, { data: LocationResult[]; timestamp: number }>();
  private readonly ttl: number;
  private readonly maxSize: number;

  constructor(ttl: number, maxSize: number) {
    this.ttl = ttl * 1000; // Convert to milliseconds
    this.maxSize = maxSize;
  }

  get(key: string): LocationResult[] | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: LocationResult[]): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Rate limiter implementation
class RateLimiter {
  private requests = new Map<string, number[]>();

  canMakeRequest(service: string, maxPerMinute: number): boolean {
    const now = Date.now();
    const serviceRequests = this.requests.get(service) || [];

    // Remove requests older than 1 minute
    const recentRequests = serviceRequests.filter(time => now - time < 60000);

    if (recentRequests.length >= maxPerMinute) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(service, recentRequests);
    return true;
  }
}

// Main location search service
export class LocationSearchService {
  private cache: LocationCache;
  private rateLimiter: RateLimiter;
  private availability: ReturnType<typeof checkServiceAvailability>;
  private errorHandler: LocationErrorHandler;

  constructor() {
    this.cache = new LocationCache(
      locationConfig.cache.ttl,
      locationConfig.cache.maxSize,
    );
    this.rateLimiter = new RateLimiter();
    this.availability = checkServiceAvailability();
    this.errorHandler = new LocationErrorHandler();
  }

  /**
   * Search for locations using the three-tier fallback system
   */
  async searchLocations(
    query: string,
    options: LocationSearchOptions = {},
  ): Promise<LocationResult[]> {
    if (!query.trim()) {
      return [];
    }

    const cacheKey = this.getCacheKey(query, options);

    // Check cache first
    if (locationConfig.cache.enabled) {
      const cachedResults = this.cache.get(cacheKey);
      if (cachedResults) {
        return cachedResults;
      }
    }

    // Try services in order: Google -> Mapbox -> Nominatim
    const services = [
      { config: locationConfig.primary, method: this.searchGoogle.bind(this) },
      { config: locationConfig.secondary, method: this.searchMapbox.bind(this) },
      { config: locationConfig.fallback, method: this.searchNominatim.bind(this) },
    ];

    for (const { config, method } of services) {
      try {
        // Check if service is available and rate limit allows
        if (!this.isServiceAvailable(config) || !this.checkRateLimit(config)) {
          continue;
        }

        // Check if we should skip this service due to high error rate
        if (this.errorHandler.shouldSkipService(config.name as 'google' | 'mapbox' | 'nominatim')) {
          console.warn(`Skipping ${config.name} due to high error rate`);
          continue;
        }

        const response = await withRetry(
          () => method(query, options),
          2, // 最多重试2次
          1000, // 1秒延迟
        );
        if (response.success && response.data && response.data.length > 0) {
          // Cache successful results
          if (locationConfig.cache.enabled) {
            this.cache.set(cacheKey, response.data);
          }
          return response.data;
        }
      } catch (error) {
        // 使用错误处理器记录错误
        const locationError = this.errorHandler.handleError(
          error,
          config.name as 'google' | 'mapbox' | 'nominatim',
          `query: ${query}, service: ${config.name}`,
        );

        console.warn(`Location service ${config.name} failed:`, locationError.message);
        continue;
      }
    }

    // If all services fail, return empty array
    return [];
  }

  /**
   * OpenStreetMap Nominatim search (fallback)
   */
  private async searchNominatim(
    query: string,
    options: LocationSearchOptions,
  ): Promise<ServiceResponse> {
    const config = locationConfig.fallback;

    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: (options.limit || 5).toString(),
      ...(options.countryCode && { countrycodes: options.countryCode }),
      ...(options.language && { 'accept-language': options.language }),
    });

    const response = await this.fetchWithTimeout(
      `${config.baseUrl}/search?${params}`,
      config.timeout,
    );

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, error: 'No results', source: 'nominatim' };
    }

    const results: LocationResult[] = data.map((item: any) => ({
      id: item.place_id?.toString() || item.osm_id?.toString() || Math.random().toString(),
      displayName: item.display_name,
      name: item.name || item.address?.city || item.address?.town || item.address?.village || '',
      country: item.address?.country || '',
      state: item.address?.state || item.address?.province || '',
      city: item.address?.city || item.address?.town || item.address?.village || '',
      lat: Number.parseFloat(item.lat),
      lon: Number.parseFloat(item.lon),
      source: 'nominatim' as const,
      confidence: 0.7,
    }));

    return { success: true, data: results, source: 'nominatim' };
  }

  /**
   * Google Places API search (placeholder for future implementation)
   */
  private async searchGoogle(
    _query: string,
    _options: LocationSearchOptions,
  ): Promise<ServiceResponse> {
    // For now, throw error to fall back to next service
    throw new Error('Google Places API not implemented yet');
  }

  /**
   * Mapbox Geocoding API search (placeholder for future implementation)
   */
  private async searchMapbox(
    _query: string,
    _options: LocationSearchOptions,
  ): Promise<ServiceResponse> {
    // For now, throw error to fall back to next service
    throw new Error('Mapbox API not implemented yet');
  }

  /**
   * Utility methods
   */
  private getCacheKey(query: string, options: LocationSearchOptions): string {
    return `${query.toLowerCase()}_${JSON.stringify(options)}`;
  }

  private isServiceAvailable(config: LocationServiceConfig): boolean {
    if (config === locationConfig.primary) {
      return this.availability.primary;
    }
    if (config === locationConfig.secondary) {
      return this.availability.secondary;
    }
    return this.availability.fallback;
  }

  private checkRateLimit(config: LocationServiceConfig): boolean {
    const maxRequests = config.rateLimit.requestsPerSecond * 60; // Per minute
    return this.rateLimiter.canMakeRequest(config.name, maxRequests);
  }

  private async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Palm Reading App/1.0',
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get service availability status
   */
  getServiceStatus() {
    return {
      ...this.availability,
      cacheEnabled: locationConfig.cache.enabled,
      debounceEnabled: locationConfig.debounce.enabled,
    };
  }

  /**
   * 获取错误统计信息
   */
  getErrorStats() {
    return this.errorHandler.getStats();
  }

  /**
   * 重置错误统计
   */
  resetErrorStats() {
    this.errorHandler.resetStats();
  }

  /**
   * 监听错误事件
   */
  onError(callback: (error: any) => void) {
    return this.errorHandler.onError(callback);
  }
}

// Export singleton instance
export const locationSearchService = new LocationSearchService();
export default locationSearchService;