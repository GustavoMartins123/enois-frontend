import { api, buildQuery } from "../api-client";

export interface PostView {
  id: string;
  authorId: string;
  type: "INSIGHT" | "ARTICLE" | "QUESTION" | "PROJECT" | "OPPORTUNITY";
  content: string;
  tags: string[];
  mediaIds: string[];
  createdAt: string;
  visibility: "PUBLIC" | "CONNECTIONS" | "MENTORS";
  counters: {
    reactions: number;
    comments: number;
    saves: number;
    shares: number;
  };
  status: "ACTIVE" | "DELETED";
}

export interface PageResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export interface CreatePostInput {
  type: PostView["type"];
  content: string;
  tags?: string[];
  mediaIds?: string[];
  communityId?: string;
}

export interface DeleteResult {
  postId: string;
  status: string;
}

export interface BulkDeleteInput {
  postIds: string[];
  reason: string;
}

export interface BulkDeleteResult {
  status: string;
  results: DeleteResult[];
}

export const feedApi = {
  list: (cursor?: string | null, limit = 20) =>
    api.get<PageResponse<PostView>>(`/feed${buildQuery({ cursor, limit })}`),

  create: (data: CreatePostInput) => api.post<PostView>("/feed/posts", data),

  listByUser: (username: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<PostView>>(`/users/${username}/posts${buildQuery({ cursor, limit })}`),

  delete: (postId: string) => api.delete<DeleteResult>(`/feed/posts/${postId}`),

  bulkDelete: (data: BulkDeleteInput) =>
    api.post<BulkDeleteResult>("/feed/posts/bulk-delete", data),
};
