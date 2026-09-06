import type { PageResponse } from "@/types/application/api/page-response";
import type { StatusResponse } from "@/types/application/api/status-response";
import type { CommentView } from "@/types/application/comment/comment-view";

import { api, buildQuery } from "../api-client";

export const commentsApi = {
  create: (
    postId: string,
    content: string,
    parentCommentId?: string | null,
    mentionedUserIds?: string[],
  ) =>
    api.post<CommentView>(`/feed/posts/${postId}/comments`, {
      content,
      parentCommentId: parentCommentId ?? null,
      mentionedUserIds: mentionedUserIds ?? [],
    }),

  list: (postId: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<CommentView>>(
      `/feed/posts/${postId}/comments${buildQuery({ cursor, limit })}`,
    ),

  remove: (postId: string, commentId: string) =>
    api.delete<StatusResponse>(`/feed/posts/${postId}/comments/${commentId}`),
};
