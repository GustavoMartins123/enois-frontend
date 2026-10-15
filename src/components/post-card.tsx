import { type FormEvent, useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { usePostCardStore } from "@/stores/post-card.store";
import { texts } from "@/texts";
import type { ReactionType } from "@/types/application/reaction/reaction-type";
import type { PostCardProps } from "@/types/components/post/post-card-props";
import { Bookmark, Flag, Heart, MessageSquare, Send, Share2 } from "lucide-react";

import { REACTION_EMOJIS, commentsApi, feedApi, reactionsApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/current-user";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { MentionTextarea } from "@/components/mention-textarea";
import { UserAvatar } from "@/components/user-avatar";

import { AuthorInfo } from "./post/author-info";
import { CommentItem } from "./post/comment-item";
import { LinkPreviews } from "./post/link-previews";
import { linkifyText } from "./post/linkify-text";
import { MediaGrid } from "./post/media-grid";
import { ReactionsDialog } from "./post/reactions-dialog";
import { ReactionsSummary } from "./post/reactions-summary";
import { ReportDialog } from "./post/report-dialog";
import { typeMeta } from "./post/type-meta";

export function PostCard({ post }: PostCardProps) {
  const currentUser = getCurrentUser();
  const meta = typeMeta[post.type] ?? typeMeta.INSIGHT;
  const [showComments, setShowComments] = useState(false);
  const [saved, setSaved] = useState(false);
  const initializePostCard = usePostCardStore((state) => state.initializePostCard);
  const disposePostCard = usePostCardStore((state) => state.disposePostCard);
  const card = usePostCardStore((state) => state.cards[post.id]);
  const setDraft = usePostCardStore((state) => state.setDraft);
  const setCommentMentions = usePostCardStore((state) => state.setCommentMentions);
  const setReplyToId = usePostCardStore((state) => state.setReplyToId);
  const setComments = usePostCardStore((state) => state.setComments);
  const addComment = usePostCardStore((state) => state.addComment);
  const updateCommentCount = usePostCardStore((state) => state.updateCommentCount);
  const setPostCounters = usePostCardStore((state) => state.setPostCounters);
  const setReactionStatus = usePostCardStore((state) => state.setReactionStatus);
  const setShowReactions = usePostCardStore((state) => state.setShowReactions);
  const setShowReport = usePostCardStore((state) => state.setShowReport);

  const draft = card?.draft ?? "";
  const commentMentions = card?.commentMentions ?? [];
  const replyToId = card?.replyToId ?? null;
  const localComments = card?.localComments ?? [];
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

  const totalComments = useMemo(() => postCounters.comments, [postCounters.comments]);

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    try {
      const newComment = await commentsApi.create(post.id, content, replyToId, commentMentions);
      addComment(post.id, newComment);
      updateCommentCount(post.id, 1);
      setDraft(post.id, "");
      setCommentMentions(post.id, []);
      setReplyToId(post.id, null);
    } catch {
      // silently fail
    }
  };

  const handleReaction = async (type: ReactionType) => {
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

  const loadComments = async () => {
    if (!showComments) {
      try {
        const data = await commentsApi.list(post.id);
        setComments(post.id, data.items);
      } catch {
        // silently fail
      }
    }
    setShowComments((v) => !v);
  };

  return (
    <article className="min-w-0 rounded-2xl border border-border-soft bg-surface-card p-4 transition sm:p-5">
      <header className="flex justify-between items-start gap-3">
        <AuthorInfo
          authorUsername={post.authorUsername}
          authorName={post.authorName}
          authorAvatar={post.authorAvatar}
          createdAt={post.createdAt}
          fallbackClassName={meta.classAvatar}
        />

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
        >
          {meta.label}
        </span>
      </header>

      <p className="mt-4 whitespace-pre-line break-words text-[15px] font-light leading-relaxed text-text-strong">
        {linkifyText(post.content)}
      </p>

      {post.mediaIds.length > 0 && (
        <div className="mt-4">
          <MediaGrid mediaIds={post.mediaIds} />
        </div>
      )}

      <ReactionsSummary postId={post.id} />
      <LinkPreviews content={post.content} />

      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="rounded-full border border-border-soft bg-transparent font-light text-text-subtle"
            >
              {texts.posts.tag(t)}
            </Badge>
          ))}
        </div>
      )}

      <footer className="mt-4 flex justify-between flex-wrap items-center gap-1 border-t border-border pt-3 text-sm text-muted-foreground">
        <div className="flex">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground ${
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
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs tabular-nums transition hover:bg-muted hover:text-foreground text-muted-foreground"
          >
            {postCounters.reactions}
          </button>

          <button
            onClick={loadComments}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />

            <>{totalComments}</>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />

            <>{texts.posts.share}</>
          </button>

          <button
            onClick={() => setShowReport(post.id, true)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground text-muted-foreground"
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground ${
            saved ? "text-primary" : ""
          }`}
        >
          <Bookmark className="h-4 w-4" />

          <>{postCounters.saves}</>
        </button>
      </footer>

      <ReactionsDialog postId={post.id} />
      <ReportDialog postId={post.id} />

      {showComments && (
        <section className="mt-4 border-t border-border-soft pt-4">
          <div className="space-y-3">
            {localComments
              .filter((c) => !c.parentCommentId)
              .map((comment) => {
                const replies = localComments.filter((r) => r.parentCommentId === comment.id);
                return (
                  <div key={comment.id}>
                    <CommentItem comment={comment} />
                    {replies.length > 0 && (
                      <div className="ml-10 mt-2 space-y-2 border-l-2 border-border-soft pl-4">
                        {replies.map((reply) => {
                          const parentAuthor = localComments.find(
                            (c) => c.id === reply.parentCommentId,
                          )?.authorName;
                          return (
                            <CommentItem key={reply.id} comment={reply} replyingTo={parentAuthor} />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            {localComments.filter((c) => !c.parentCommentId).length === 0 && (
              <p className="py-4 text-center text-[13px] font-light text-text-subtle">
                {texts.posts.comments.empty}
              </p>
            )}
          </div>

          <form onSubmit={submitComment} className="mt-4 flex items-center gap-2.5">
            <UserAvatar
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="h-8 w-8 shrink-0"
            />

            <div className="flex flex-1 items-center gap-2 rounded-full border border-border-soft bg-surface-1 py-1.5 pl-4 pr-1.5">
              <MentionTextarea
                value={draft}
                onChange={(val, ids) => {
                  setDraft(post.id, val);
                  setCommentMentions(post.id, ids);
                }}
                placeholder={texts.posts.comments.placeholder}
                className="h-6 min-h-6 flex-1 resize-none border-0 bg-transparent p-0 text-[13px] font-light outline-none"
                maxLength={280}
              />

              <Button
                type="submit"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-full"
                disabled={!draft.trim()}
                aria-label={texts.posts.comments.send}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </section>
      )}
    </article>
  );
}
