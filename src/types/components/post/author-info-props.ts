import type { PostView } from "@/types/application/feed/post-view";

export type AuthorInfoProps = Pick<
  PostView,
  "authorUsername" | "authorName" | "authorAvatar" | "createdAt"
> & {
  fallbackClassName?: string;
};
