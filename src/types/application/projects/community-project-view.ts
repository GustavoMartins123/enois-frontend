export type CommunityProjectView = {
  id: string;
  userId: string;
  username: string | null;
  slug: string;
  title: string;
  description: string | null;
  shortDescription: string | null;
  cover: string | null;
  url: string | null;
  repoUrl: string | null;
  tags: string | null;
  category: string | null;
  status: "SUBMITTED" | "PUBLISHED" | "REJECTED" | "SUSPENDED";
  reviewNote: string | null;
  submittedAt: string;
  publishedAt: string | null;
  owned: boolean;
};
