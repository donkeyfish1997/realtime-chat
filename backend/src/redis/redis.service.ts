import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import {
  StringKeyPrefix,
  RedisStringKeyMap,
  StroedSetKeyPrefix,
  RedisStoredSetKeyMap,
  HashKeyPrefix,
  RedisHashKeyMap,
} from './type';

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
  public async set<P extends StringKeyPrefix, ID extends string | number>(
    prefix: P,
    id: ID,
    value: RedisStringKeyMap[P], // 這裡自動限定了 value 必須符合 P 對應的類型
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
  public async get<P extends StringKeyPrefix, ID extends string | number>(
    prefix: P,
    id: ID,
  ): Promise<RedisStringKeyMap[P] | null> {
    const key = `${prefix}:${id}`;
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as RedisStringKeyMap[P];
    } catch (e) {
      console.error(`Error parsing JSON for key ${key}:`, e);
      return null;
    }
  }
  public async del<P extends StringKeyPrefix, ID extends string | number>(
    prefix: P,
    id: ID,
  ): Promise<number> {
    const key = `${prefix}:${id}`;
    return await this.client.del(key);
  }

  public async zadd<P extends StroedSetKeyPrefix, ID extends string | number>(
    prefix: P,
    id: ID,
    members: { score: number; value: RedisStoredSetKeyMap[P] }[],
  ): Promise<void> {
    const key = `${prefix}:${id}`;
    const inputMembers = members.map((m) => ({
      score: m.score,
      value: JSON.stringify(m.value),
    }));
    await this.client.zAdd(key, inputMembers);
  }
  public async zRange<P extends StroedSetKeyPrefix, ID extends string | number>(
    prefix: P,
    id: ID,
    min: number | '-',
    max: number | '+',
    option?: Parameters<typeof this.client.zRange>[3],
  ): Promise<RedisStoredSetKeyMap[P][]> {
    const key = `${prefix}:${id}`;
    const infos = await this.client.zRange(key, min, max, option);
    return infos.map((i) => JSON.parse(i) as RedisStoredSetKeyMap[P]);
  }
  public async zRangeWithScores<
    P extends StroedSetKeyPrefix,
    ID extends string | number,
  >(
    prefix: P,
    id: ID,

    min: number | '-inf' | '+inf',
    max: number | '-inf' | '+inf',
    option?: Parameters<typeof this.client.zRange>[3],
  ): Promise<{ value: RedisStoredSetKeyMap[P]; score: number }[]> {
    const key = `${prefix}:${id}`;
    const infos = await this.client.zRangeWithScores(key, min, max, option);
    return infos.map((i) => ({
      score: i.score,
      value: JSON.parse(i.value) as RedisStoredSetKeyMap[P],
    }));
  }
  public async hSet<P extends HashKeyPrefix, ID extends string | number>(
    prefix: P,
    id: ID,
    fields: Partial<RedisHashKeyMap[P]>,
  ): Promise<void> {
    const key = `${prefix}:${id}`;
    const inputField: Record<string, string | number> = {};
    for (const key in fields) {
      inputField[key] = JSON.stringify(fields[key]);
    }
    await this.client.hSet(key, inputField);
  }
  public async hMGet<
    P extends HashKeyPrefix,
    ID extends string | number,
    F extends keyof RedisHashKeyMap[P],
    Fields extends F[],
  >(
    prefix: P,
    id: ID,
    fields: Fields, // 傳入欄位陣列
  ): Promise<{
    [K in keyof Fields & number as Fields[K]]:
      | RedisHashKeyMap[P][Fields[K]]
      | null;
  }> {
    const key = `${prefix}:${id}`;
    const hmGetResult = await this.client.hmGet(key, fields as string[]);
    const results: Partial<RedisHashKeyMap[P]> = {};
    fields.forEach((fieldName, index) => {
      const value = hmGetResult[index];
      results[fieldName] = value
        ? (JSON.parse(value) as RedisHashKeyMap[P][F])
        : undefined;
    });
    return results as unknown as {
      [K in keyof Fields & number as Fields[K]]:
        | RedisHashKeyMap[P][Fields[K]]
        | null;
    };
  }
  public async hIncrby<P extends HashKeyPrefix, ID extends string | number>(
    prefix: P,
    id: ID,
    field: keyof RedisHashKeyMap[P],
    increment: number,
  ): Promise<number> {
    const key = `${prefix}:${id}`;
    return await this.client.hIncrBy(key, field as string, increment);
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
