import type { PostView } from "./post-view";

export type CreatePostInput = Pick<PostView, "type" | "content"> &
  Partial<Pick<PostView, "tags" | "mediaIds">> & {
    mentionedUserIds?: string[];
    communityId?: string;
  };
