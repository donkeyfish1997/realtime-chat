import crypto from 'crypto';

export function createToken(): string {
  const token = crypto.randomBytes(32).toString('hex'); // 64字元隨機 token
  return token;
}
export function getTokenHash(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createTOkenAndHash(): { token: string; tokenHash: string } {
  const token = createToken();
  const tokenHash = getTokenHash(token);
  return { token, tokenHash };
}
