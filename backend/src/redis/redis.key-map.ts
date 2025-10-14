export interface UserSession {
  token: string;
  loginTime: number;
}
export interface PostData {
  title: string;
  views: number;
}
export interface UserProfile {
  name: string;
  email: string;
}
export interface RedisKeyMap {
  'user.session': UserSession;
  'post.data': PostData;
  'user.profile': UserProfile;
}

export type KeyPrefix = keyof RedisKeyMap;
