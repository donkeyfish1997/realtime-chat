export type User = {
  id: string;
  name?: string;
  email: string;
  img?: string;
  lastMessage?: string;
};
export type Message = { email: string; message: string; img?: string };
