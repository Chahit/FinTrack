type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  private constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  public async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < ttl) {
      return cached.data;
    }

    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      // If there's cached data, return it even if expired
      if (cached) {
        console.warn(`Failed to fetch fresh data for ${key}, using stale data`);
        return cached.data;
      }
      throw error;
    }
  }

  public set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  public invalidateAll(): void {
    this.cache.clear();
  }

  public async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    return this.get(key, fetcher, ttl);
  }

  public async prefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: Date.now() });
    } catch (error) {
      console.error(`Failed to prefetch ${key}:`, error);
    }
  }
}

export const cache = Cache.getInstance(); 