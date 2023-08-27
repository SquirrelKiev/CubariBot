import { LRUCache } from "lru-cache";

const CACHE_SIZE = 50;
const TTL = 60 * 1000 * 60;

class Cache {
  private cache: LRUCache<string, any>;

  constructor(maxItems: number, ttl: number) {
    this.cache = new LRUCache({
      max: maxItems,
      ttl: ttl,
      dispose: (key, value) => {
        console.log(`Cache item evicted: ${key}`);
      },
    });
  }

  async get(key: string): Promise<any | undefined> {
    return this.cache.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    this.cache.set(key, value, { ttl: TTL });
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

class CachePool {
  private caches: Map<string, Cache>;

  constructor() {
    this.caches = new Map();
  }

  getCache(namespace: string): Cache {
    if (!this.caches.has(namespace)) {
      this.caches.set(namespace, new Cache(CACHE_SIZE, TTL));
    }

    return this.caches.get(namespace)!;
  }
}

const cachePool = new CachePool();

export default cachePool;
