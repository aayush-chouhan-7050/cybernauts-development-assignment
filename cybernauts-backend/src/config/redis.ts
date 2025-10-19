// src/config/redis.ts
import Redis from 'ioredis';

let redisClient: Redis | null = null;
let redisPubClient: Redis | null = null;
let redisSubClient: Redis | null = null;

const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Channels for pub/sub
export const CHANNELS = {
  USER_CREATED: 'user:created',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',
  USER_LINKED: 'users:linked',
  USER_UNLINKED: 'users:unlinked',
  CACHE_INVALIDATE: 'cache:invalidate',
};

// Initialize Redis clients
export const initRedis = async (): Promise<void> => {
  if (!REDIS_ENABLED) {
    console.log('⚠️  Redis is disabled. State will not be synchronized across workers.');
    return;
  }

  try {
    // Main client for general operations
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    // Publisher client
    redisPubClient = new Redis(REDIS_URL);

    // Subscriber client (separate connection required)
    redisSubClient = new Redis(REDIS_URL);

    redisClient.on('connect', () => {
      console.log('✅ Redis main client connected');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis client error:', err.message);
    });

    redisPubClient.on('connect', () => {
      console.log('✅ Redis publisher connected');
    });

    redisSubClient.on('connect', () => {
      console.log('✅ Redis subscriber connected');
    });

    // Wait for connections
    await Promise.all([
      redisClient.ping(),
      redisPubClient.ping(),
      redisSubClient.ping(),
    ]);

    console.log('🔴 Redis is ready for state synchronization');
  } catch (error: any) {
    console.error('❌ Failed to connect to Redis:', error.message);
    console.log('⚠️  Continuing without Redis. State will not be synchronized.');
    redisClient = null;
    redisPubClient = null;
    redisSubClient = null;
  }
};

// Close Redis connections
export const closeRedis = async (): Promise<void> => {
  if (redisClient) await redisClient.quit();
  if (redisPubClient) await redisPubClient.quit();
  if (redisSubClient) await redisSubClient.quit();
  console.log('👋 Redis connections closed');
};

// Get Redis clients
export const getRedisClient = () => redisClient;
export const getRedisPubClient = () => redisPubClient;
export const getRedisSubClient = () => redisSubClient;

// Check if Redis is available
export const isRedisAvailable = (): boolean => {
  return REDIS_ENABLED && redisClient !== null;
};

// Publish event to all workers
export const publishEvent = async (
  channel: string,
  data: any
): Promise<void> => {
  if (!isRedisAvailable() || !redisPubClient) return;

  try {
    await redisPubClient.publish(channel, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to publish event:', error);
  }
};

// Subscribe to events
export const subscribeToEvents = async (
  callback: (channel: string, message: any) => void
): Promise<void> => { 
  if (!isRedisAvailable() || !redisSubClient) return;

  // Subscribe to all channels
  await redisSubClient.subscribe(...Object.values(CHANNELS));

  redisSubClient.on('message', (channel, message) => {
    try {
      const data = JSON.parse(message);
      callback(channel, data);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  });
};

// Cache operations with TTL
export const cacheSet = async (
  key: string,
  value: any,
  ttlSeconds: number = 300
): Promise<void> => { 
  if (!isRedisAvailable() || !redisClient) return;

  try {
    await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const cacheGet = async (key: string): Promise<any | null> => { 
  if (!isRedisAvailable() || !redisClient) return null;

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const cacheDelete = async (key: string): Promise<void> => {
  if (!isRedisAvailable() || !redisClient) return;

  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};

export const cacheInvalidatePattern = async (
  pattern: string
): Promise<void> => {
  if (!isRedisAvailable() || !redisClient) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidate error:', error);
  }
};