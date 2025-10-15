type RefreshTokenHash = string;
type UserId = string;
export interface VerificationToken {
  userId: string;
  tokenHash: string;
}

export interface RedisStringKeyMap {
  'email.verify:identifer': VerificationToken; //identifer
  'password.reset:identifer': VerificationToken; //identifer
  'change.email:identifer': VerificationToken; //identifer
  'active.refresh.tokenHash:userId': RefreshTokenHash;
  'refresh:tokenHash': UserId;
}

export type StringKeyPrefix = keyof RedisStringKeyMap;
