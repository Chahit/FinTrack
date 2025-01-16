import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redis.on('error', (error: Error) => {
  console.error('Redis Client Error:', error);
});

redis.on('connect', () => {
  console.log('Redis Client Connected');
});

redis.on('ready', () => {
  console.log('Redis Client Ready');
});

redis.on('reconnecting', () => {
  console.log('Redis Client Reconnecting');
});

export { redis };

interface CacheValue {
  data: unknown;
  expiresAt?: number;
}

export const CACHE_KEYS = {
  PORTFOLIO: (userId: string) => `portfolio:${userId}`,
  PORTFOLIO_ANALYSIS: (userId: string) => `portfolio:analysis:${userId}`,
  MARKET_DATA: (symbol: string) => `market:${symbol}`,
  ALERTS: (userId: string) => `alerts:${userId}`,
  CHAT_MESSAGES: (roomId: string) => `chat:${roomId}`,
} as const;

export const cacheWrapper = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;

      const cached = JSON.parse(data) as CacheValue;
      if (cached.expiresAt && Date.now() > cached.expiresAt) {
        await redis.del(key);
        return null;
      }

      return cached.data as T;
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: unknown, expireSeconds?: number): Promise<void> {
    try {
      const cacheValue: CacheValue = {
        data: value,
        ...(expireSeconds && { expiresAt: Date.now() + expireSeconds * 1000 }),
      };

      const stringValue = JSON.stringify(cacheValue);
      if (expireSeconds) {
        await redis.setex(key, expireSeconds, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error);
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`Error invalidating pattern ${pattern}:`, error);
    }
  },

  async pushToList(key: string, value: unknown): Promise<void> {
    try {
      await redis.lpush(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error pushing to list ${key}:`, error);
    }
  },

  async getList<T>(key: string, start = 0, end = -1): Promise<T[]> {
    try {
      const data = await redis.lrange(key, start, end);
      return data.map(item => JSON.parse(item));
    } catch (error) {
      console.error(`Error getting list ${key}:`, error);
      return [];
    }
  },

  async trimList(key: string, start: number, end: number): Promise<void> {
    try {
      await redis.ltrim(key, start, end);
    } catch (error) {
      console.error(`Error trimming list ${key}:`, error);
    }
  },

  async addToSortedSet(key: string, score: number, value: string): Promise<void> {
    try {
      await redis.zadd(key, score, value);
    } catch (error) {
      console.error(`Error adding to sorted set ${key}:`, error);
    }
  },

  async getRangeFromSortedSet(
    key: string,
    start = 0,
    end = -1,
    withScores = false
  ): Promise<string[] | Array<{ value: string; score: number }>> {
    try {
      if (withScores) {
        const results = await redis.zrange(key, start, end, 'WITHSCORES');
        const formatted: Array<{ value: string; score: number }> = [];
        
        for (let i = 0; i < results.length; i += 2) {
          formatted.push({
            value: results[i],
            score: parseFloat(results[i + 1]),
          });
        }
        
        return formatted;
      }
      
      return redis.zrange(key, start, end);
    } catch (error) {
      console.error(`Error getting range from sorted set ${key}:`, error);
      return [];
    }
  },

  async setHash(key: string, field: string, value: unknown): Promise<void> {
    try {
      await redis.hset(key, field, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting hash ${key}:${field}:`, error);
    }
  },

  async getHash<T>(key: string, field: string): Promise<T | null> {
    try {
      const data = await redis.hget(key, field);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error getting hash ${key}:${field}:`, error);
      return null;
    }
  },

  async getAllHash<T>(key: string): Promise<Record<string, T>> {
    try {
      const data = await redis.hgetall(key);
      const result: Record<string, T> = {};
      
      for (const [field, value] of Object.entries(data)) {
        result[field] = JSON.parse(value) as T;
      }
      
      return result;
    } catch (error) {
      console.error(`Error getting all hash ${key}:`, error);
      return {};
    }
  },
};

// Handle cleanup on app termination
const cleanup = async () => {
  if (redis) {
    await redis.quit();
  }
};

process.on('beforeExit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
