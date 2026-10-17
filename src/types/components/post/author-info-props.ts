import type { PostView } from "@/types/application/feed/post-view";

export type AuthorInfoProps = Pick<
  PostView,
  "authorUsername" | "authorName" | "authorAvatar" | "authorBadge" | "createdAt" | "community"
> & {
  fallbackClassName?: string;
  /** Chamado quando o leitor aperta "Seguir" na comunidade do post. */
  onFollowCommunity?: () => void;
  followPending?: boolean;
};
