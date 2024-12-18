/**
 * @module swr
 * 
 * 手撕可配置的基于LRU的SWR请求缓存机制
 */

declare global {
  var kvMap: Map<string, SwrRecord<unknown>>;
}

class SwrRecord<T> {
  value: T | undefined;
  promise: Promise<T> | undefined;
  timestamp!: number;

  constructor() {
    this.timestamp = Date.now();
  }
}

interface SwrParams {
  capacity?: number,
  defaultCacheTime?: number,
}

class LruCache<T> {
  cache!: Map<string, T>
  capacity!: number;

  constructor(cache: Map<string, T>, capacity?:number) {
    this.cache = cache;
    this.capacity = capacity || 0;
  }

  // 获取值
  get(key: string) {
    const value = this.cache.get(key);
    if (!value) {
      return undefined;
    }
    // 如果有缓存则将缓存移动到map末尾
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  // 设置值
  put(key: string, value: T) {
    const {cache, capacity} = this;
    if (cache.has(key)) {
      cache.delete(key);
    }
    // 如果缓存已满则删除map头部元素
    if (capacity > 0 && cache.size > capacity) {
      cache.delete(cache.keys().next().value!!);
    }
    cache.set(key, value);
  }

  // 删除值
  delete(key: string) {
    this.cache.delete(key);
  }
}

export class Swr {
  lruCache!: LruCache<SwrRecord<unknown>>;
  capacity!: number;
  defaultCacheTime!: number;

  constructor(swrParams: SwrParams) {
    this.lruCache = new LruCache(this.getKvMap(), swrParams.capacity);
    this.capacity = swrParams.capacity || 0;
    this.defaultCacheTime = swrParams.defaultCacheTime || 0;
  }

  private getKvMap() {
    globalThis.kvMap = globalThis.kvMap || new Map();
    return globalThis.kvMap;
  }

  public async swr<T>(key: string, fetcher: () => Promise<T>, cacheTime?: number): Promise<T> {
    let data = this.lruCache.get(key);

    // 缓存未命中 发起请求
    if (!data) {
      const swrRecord = new SwrRecord<T>();
      swrRecord.promise = fetcher()
        .then(val => {
          swrRecord.timestamp = Date.now();
          return swrRecord.value = val
        })
        .catch(e => {
          // 对于请求失败的场景不进行缓存
          this.lruCache.delete(key);
          throw e;
        });
      this.lruCache.put(key, swrRecord);
      return await swrRecord.promise;
    }

    // 缓存命中
    if (data.value) {
      // 检查缓存是否过期
      const duration = Date.now() - data.timestamp;
      if ((cacheTime || this.defaultCacheTime) != 0 &&
          duration > (cacheTime || this.defaultCacheTime)) {
        this.lruCache.delete(key);
        return await this.swr(key, fetcher, cacheTime);
      }
      // 缓存未过期直接返回
      return data.value as T;
    }
    else {
      // 请求未结束继续处理
      return await data.promise as T;
    }
  }
}
