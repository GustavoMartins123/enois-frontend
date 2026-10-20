/** Membro do grupo, com o papel dele. */
export type GroupMember = {
  userId: string;
  username: string | null;
  name: string | null;
  avatar: string | null;
  role: "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER";
  joinedAt: string;
};
