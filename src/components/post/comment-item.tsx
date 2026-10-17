import { useEffect, useState } from "react";

import { Link } from "@tanstack/react-router";

import { usePostCardStore } from "@/stores/post-card.store";
import { texts } from "@/texts";
import type { ReactionType } from "@/types/application/reaction/reaction-type";
import type { CommentItemProps } from "@/types/components/post/comment-item-props";

import { REACTION_EMOJIS, commentsApi, profileApi, reactionsApi } from "@/lib/api";
import { getCurrentUserId } from "@/lib/current-user";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ReadMore } from "@/components/ui/read-more";
import { Textarea } from "@/components/ui/textarea";

import { UserAvatar } from "@/components/user-avatar";

import { formatTime } from "./format-time";
import { LinkPreviews } from "./link-previews";
import { RichText } from "./rich-text";

/** Um comentário (com responder, reagir e excluir). */
export function CommentItem({ comment, replyingTo }: CommentItemProps) {
  const currentUserId = getCurrentUserId();
  const postId = comment.postId;
  const setDraft = usePostCardStore((state) => state.setDraft);
  const setCommentMentions = usePostCardStore((state) => state.setCommentMentions);
  const setReplyToId = usePostCardStore((state) => state.setReplyToId);
  const removeComment = usePostCardStore((state) => state.removeComment);
  const updateCommentCount = usePostCardStore((state) => state.updateCommentCount);
  const isOwner = currentUserId === comment.authorId;
  const [commentReaction, setCommentReaction] = useState<string | null>(
    comment.currentUserReaction ?? null,
  );

  // Edicao e local ao item: o texto novo e o selo aparecem na hora. Ao remontar (refetch),
  // vale o que veio do servidor, que ja traz o editedAt.
  const [content, setContent] = useState(comment.content);
  const [editedAt, setEditedAt] = useState<string | null>(comment.editedAt ?? null);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // A reação do leitor vem do servidor: sem isto o like "sumia" ao recarregar.
  useEffect(() => {
    setCommentReaction(comment.currentUserReaction ?? null);
  }, [comment.currentUserReaction, comment.id]);

  const saveEdit = async () => {
    const next = editDraft.trim();
    if (!next || next === content) {
      setEditing(false);
      setEditDraft(content);
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      const result = await commentsApi.update(postId, comment.id, next);
      setContent(result.content ?? next);
      setEditedAt(result.editedAt);
      setEditing(false);
    } catch {
      setEditError(texts.posts.comments.editError);
    } finally {
      setSaving(false);
    }
  };

  const handleReply = async () => {
    try {
      const profile = await profileApi.getById(comment.authorId);
      if (profile?.username) {
        setDraft(postId, `@${profile.username} `);
        setCommentMentions(postId, [comment.authorId]);
      }
    } catch {
      setDraft(postId, `${comment.authorName} `);
    }
    setReplyToId(postId, comment.id);
  };

  const handleDelete = async () => {
    try {
      await commentsApi.remove(postId, comment.id);
      removeComment(postId, comment.id);
      updateCommentCount(postId, -1);
    } catch {
      // silently fail
    }
  };

  const handleCommentReaction = async (type: ReactionType) => {
    try {
      if (commentReaction === type) {
        await reactionsApi.removeCommentReaction(comment.postId, comment.id);
        setCommentReaction(null);
      } else {
        await reactionsApi.reactComment(comment.postId, comment.id, type);
        setCommentReaction(type);
      }
    } catch {
      /* ignore */
    }
  };

  // Nome e foto levam ao perfil de quem comentou (quando o perfil existe).
  const profileLink = comment.authorUsername ? (
    <Link
      to="/perfil/$username"
      params={{ username: comment.authorUsername }}
      className="text-xs font-medium text-text-strong hover:underline"
    >
      {comment.authorName}
    </Link>
  ) : (
    <span className="text-xs font-medium text-text-strong">{comment.authorName}</span>
  );

  const avatar = (
    <UserAvatar src={comment.authorAvatar} alt={comment.authorName} className="h-8 w-8 shrink-0" />
  );

  return (
    <div className="flex gap-2.5">
      {comment.authorUsername ? (
        <Link
          to="/perfil/$username"
          params={{ username: comment.authorUsername }}
          className="shrink-0 transition hover:opacity-80"
          aria-label={texts.posts.comments.viewProfile(comment.authorName)}
        >
          {avatar}
        </Link>
      ) : (
        avatar
      )}

      <div className="min-w-0 flex-1">
        <div className="rounded-xl bg-surface-1 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            {profileLink}
            {replyingTo && (
              <span className="text-xs font-normal text-text-subtle">
                {texts.posts.comments.replyingTo(replyingTo)}
              </span>
            )}
            <span className="text-xs font-normal text-text-subtle">
              {formatTime(comment.createdAt)}
              {editedAt ? ` · ${texts.posts.edited}` : ""}
            </span>
          </div>

          {editing ? (
            <div className="mt-1 space-y-2">
              <Textarea
                value={editDraft}
                onChange={(event) => setEditDraft(event.target.value)}
                rows={3}
                maxLength={1024}
                className="border-border-soft bg-surface-card text-sm font-normal"
              />

              {editError && <p className="text-xs text-destructive">{editError}</p>}

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={saving || !editDraft.trim()}
                  onClick={() => void saveEdit()}
                >
                  {saving ? texts.common.saving : texts.common.save}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => {
                    setEditing(false);
                    setEditDraft(content);
                    setEditError(null);
                  }}
                >
                  {texts.common.cancel}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-0.5">
                <ReadMore
                  clampClassName="line-clamp-5"
                  length={content.length}
                  threshold={300}
                  moreLabel={texts.common.readMore}
                  lessLabel={texts.common.readLess}
                >
                  <RichText
                    content={content}
                    className="whitespace-pre-line break-words text-sm font-normal leading-relaxed text-text-strong"
                  />
                </ReadMore>
              </div>

              <LinkPreviews content={content} />
            </>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3 px-3 text-xs font-normal text-text-subtle">
          <button onClick={handleReply} className="transition-colors hover:text-primary">
            {texts.posts.comments.reply}
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button className="transition-colors hover:text-primary">
                {commentReaction ? REACTION_EMOJIS[commentReaction] : texts.posts.reactions.react}
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              side="top"
              className="w-fit rounded-2xl border-border-soft bg-surface-card p-1.5"
            >
              <div className="flex gap-1">
                {(Object.entries(REACTION_EMOJIS) as [ReactionType, string][]).map(
                  ([type, emoji]) => (
                    <button
                      key={type}
                      onClick={() => handleCommentReaction(type)}
                      className={`rounded-lg px-2 py-1 text-lg transition hover:bg-surface-2 ${
                        commentReaction === type ? "bg-surface-2 ring-1 ring-primary" : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ),
                )}
              </div>
            </PopoverContent>
          </Popover>
          {isOwner && !editing && (
            <button
              onClick={() => {
                setEditDraft(content);
                setEditing(true);
              }}
              className="transition-colors hover:text-primary"
            >
              {texts.common.edit}
            </button>
          )}

          {isOwner && (
            <button
              onClick={handleDelete}
              className="text-destructive transition-colors hover:text-destructive/80"
            >
              {texts.posts.comments.delete}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
