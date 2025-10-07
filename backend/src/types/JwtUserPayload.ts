export interface JwtUserPayload {
  id: string;
  emailVerified: Date | null;
  email: string;
  name: string | null;
  image: string | null;
}
