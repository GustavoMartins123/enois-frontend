import type { PostView } from "./post-view";

export type CreatePostInput = Pick<PostView, "type" | "content"> &
  Partial<Pick<PostView, "tags" | "mediaIds" | "pageHtml">> & {
    mentionedUserIds?: string[];
    communityId?: string;
  };
