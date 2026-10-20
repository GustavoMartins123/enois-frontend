import type { PostView } from "./post-view";

export type CreatePostInput = Pick<PostView, "type" | "content"> &
  Partial<Pick<PostView, "tags" | "mediaIds" | "pageHtml" | "articleBody">> & {
    mentionedUserIds?: string[];
    communityId?: string;
    /** Assunto do post AVULSO (um da taxonomia). Em comunidade o post herda o dela — não mande. */
    topic?: string;
  };
