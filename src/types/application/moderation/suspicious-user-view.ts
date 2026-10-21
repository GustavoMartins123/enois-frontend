export type SuspiciousUserView = {
  username: string;
  name: string;
  createdAt: string;
  emailVerified: boolean;
  posts: number;
  comments: number;
  reportsAgainst: number;
  riskScore: number;
  signals: string[];
};
