interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitState {
  requests: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitState>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.limits = new Map();
    this.config = config;
  }

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const state = this.limits.get(key) || { requests: 0, resetTime: now + this.config.windowMs };

    // Reset if window has passed
    if (now > state.resetTime) {
      state.requests = 0;
      state.resetTime = now + this.config.windowMs;
    }

    // Check if limit is exceeded
    if (state.requests >= this.config.maxRequests) {
      return false;
    }

    // Increment request count
    state.requests++;
    this.limits.set(key, state);
    return true;
  }

  getRemainingRequests(key: string): number {
    const state = this.limits.get(key);
    if (!state) return this.config.maxRequests;
    return Math.max(0, this.config.maxRequests - state.requests);
  }

  getResetTime(key: string): number {
    const state = this.limits.get(key);
    if (!state) return Date.now() + this.config.windowMs;
    return state.resetTime;
  }
}

// Create rate limiters for each API
export const rateLimiters = {
  fmp: new RateLimiter({ maxRequests: 300, windowMs: 24 * 60 * 60 * 1000 }), // 300 requests per day
  alphaVantage: new RateLimiter({ maxRequests: 5, windowMs: 60 * 1000 }), // 5 requests per minute
  finnhub: new RateLimiter({ maxRequests: 60, windowMs: 60 * 1000 }), // 60 requests per minute
  coingecko: new RateLimiter({ maxRequests: 50, windowMs: 60 * 1000 }), // 50 requests per minute
};

// Middleware for Next.js API routes
export async function withRateLimit(
  req: Request,
  provider: keyof typeof rateLimiters
) {
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
  const key = `${provider}:${clientIp}`;

  const allowed = await rateLimiters[provider].checkLimit(key);
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        resetTime: rateLimiters[provider].getResetTime(key),
        remaining: rateLimiters[provider].getRemainingRequests(key),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimiters[provider].getRemainingRequests(key).toString(),
          'X-RateLimit-Reset': rateLimiters[provider].getResetTime(key).toString(),
        },
      }
    );
  }

  return null;
}
