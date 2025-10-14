import crypto from 'crypto';

const TOKEN_BYTES_LENGTH = 6;
const HASH_HEX_LENGTH = 16;

export function createToken(): string {
  const token = crypto.randomBytes(TOKEN_BYTES_LENGTH).toString('hex'); // 64字元隨機 token
  return token;
}
export function getTokenHash(token: string): string {
  const fullHash = crypto.createHash('sha256').update(token).digest('hex');
  return fullHash.substring(0, HASH_HEX_LENGTH);
}

export function createTokenAndHash(): { token: string; tokenHash: string } {
  const token = createToken();
  const tokenHash = getTokenHash(token);
  return { token, tokenHash };
}
