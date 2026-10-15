import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { usePostCardStore } from "@/stores/post-card.store";
import { texts } from "@/texts";
import type { CommentView } from "@/types/application/comment/comment-view";
import type { PostIdProps } from "@/types/components/post/post-id-props";
import { Loader2, Send, X } from "lucide-react";

import { commentsApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/current-user";
import { useAuth } from "@/lib/use-auth";

import { Button } from "@/components/ui/button";

import { MentionTextarea } from "@/components/mention-textarea";
import { UserAvatar } from "@/components/user-avatar";

import { CommentItem } from "./comment-item";

const PAGE_SIZE = 20;

/**
 * Comentarios de um post.
 *
 * A lista tem altura maxima com scroll proprio (comentario longo nao empurra o resto do card
 * para fora da tela) e o campo de escrita fica sempre visivel abaixo. Como a API devolve os
 * mais recentes primeiro, "ver comentarios anteriores" carrega a proxima pagina e acrescenta no
 * fim; respostas cujo comentario pai ainda nao foi carregado aparecem como raiz para nao sumirem.
 */
export function PostComments({ postId }: PostIdProps) {
  const currentUser = getCurrentUser();
  const { requireAuth } = useAuth();
  const comments = usePostCardStore((state) => state.cards[postId]?.localComments ?? []);
  const draft = usePostCardStore((state) => state.cards[postId]?.draft ?? "");
  const mentions = usePostCardStore((state) => state.cards[postId]?.commentMentions ?? []);
  const replyToId = usePostCardStore((state) => state.cards[postId]?.replyToId ?? null);
  const setComments = usePostCardStore((state) => state.setComments);
  const addComment = usePostCardStore((state) => state.addComment);
  const setDraft = usePostCardStore((state) => state.setDraft);
  const setCommentMentions = usePostCardStore((state) => state.setCommentMentions);
  const setReplyToId = usePostCardStore((state) => state.setReplyToId);
  const updateCommentCount = usePostCardStore((state) => state.updateCommentCount);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await commentsApi.list(postId, null, PAGE_SIZE);
      setComments(postId, page.items);
      setCursor(page.nextCursor);
      setHasMore(Boolean(page.nextCursor));
    } catch {
      setError(texts.posts.comments.error);
    } finally {
      setLoading(false);
    }
  }, [postId, setComments]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await commentsApi.list(postId, cursor, PAGE_SIZE);
      setComments(postId, [...comments, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(Boolean(page.nextCursor));
    } catch {
      setError(texts.posts.comments.error);
    } finally {
      setLoadingMore(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    // Comentar e uma acao: sem sessao (link compartilhado aberto por outra pessoa) vai para o login.
    if (!requireAuth()) return;

    setSending(true);
    try {
      const created = await commentsApi.create(postId, content, replyToId, mentions);
      addComment(postId, created);
      updateCommentCount(postId, 1);
      setDraft(postId, "");
      setCommentMentions(postId, []);
      setReplyToId(postId, null);
      // O comentario novo entra no topo; rola a lista para o usuario ver.
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(texts.posts.comments.error);
    } finally {
      setSending(false);
    }
  };

  const byId = new Map<string, CommentView>(comments.map((comment) => [comment.id, comment]));
  // Raizes: sem pai ou com o pai fora do que ja foi carregado (resposta orfa nao pode sumir).
  const roots = comments.filter(
    (comment) => !comment.parentCommentId || !byId.has(comment.parentCommentId),
  );
  const replyToName = replyToId ? byId.get(replyToId)?.authorName : undefined;

  return (
    <section className="mt-4 border-t border-border-soft pt-4">
      <div
        ref={listRef}
        className="max-h-[55vh] min-h-0 space-y-3 overflow-y-auto overscroll-contain pr-1"
      >
        {loading && (
          <p className="inline-flex items-center gap-2 py-4 text-[13px] font-light text-text-subtle">
            <Loader2 className="h-4 w-4 animate-spin" />

            <>{texts.posts.comments.loading}</>
          </p>
        )}

        {!loading && error && (
          <div className="py-4 text-center">
            <p className="text-[13px] font-light text-destructive">{error}</p>

            <Button
              variant="outline"
              size="sm"
              className="mt-2 rounded-full"
              onClick={loadFirstPage}
            >
              {texts.posts.comments.retry}
            </Button>
          </div>
        )}

        {!loading && !error && roots.length === 0 && (
          <p className="py-4 text-center text-[13px] font-light text-text-subtle">
            {texts.posts.comments.empty}
          </p>
        )}

        {!loading &&
          !error &&
          roots.map((comment) => {
            const replies = comments.filter((c) => c.parentCommentId === comment.id);
            return (
              <div key={comment.id}>
                <CommentItem comment={comment} />

                {replies.length > 0 && (
                  <div className="ml-10 mt-2 space-y-2 border-l-2 border-border-soft pl-4">
                    {replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        replyingTo={byId.get(reply.parentCommentId ?? "")?.authorName}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {!loading && !error && hasMore && (
          <div className="pt-1 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-[13px] font-light text-primary"
              disabled={loadingMore}
              onClick={loadMore}
            >
              {loadingMore ? texts.posts.comments.loadingMore : texts.posts.comments.loadMore}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="mt-4 flex items-center gap-2.5">
        <UserAvatar
          src={currentUser?.avatar}
          alt={currentUser?.name}
          className="h-8 w-8 shrink-0"
        />

        <div className="min-w-0 flex-1">
          {replyToId && (
            <div className="mb-1 flex items-center gap-2 pl-4 text-[11px] font-light text-primary">
              <span className="truncate">
                {replyToName
                  ? texts.posts.comments.replyingTo(replyToName)
                  : texts.posts.comments.reply}
              </span>

              <button
                type="button"
                onClick={() => setReplyToId(postId, null)}
                className="shrink-0 text-text-subtle hover:text-foreground"
                aria-label={texts.posts.comments.cancelReply}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 rounded-2xl border border-border-soft bg-surface-1 py-2 pl-4 pr-2">
            <MentionTextarea
              value={draft}
              onChange={(value, ids) => {
                setDraft(postId, value);
                setCommentMentions(postId, ids);
              }}
              placeholder={texts.posts.comments.placeholder}
              className="flex-1 resize-none border-0 bg-transparent p-0 text-[13px] font-light outline-none"
              maxLength={280}
            />

            <Button
              type="submit"
              size="icon"
              className="h-7 w-7 shrink-0 rounded-full"
              disabled={!draft.trim() || sending}
              aria-label={texts.posts.comments.send}
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
