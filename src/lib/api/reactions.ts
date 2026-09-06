import { texts } from "@/texts";

import { api } from "../api-client";

export const REACTION_EMOJIS = texts.posts.reactions.emojis;

export type ReactionType = keyof typeof REACTION_EMOJIS;

export interface ActionResponse {
  postId: string;
  status: string;
  counters: {
    reactions: number;
    comments: number;
    saves: number;
    shares: number;
  };
}

export interface ReactionItem {
  userId: string;
  type: string;
  createdAt: string;
}

function postReaction(path: string, type: ReactionType) {
  return api.post<Partial<ActionResponse>>(path, { type });
}

function removeReaction(path: string) {
  return api.delete<Partial<ActionResponse>>(path);
}

export interface ReactionsListResponse {
  postId?: string;
  summary: Record<string, number>;
  reactions: ReactionItem[];
}

function listReactions(path: string) {
  return api.get<ReactionsListResponse>(path);
}

export const reactionsApi = {
  react: (postId: string, type: ReactionType) =>
    postReaction(`/feed/posts/${postId}/reactions`, type),

  removeReaction: (postId: string) => removeReaction(`/feed/posts/${postId}/reactions`),

  listReactions: (postId: string) => listReactions(`/feed/posts/${postId}/reactions`),

  reactComment: (postId: string, commentId: string, type: ReactionType) =>
    postReaction(`/feed/posts/${postId}/comments/${commentId}/reactions`, type),

  removeCommentReaction: (postId: string, commentId: string) =>
    removeReaction(`/feed/posts/${postId}/comments/${commentId}/reactions`),

  listCommentReactions: (postId: string, commentId: string) =>
    listReactions(`/feed/posts/${postId}/comments/${commentId}/reactions`),

  save: (postId: string) => api.post<ActionResponse>(`/feed/posts/${postId}/saves`),

  removeSave: (postId: string) => api.delete<ActionResponse>(`/feed/posts/${postId}/saves`),

  share: (postId: string) => api.post<ActionResponse>(`/feed/posts/${postId}/shares`),
};
