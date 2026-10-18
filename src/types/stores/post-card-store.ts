import type { CommentView } from "@/types/application/comment/comment-view";
import type { PostView } from "@/types/application/feed/post-view";
import type { ReactionType } from "@/types/application/reaction/reaction-type";
import type { PostCardState } from "@/types/stores/post-card-state";

/**
 * O estado dos cards de post: um por post, pela chave do id.
 *
 * O tipo existe para o store não ser `unknown` — sem ele, cada seletor (`state.cards[postId]`)
 * virava um erro de tipo em quem lesse o store, e o mesmo post aberto em duas telas (o feed e o
 * post do blog) precisa do MESMO estado: é aqui que a conversa aberta numa aparece na outra.
 */
export type PostCardStore = {
  cards: Record<string, PostCardState>;
  initializePostCard: (post: PostView) => void;
  disposePostCard: (postId: string) => void;
  setDraft: (postId: string, draft: string) => void;
  setCommentMentions: (postId: string, commentMentions: string[]) => void;
  setReplyToId: (postId: string, replyToId: string | null) => void;
  setComments: (postId: string, localComments: CommentView[]) => void;
  addComment: (postId: string, comment: CommentView) => void;
  removeComment: (postId: string, commentId: string) => void;
  updateCommentCount: (postId: string, delta: number) => void;
  setPostCounters: (postId: string, postCounters: PostView["counters"]) => void;
  setReactionStatus: (postId: string, reactionStatus: ReactionType | null) => void;
  setShowReactions: (postId: string, showReactions: boolean) => void;
  setShowSeals: (postId: string, showSeals: boolean) => void;
  setShowReport: (postId: string, showReport: boolean) => void;
};
