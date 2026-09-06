import { createStore } from "zustand/vanilla";

import type { CommentView, PostView } from "@/lib/api";

export function createPostCardStore(post: PostView) {
  return createStore((set) => ({
    postId: post.id,
    draft: "",
    commentMentions: [] as string[],
    replyToId: null as string | null,
    localComments: [] as CommentView[],
    postCounters: post.counters,
    reactionStatus: post.currentUserReaction ?? null,
    showReactions: false,
    showReport: false,

    setDraft: (draft: string) => set({ draft }),
    setCommentMentions: (commentMentions: string[]) => set({ commentMentions }),
    setReplyToId: (replyToId: string | null) => set({ replyToId }),
    setComments: (localComments: CommentView[]) => set({ localComments }),
    addComment: (comment: CommentView) =>
      set((state) => ({
        localComments: [...state.localComments, comment],
      })),
    removeComment: (commentId: string) =>
      set((state) => ({
        localComments: state.localComments.filter((comment) => comment.id !== commentId),
      })),
    updateCommentCount: (delta: number) =>
      set((state) => ({
        postCounters: {
          ...state.postCounters,
          comments: state.postCounters.comments + delta,
        },
      })),
    setPostCounters: (postCounters: PostView["counters"]) => set({ postCounters }),
    setReactionStatus: (reactionStatus: string | null) => set({ reactionStatus }),
    setShowReactions: (showReactions: boolean) => set({ showReactions }),
    setShowReport: (showReport: boolean) => set({ showReport }),
  }));
}
