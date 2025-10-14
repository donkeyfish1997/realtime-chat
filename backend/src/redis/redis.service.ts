import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import { KeyPrefix, RedisKeyMap } from './redis.key-map';

const REDIS_PASSWORD = process.env.REDIS_PASSWORD; //defined in doker-compose
if (!REDIS_PASSWORD) throw new Error('can not find env.REDIS_PASSWORD');
const REDIS_URL = process.env.REDIS_URL; //defined in doker-compose
if (!REDIS_URL) throw new Error('can not find env.REDIS_URL');
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: ReturnType<typeof createClient>;
  constructor() {
    this.client = createClient({ url: REDIS_URL, password: REDIS_PASSWORD });
    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }
  public getClient(): ReturnType<typeof createClient> {
    return this.client;
  }
  /**
   * 通用方法：儲存任何 JSON 格式的數據到 Redis。
   *
   * @param prefix 鍵的前綴 (必須是 RedisKeyMap 中定義的類型，例如 'user:session')
   * @param id 該記錄的唯一 ID
   * @param value 數據物件 (類型從 KeyMap 推導出來)
   * @param ttlSeconds 可選：過期時間（秒）
   */
  public async set<P extends KeyPrefix, ID extends string | number>(
    prefix: P,
    id: ID,
    value: RedisKeyMap[P], // 這裡自動限定了 value 必須符合 P 對應的類型
    ttlSeconds?: number,
  ): Promise<void> {
    const key = `${prefix}:${id}`;
    const stringValue = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, stringValue, { EX: ttlSeconds });
    } else {
      await this.client.set(key, stringValue);
    }
  }

  /**
   * 通用方法：從 Redis 檢索 JSON 數據並自動反序列化。
   *
   * @param prefix 鍵的前綴 (必須是 RedisKeyMap 中定義的類型)
   * @param id 該記錄的唯一 ID
   * @returns 數據物件 (類型從 KeyMap 推導出來) 或 null
   */
  public async get<P extends KeyPrefix, ID extends string | number>(
    prefix: P,
    id: ID,
  ): Promise<RedisKeyMap[P] | null> {
    const key = `${prefix}:${id}`;
    const value = await this.client.get(key);

    if (!value) {
      return null;
    }

    try {
      // 將字串解析為 RedisKeyMap[P] 類型
      return JSON.parse(value) as RedisKeyMap[P];
    } catch (e) {
      console.error(`Error parsing JSON for key ${key}:`, e);
      return null;
    }
  }
  async onModuleInit() {
    try {
      await this.client.connect();
    } catch (e) {
      console.error('RedisService: Failed to connect to Redis.', e);
    }
  }

  async onModuleDestroy() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}
