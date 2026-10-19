export type NetworkUser = {
  id: string;
  username: string;
  name: string;
  headline: string;
  avatar: string | null;
  avatarFrame?: string | null;
  connections: number;
  followers: number;
  connected: boolean;
};
