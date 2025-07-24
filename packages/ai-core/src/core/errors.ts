export class AIServiceError extends Error {
  public code: string;
  public provider?: string;
  public override cause?: unknown;

  constructor(
    message: string,
    code: string,
    provider?: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.provider = provider;
    this.cause = cause;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AIServiceError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      provider: this.provider,
      stack: this.stack,
    };
  }
}

export class ProviderNotFoundError extends AIServiceError {
  constructor(provider: string) {
    super(`AI provider '${provider}' not found or not configured`, 'PROVIDER_NOT_FOUND', provider);
    this.name = 'ProviderNotFoundError';
    Object.setPrototypeOf(this, ProviderNotFoundError.prototype);
  }
}

export class RateLimitExceededError extends AIServiceError {
  constructor(identifier: string, resetTime?: Date) {
    const message = resetTime
      ? `Rate limit exceeded for '${identifier}'. Resets at ${resetTime.toISOString()}`
      : `Rate limit exceeded for '${identifier}'`;

    super(message, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitExceededError';
    Object.setPrototypeOf(this, RateLimitExceededError.prototype);
  }
}

export class PromptNotFoundError extends Error {
  constructor(category: string, name: string, locale?: string) {
    const localeStr = locale ? ` (locale: ${locale})` : '';
    super(`Prompt not found: ${category}/${name}${localeStr}`);
    this.name = 'PromptNotFoundError';
    Object.setPrototypeOf(this, PromptNotFoundError.prototype);
  }
}

export class CacheError extends AIServiceError {
  constructor(operation: string, cause?: unknown) {
    super(`Cache operation failed: ${operation}`, 'CACHE_ERROR', undefined, cause);
    this.name = 'CacheError';
    Object.setPrototypeOf(this, CacheError.prototype);
  }
}

export class ConfigurationError extends AIServiceError {
  constructor(message: string, field?: string) {
    super(`Configuration error: ${message}${field ? ` (field: ${field})` : ''}`, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class ProviderTimeoutError extends AIServiceError {
  constructor(provider: string, timeoutMs: number) {
    super(`Provider '${provider}' timed out after ${timeoutMs}ms`, 'PROVIDER_TIMEOUT', provider);
    this.name = 'ProviderTimeoutError';
    Object.setPrototypeOf(this, ProviderTimeoutError.prototype);
  }
}
