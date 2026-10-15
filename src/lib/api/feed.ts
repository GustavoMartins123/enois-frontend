import type { PageResponse } from "@/types/application/api/page-response";
import type { BulkDeleteInput } from "@/types/application/feed/bulk-delete-input";
import type { BulkDeleteResult } from "@/types/application/feed/bulk-delete-result";
import type { CreatePostInput } from "@/types/application/feed/create-post-input";
import type { DeleteResult } from "@/types/application/feed/delete-result";
import type { FeedTab } from "@/types/application/feed/feed-tab";
import type { PostView } from "@/types/application/feed/post-view";
import type { ReactionsResponse } from "@/types/application/feed/reactions-response";

import { api, buildQuery } from "../api-client";

export const feedApi = {
  list: (cursor?: string | null, limit = 20, tab?: FeedTab) =>
    api.get<PageResponse<PostView>>(`/feed${buildQuery({ cursor, limit, tab })}`),

  create: (data: CreatePostInput) => api.post<PostView>("/feed/posts", data),

  get: (postId: string) => api.get<PostView>(`/feed/posts/${postId}`),

  listByUser: (username: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<PostView>>(`/users/${username}/posts${buildQuery({ cursor, limit })}`),

  listByUserId: (userId: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<PostView>>(`/users/${userId}/posts${buildQuery({ cursor, limit })}`),

  update: (postId: string, data: { content: string; tags?: string[] }) =>
    api.patch<PostView>(`/feed/posts/${postId}`, data),

  /** Desfaz a exclusão do próprio post (soft delete reversível). */
  restore: (postId: string) => api.post<PostView>(`/feed/posts/${postId}/restore`),

  delete: (postId: string) => api.delete<DeleteResult>(`/feed/posts/${postId}`),

  listSaved: (cursor?: string | null, limit = 20) =>
    api.get<PageResponse<PostView>>(`/feed/saved${buildQuery({ cursor, limit })}`),

  listReactions: (postId: string) => api.get<ReactionsResponse>(`/feed/posts/${postId}/reactions`),

  bulkDelete: (data: BulkDeleteInput) =>
    api.post<BulkDeleteResult>("/feed/posts/bulk-delete", data),
};
