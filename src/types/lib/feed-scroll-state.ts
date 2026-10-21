import type { HomeTab } from "@/types/routes/feed/home-tab";

export type FeedScrollState = {
  tab: HomeTab;
  postId: string;
  scrollY: number;
};
