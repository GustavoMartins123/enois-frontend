import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PAGE_HTML_MAX_LENGTH } from "@/constants/post-page";
import { usePostCardStore } from "@/stores/post-card.store";
import { texts } from "@/texts";
import type { ReactionType } from "@/types/application/reaction/reaction-type";
import type { PostCardProps } from "@/types/components/post/post-card-props";
import {
  Bookmark,
  Flag,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";

import { REACTION_EMOJIS, communitiesApi, feedApi, reactionsApi } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

import { MentionTextarea } from "@/components/mention-textarea";

import { AuthorInfo } from "./post/author-info";
import { formatTime } from "./post/format-time";
import { LinkPreviews } from "./post/link-previews";
import { MediaGrid } from "./post/media-grid";
import { PostComments } from "./post/post-comments";
import { PostPage } from "./post/post-page";
import { ReactionsDialog } from "./post/reactions-dialog";
import { ReactionsSummary } from "./post/reactions-summary";
import { ReportDialog } from "./post/report-dialog";
import { RichText } from "./post/rich-text";
import { typeMeta } from "./post/type-meta";

export function PostCard({ post }: PostCardProps) {
  const { requireAuth, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isOwner = user?.id != null && user.id === post.authorId;
  const meta = typeMeta[post.type] ?? typeMeta.INSIGHT;
  const [showComments, setShowComments] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draft, setDraft] = useState(post.content);
  const [pageDraft, setPageDraft] = useState(post.pageHtml ?? "");

  // A listagem (e a resposta da publicação) não carrega o corpo da página: ele pode ter dezenas de
  // milhares de caracteres e não teria por que viajar no feed inteiro. Quem tem uma página pede o
  // post único — a mesma chave de cache da página do post, então lá já vem pronto.
  const needsPage = post.type === "PAGE" && !post.pageHtml;
  const { data: pagePost, isLoading: pageLoading } = useQuery({
    queryKey: ["post", post.id],
    queryFn: () => feedApi.get(post.id),
    enabled: needsPage,
  });
  const pageHtml = post.pageHtml ?? pagePost?.pageHtml ?? "";
  const initializePostCard = usePostCardStore((state) => state.initializePostCard);
  const disposePostCard = usePostCardStore((state) => state.disposePostCard);
  const card = usePostCardStore((state) => state.cards[post.id]);
  const setPostCounters = usePostCardStore((state) => state.setPostCounters);
  const setReactionStatus = usePostCardStore((state) => state.setReactionStatus);
  const setShowReactions = usePostCardStore((state) => state.setShowReactions);
  const setShowReport = usePostCardStore((state) => state.setShowReport);

  const postCounters = card?.postCounters ?? post.counters;
  const reactionStatus = card?.reactionStatus ?? post.currentUserReaction ?? null;

  useEffect(() => {
    initializePostCard(post);
    return () => disposePostCard(post.id);
  }, [disposePostCard, initializePostCard, post]);

  useEffect(() => {
    setReactionStatus(post.id, post.currentUserReaction ?? null);
  }, [post.currentUserReaction, post.id, setReactionStatus]);

  const { data: savedData } = useQuery({
    queryKey: ["saved-posts"],
    queryFn: () => feedApi.listSaved(),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (savedData) {
      setSaved(savedData.items.some((p) => p.id === post.id));
    }
  }, [savedData, post.id]);

  // A página chega depois do card (requisição própria): preenche o rascunho da edição quando ela
  // aparece, sem atropelar o que o autor já está digitando no diálogo aberto.
  useEffect(() => {
    if (!editOpen) setPageDraft(pageHtml);
  }, [editOpen, pageHtml]);

  const totalComments = useMemo(() => postCounters.comments, [postCounters.comments]);

  const handleReaction = async (type: ReactionType) => {
    if (!requireAuth()) return;
    try {
      if (reactionStatus === type) {
        const result = await reactionsApi.removeReaction(post.id);
        setReactionStatus(post.id, null);
        if ("counters" in result) setPostCounters(post.id, result.counters!);
      } else {
        const result = await reactionsApi.react(post.id, type);
        setReactionStatus(post.id, type);
        if ("counters" in result) setPostCounters(post.id, result.counters!);
      }
    } catch {
      // silently fail
    }
  };

  const handleSave = async () => {
    if (!requireAuth()) return;
    try {
      const result = saved
        ? await reactionsApi.removeSave(post.id)
        : await reactionsApi.save(post.id);
      setSaved(!saved);
      setPostCounters(post.id, result.counters);
    } catch {
      // silently fail
    }
  };

  const handleShare = async () => {
    if (!requireAuth()) return;
    try {
      const result = await reactionsApi.share(post.id);
      setPostCounters(post.id, result.counters);
      const url = `${window.location.origin}/post/${post.id}`;
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // silently fail
    }
  };

  // Post proprio: editar o texto e excluir. O backend confere o dono; a UI so evita mostrar para os outros.
  const editPost = useMutation({
    mutationFn: () =>
      feedApi.update(post.id, {
        content: draft.trim(),
        tags: post.tags,
        // Numa pagina o HTML vai junto (o backend recusa edicao de PAGE sem ele); nos outros
        // tipos o campo nem e enviado.
        ...(post.type === "PAGE" ? { pageHtml: pageDraft } : {}),
      }),
    onSuccess: () => {
      setEditOpen(false);
      toast(texts.posts.owner.edited);
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
    },
    onError: () => toast(texts.posts.owner.error, "error"),
  });

  const deletePost = useMutation({
    mutationFn: () => feedApi.delete(post.id),
    onSuccess: () => {
      setDeleteOpen(false);
      // Exclusão é lógica: dá para desfazer de verdade, então o aviso traz a ação.
      toast(texts.posts.owner.deleted, "success", {
        label: texts.posts.owner.undo,
        onClick: () => {
          feedApi
            .restore(post.id)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["feed"] });
              queryClient.invalidateQueries({ queryKey: ["post", post.id] });
              toast(texts.posts.owner.edited);
            })
            .catch(() => toast(texts.posts.owner.error, "error"));
        },
      });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      // Na pagina do post unico, o conteudo some: volta para o feed em vez de ficar num "nao encontrado".
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/post/")) {
        window.location.href = "/feed";
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
    },
    onError: () => toast(texts.posts.owner.error, "error"),
  });

  const handleSaveEdit = () => {
    const contentUnchanged = draft.trim() === post.content;
    const pageUnchanged = post.type !== "PAGE" || pageDraft === (post.pageHtml ?? "");

    if (!draft.trim() || (contentUnchanged && pageUnchanged)) {
      setEditOpen(false);
      return;
    }
    editPost.mutate();
  };

  // Seguir a comunidade direto do post: atualiza a lista para esconder o botao e marcar como membro.
  const followCommunity = useMutation({
    mutationFn: (communityId: string) => communitiesApi.join(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      queryClient.invalidateQueries({ queryKey: ["community"] });
    },
  });

  const handleFollowCommunity = () => {
    if (!requireAuth()) return;
    if (!post.community) return;
    followCommunity.mutate(post.community.id);
  };

  // Os comentarios sao carregados pelo proprio PostComments quando a secao abre.
  const toggleComments = () => setShowComments((value) => !value);

  return (
    <article className="min-w-0 rounded-2xl border border-border-soft bg-surface-card p-4 transition sm:p-5">
      <header className="flex justify-between items-start gap-3">
        <AuthorInfo
          authorUsername={post.authorUsername}
          authorName={post.authorName}
          authorAvatar={post.authorAvatar}
          createdAt={post.createdAt}
          community={post.community}
          fallbackClassName={meta.classAvatar}
          onFollowCommunity={handleFollowCommunity}
          followPending={followCommunity.isPending}
        />

        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
          >
            {meta.label}
          </span>

          {isOwner && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  title={texts.posts.owner.actions}
                  aria-label={texts.posts.owner.actions}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-40 rounded-2xl border-border p-1.5">
                <button
                  onClick={() => {
                    setDraft(post.content);
                    setPageDraft(pageHtml);
                    setEditOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                  {texts.posts.owner.edit}
                </button>

                <button
                  onClick={() => setDeleteOpen(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-destructive transition hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  {texts.posts.owner.delete}
                </button>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </header>

      {/* Post de pagina pode nao ter texto nenhum: sem paragrafo, so a pagina logo abaixo. */}
      {post.content.trim() !== "" && (
        <RichText
          content={post.content}
          className="mt-4 whitespace-pre-line break-words text-base font-normal leading-relaxed text-text-strong"
        />
      )}

      {post.editedAt && (
        <p className="mt-1 text-xs font-normal text-text-subtle">
          {texts.posts.edited} {texts.posts.authorTime(formatTime(post.editedAt))}
        </p>
      )}

      {post.mediaIds.length > 0 && (
        <div className="mt-4">
          <MediaGrid mediaIds={post.mediaIds} />
        </div>
      )}

      {pageHtml ? (
        <PostPage html={pageHtml} />
      ) : pageLoading ? (
        <p className="mt-4 rounded-xl border border-dashed border-border-soft px-3 py-6 text-center text-xs font-normal text-text-subtle">
          {texts.posts.page.loading}
        </p>
      ) : null}

      <ReactionsSummary postId={post.id} />
      <LinkPreviews content={post.content} />

      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="rounded-full border border-border-soft bg-transparent font-normal text-text-subtle"
            >
              {texts.posts.tag(t)}
            </Badge>
          ))}
        </div>
      )}

      <footer className="mt-4 flex justify-between flex-wrap items-center gap-1 border-t border-border pt-3 text-sm text-muted-foreground">
        <div className="flex flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 transition hover:bg-muted hover:text-foreground ${
                  reactionStatus ? "text-primary" : ""
                }`}
                title={
                  reactionStatus
                    ? texts.posts.reactions.reactedWith(REACTION_EMOJIS[reactionStatus])
                    : texts.posts.reactions.react
                }
              >
                {reactionStatus ? (
                  <span className="text-base leading-none">{REACTION_EMOJIS[reactionStatus]}</span>
                ) : (
                  <Heart className="h-4 w-4" />
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              side="top"
              className="w-fit rounded-2xl border-border p-1.5"
            >
              <div className="flex gap-1">
                {(Object.entries(REACTION_EMOJIS) as [ReactionType, string][]).map(
                  ([type, emoji]) => (
                    <button
                      key={type}
                      onClick={() => handleReaction(type)}
                      className={`rounded-lg px-2 py-1 text-xl transition hover:bg-muted ${
                        reactionStatus === type ? "bg-muted ring-1 ring-primary" : ""
                      }`}
                      title={type.toLowerCase()}
                    >
                      {emoji}
                    </button>
                  ),
                )}
              </div>
            </PopoverContent>
          </Popover>

          <button
            onClick={() => setShowReactions(post.id, true)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 text-xs tabular-nums transition hover:bg-muted hover:text-foreground text-muted-foreground"
          >
            {postCounters.reactions}
          </button>

          <button
            onClick={toggleComments}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 transition hover:bg-muted hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />

            <>{totalComments}</>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 transition hover:bg-muted hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />

            <>{texts.posts.share}</>
          </button>

          <button
            onClick={() => setShowReport(post.id, true)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 transition hover:bg-muted hover:text-foreground text-muted-foreground"
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 transition hover:bg-muted hover:text-foreground ${
            saved ? "text-primary" : ""
          }`}
        >
          <Bookmark className="h-4 w-4" />

          <>{postCounters.saves}</>
        </button>
      </footer>

      {isOwner && (
        <>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{texts.posts.owner.editTitle}</DialogTitle>
              </DialogHeader>

              <MentionTextarea
                value={draft}
                maxLength={1200}
                toolbar
                onChange={(value) => setDraft(value)}
                placeholder={texts.posts.owner.editDescription}
                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />

              {post.type === "PAGE" && (
                <div>
                  <label
                    htmlFor={`page-html-${post.id}`}
                    className="mb-1 block text-xs font-normal text-text-subtle"
                  >
                    {texts.feed.composer.pageLabel}
                  </label>

                  <Textarea
                    id={`page-html-${post.id}`}
                    value={pageDraft}
                    maxLength={PAGE_HTML_MAX_LENGTH}
                    onChange={(event) => setPageDraft(event.target.value)}
                    placeholder={
                      pageLoading ? texts.posts.page.loading : texts.feed.composer.pagePlaceholder
                    }
                    className="min-h-[160px] font-mono text-xs"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setEditOpen(false)}
                >
                  {texts.common.cancel}
                </Button>

                <Button
                  className="rounded-full"
                  disabled={
                    editPost.isPending ||
                    !draft.trim() ||
                    (post.type === "PAGE" && !pageDraft.trim())
                  }
                  onClick={handleSaveEdit}
                >
                  {editPost.isPending ? texts.common.saving : texts.posts.owner.save}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title={texts.posts.owner.deleteTitle}
            description={texts.posts.owner.deleteDescription}
            confirmLabel={texts.posts.owner.confirmDelete}
            destructive
            pending={deletePost.isPending}
            onConfirm={() => deletePost.mutate()}
          />
        </>
      )}

      <ReactionsDialog postId={post.id} />
      <ReportDialog postId={post.id} />

      {showComments && <PostComments postId={post.id} />}
    </article>
  );
}
