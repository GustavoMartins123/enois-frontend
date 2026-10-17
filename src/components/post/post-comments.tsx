import { type ChangeEvent, type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { usePostCardStore } from "@/stores/post-card.store";
import { texts } from "@/texts";
import type { CommentView } from "@/types/application/comment/comment-view";
import type { PostIdProps } from "@/types/components/post/post-id-props";
import type { MediaItem } from "@/types/routes/feed/media-item";
import { Image, Loader2, Send, X } from "lucide-react";

import { commentsApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/current-user";
import { useAuth } from "@/lib/use-auth";
import { useMediaUpload } from "@/lib/use-media-upload";

import { Button } from "@/components/ui/button";

import { MentionTextarea } from "@/components/mention-textarea";
import { UserAvatar } from "@/components/user-avatar";

import { CommentItem } from "./comment-item";
import { GifPickerDialog } from "./gif-picker-dialog";

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
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [gifOpen, setGifOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useMediaUpload();

  const addMedia = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    event.target.value = "";
    if (files.length === 0) return;
    setMedia((current) => {
      const room = 4 - current.length;
      if (room <= 0) {
        setError(texts.posts.comments.mediaLimit);
        return current;
      }
      setError(null);
      return [...current, ...files.slice(0, room).map((file) => ({
        type: "image" as const, file, preview: URL.createObjectURL(file),
      }))];
    });
  };

  // O GIF entra como URL no proprio texto do comentario — o link-previews transforma em imagem — e
  // e assim que ele sempre funcionou aqui. Quem escolhe a URL e o seletor (busca no provedor ou link
  // colado no modo alternativo), que ja entrega so link aceito.
  const addGif = (url: string) => {
    setDraft(postId, draft ? `${draft}\n${url}` : url);
  };

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

    if (posting) return;
    setPosting(true);
    setSending(true);
    try {
      let mediaIds: string[] = [];
      if (media.length > 0) {
        const results = await upload.uploadAll(media.map((m) => ({ file: m.file })));
        mediaIds = results.map((r) => r.mediaId);
      }
      const created = await commentsApi.create(postId, content, replyToId, mentions, mediaIds);
      addComment(postId, created);
      updateCommentCount(postId, 1);
      setDraft(postId, "");
      setCommentMentions(postId, []);
      setReplyToId(postId, null);
      media.forEach((m) => URL.revokeObjectURL(m.preview));
      setMedia([]);
      // O comentario novo entra no topo; rola a lista para o usuario ver.
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(media.length > 0 ? texts.posts.comments.uploadFailed : texts.posts.comments.error);
    } finally {
      setPosting(false);
      setSending(false);
    }
  };

  const byId = new Map<string, CommentView>(comments.map((comment) => [comment.id, comment]));
  // Resolve a raiz de cada comentario subindo pelos pais ja carregados. Assim uma resposta a uma
  // resposta continua aparecendo sob o mesmo comentario-raiz — antes ela nao era renderizada
  // (nao era raiz nem resposta direta da raiz) e parecia que "nao renderizava".
  const rootIdByComment = new Map<string, string>();
  for (const comment of comments) {
    let currentId = comment.id;
    let parentId = comment.parentCommentId;
    const guard = new Set<string>();
    while (parentId && byId.has(parentId) && !guard.has(currentId)) {
      guard.add(currentId);
      currentId = parentId;
      parentId = byId.get(parentId)?.parentCommentId ?? null;
    }
    rootIdByComment.set(comment.id, currentId);
  }
  const roots = comments.filter((comment) => rootIdByComment.get(comment.id) === comment.id);
  const replyToName = replyToId ? byId.get(replyToId)?.authorName : undefined;

  return (
    <section className="mt-4 border-t border-border-soft pt-4">
      <div
        ref={listRef}
        className="max-h-[55vh] min-h-0 space-y-3 overflow-y-auto overscroll-contain pr-1"
      >
        {loading && (
          <p className="inline-flex items-center gap-2 py-4 text-sm font-normal text-text-subtle">
            <Loader2 className="h-4 w-4 animate-spin" />

            <>{texts.posts.comments.loading}</>
          </p>
        )}

        {!loading && error && (
          <div className="py-4 text-center">
            <p className="text-sm font-normal text-destructive">{error}</p>

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
          <p className="py-4 text-center text-sm font-normal text-text-subtle">
            {texts.posts.comments.empty}
          </p>
        )}

        {!loading &&
          !error &&
          roots.map((comment) => {
            const replies = comments.filter(
              (c) => c.id !== comment.id && rootIdByComment.get(c.id) === comment.id,
            );
            return (
              <div key={comment.id}>
                <CommentItem comment={comment} />

                {replies.length > 0 && (
                  <div className="ml-6 mt-2 space-y-2 border-l-2 border-border-soft pl-3 sm:ml-10 sm:pl-4">
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
              className="rounded-full text-sm font-normal text-primary"
              disabled={loadingMore}
              onClick={loadMore}
            >
              {loadingMore ? texts.posts.comments.loadingMore : texts.posts.comments.loadMore}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="mt-4 flex items-start gap-2 sm:gap-2.5">
        <UserAvatar
          src={currentUser?.avatar}
          alt={currentUser?.name}
          className="h-8 w-8 shrink-0"
        />

        <div className="min-w-0 flex-1">
          {replyToId && (
            <div className="mb-1 flex items-center gap-2 pl-4 text-xs font-normal text-primary">
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

          {media.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {media.map((item, i) => (
                <div key={item.preview} className="relative">
                  <img
                    src={item.preview}
                    alt=""
                    className="h-16 w-16 rounded-lg border border-border-soft object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(item.preview);
                      setMedia((current) => current.filter((_, index) => index !== i));
                    }}
                    className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-foreground text-background shadow"
                    aria-label={texts.posts.comments.removeMedia}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-border-soft bg-surface-1 p-2">
            <MentionTextarea
              value={draft}
              onChange={(value, ids) => {
                setDraft(postId, value);
                setCommentMentions(postId, ids);
              }}
              placeholder={texts.posts.comments.placeholder}
              className="w-full resize-none border-0 bg-transparent px-2 py-1 text-sm font-normal outline-none"
              maxLength={800}
              toolbar
            />

            <div className="mt-1 flex items-center gap-1 px-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={addMedia}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="grid h-8 w-8 place-items-center rounded-full text-text-subtle transition hover:bg-surface-2 hover:text-primary"
                aria-label={texts.posts.comments.attachMedia}
              >
                <Image className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setGifOpen(true)}
                className="h-8 rounded-full px-2 text-xs font-semibold text-text-subtle transition hover:bg-surface-2 hover:text-primary"
                aria-label={texts.posts.comments.gif}
              >
                {texts.posts.comments.gif}
              </button>

              <Button
                type="submit"
                size="icon"
                // h-9 (36px) em vez de 28px: era pequeno demais para o dedo no celular.
                className="ml-auto h-9 w-9 shrink-0 rounded-full"
                disabled={(!draft.trim() && media.length === 0) || sending}
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
        </div>
      </form>

      <GifPickerDialog open={gifOpen} onOpenChange={setGifOpen} onSelect={addGif} />
    </section>
  );
}
