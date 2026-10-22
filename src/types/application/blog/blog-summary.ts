export type BlogSummary = {
  slug: string;
  title: string;
  description: string | null;
  authorName: string;
  authorUsername: string;
  authorAvatar: string | null;
  posts: number;
};
