import type { ProviderEndpoint } from '../../core/types';

interface EndpointHealth {
  endpoint: ProviderEndpoint;
  isHealthy: boolean;
  lastCheck: Date;
  responseTime: number;
  errorCount: number;
  consecutiveErrors: number;
}

interface RequestMetrics {
  requestCount: number;
  lastRequest: Date;
}

export class OpenAIEndpointManager {
  private endpoints: ProviderEndpoint[] = [];
  private healthStatus: Map<string, EndpointHealth> = new Map();
  private requestMetrics: Map<string, RequestMetrics> = new Map();
  private circuitBreakerThreshold = 5; // Consecutive failures before circuit breaker trips

  constructor(endpoints: ProviderEndpoint[]) {
    this.endpoints = endpoints
      .filter(ep => ep.enabled)
      .sort((a, b) => a.priority - b.priority); // Sort by priority (1 = highest)
    
    // Initialize health status for all endpoints
    this.endpoints.forEach(endpoint => {
      this.healthStatus.set(endpoint.url, {
        endpoint,
        isHealthy: true,
        lastCheck: new Date(),
        responseTime: 0,
        errorCount: 0,
        consecutiveErrors: 0,
      });
      
      this.requestMetrics.set(endpoint.url, {
        requestCount: 0,
        lastRequest: new Date(0),
      });
    });
  }

  /**
   * Get the best available endpoint based on priority, health, and rate limits
   */
  getBestEndpoint(): ProviderEndpoint | null {
    const now = new Date();
    
    // Filter healthy endpoints that haven't hit rate limits
    const availableEndpoints = this.endpoints.filter(endpoint => {
      const health = this.healthStatus.get(endpoint.url);
      const metrics = this.requestMetrics.get(endpoint.url);
      
      if (!health?.isHealthy) return false;
      
      // Check circuit breaker
      if (health.consecutiveErrors >= this.circuitBreakerThreshold) {
        // Reset after 1 minute
        if (now.getTime() - health.lastCheck.getTime() > 60000) {
          health.consecutiveErrors = 0;
          health.isHealthy = true;
        } else {
          return false;
        }
      }
      
      // Check rate limits
      if (endpoint.maxRPS && metrics) {
        const timeSinceLastRequest = now.getTime() - metrics.lastRequest.getTime();
        const minTimeBetweenRequests = 1000 / endpoint.maxRPS;
        
        if (timeSinceLastRequest < minTimeBetweenRequests) {
          return false; // Too soon for this endpoint
        }
      }
      
      return true;
    });
    
    if (availableEndpoints.length === 0) {
      // If no endpoints are available, try to reset circuit breakers
      this.resetOldCircuitBreakers(300000); // Reset after 5 minutes
      const fallbackEndpoint = this.endpoints.find(ep => this.healthStatus.get(ep.url)?.isHealthy);
      return fallbackEndpoint || null;
    }
    
    // Return highest priority endpoint
    return availableEndpoints[0] || null;
  }

  /**
   * Record a successful request
   */
  recordSuccess(endpointUrl: string, responseTime: number): void {
    const health = this.healthStatus.get(endpointUrl);
    const metrics = this.requestMetrics.get(endpointUrl);
    
    if (health) {
      health.isHealthy = true;
      health.consecutiveErrors = 0;
      health.responseTime = responseTime;
      health.lastCheck = new Date();
    }
    
    if (metrics) {
      metrics.requestCount++;
      metrics.lastRequest = new Date();
    }
  }

  /**
   * Record a failed request
   */
  recordFailure(endpointUrl: string, _error: Error): void {
    const health = this.healthStatus.get(endpointUrl);
    
    if (health) {
      health.errorCount++;
      health.consecutiveErrors++;
      health.lastCheck = new Date();
      
      // Trip circuit breaker if too many consecutive errors
      if (health.consecutiveErrors >= this.circuitBreakerThreshold) {
        health.isHealthy = false;
        console.warn(`Circuit breaker tripped for endpoint ${endpointUrl} after ${health.consecutiveErrors} consecutive errors`);
      }
    }
  }

  /**
   * Get all endpoint health statuses
   */
  getHealthStatus(): EndpointHealth[] {
    return Array.from(this.healthStatus.values());
  }

  /**
   * Get endpoint by URL
   */
  getEndpoint(url: string): ProviderEndpoint | undefined {
    return this.endpoints.find(ep => ep.url === url);
  }

  /**
   * Reset circuit breakers for endpoints that have been down for too long
   */
  private resetOldCircuitBreakers(maxAge: number): void {
    const now = new Date();
    
    this.healthStatus.forEach((health) => {
      if (!health.isHealthy && 
          now.getTime() - health.lastCheck.getTime() > maxAge) {
        health.isHealthy = true;
        health.consecutiveErrors = 0;
        console.info(`Resetting circuit breaker for endpoint ${health.endpoint.url}`);
      }
    });
  }

  /**
   * Manually set endpoint health (for testing)
   */
  setEndpointHealth(url: string, isHealthy: boolean): void {
    const health = this.healthStatus.get(url);
    if (health) {
      health.isHealthy = isHealthy;
      if (isHealthy) {
        health.consecutiveErrors = 0;
      }
    }
  }

  /**
   * Get endpoint statistics
   */
  getStatistics() {
    return {
      totalEndpoints: this.endpoints.length,
      healthyEndpoints: Array.from(this.healthStatus.values()).filter(h => h.isHealthy).length,
      endpoints: Array.from(this.healthStatus.values()).map(health => ({
        url: health.endpoint.url,
        priority: health.endpoint.priority,
        isHealthy: health.isHealthy,
        responseTime: health.responseTime,
        errorCount: health.errorCount,
        consecutiveErrors: health.consecutiveErrors,
        requestCount: this.requestMetrics.get(health.endpoint.url)?.requestCount || 0,
      })),
    };
  }
}