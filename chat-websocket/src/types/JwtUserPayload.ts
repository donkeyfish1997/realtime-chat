export interface JwtUserPayload {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
}
