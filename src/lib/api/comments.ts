import { api, buildQuery } from "../api-client";

export interface CommentView {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  status: "ACTIVE" | "DELETED";
}

export interface PageResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export const commentsApi = {
  create: (postId: string, content: string, parentCommentId?: string | null) =>
    api.post<CommentView>(`/feed/posts/${postId}/comments`, {
      content,
      parentCommentId: parentCommentId ?? null,
    }),

  list: (postId: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<CommentView>>(
      `/feed/posts/${postId}/comments${buildQuery({ cursor, limit })}`,
    ),

  remove: (postId: string, commentId: string) =>
    api.delete<{ status: string }>(`/feed/posts/${postId}/comments/${commentId}`),
};
