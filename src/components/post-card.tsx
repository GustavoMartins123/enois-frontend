import { type FormEvent, useEffect, useMemo, useState } from "react";

import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import {
  BookOpen,
  Bookmark,
  Briefcase,
  Flag,
  FolderGit2,
  Heart,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  Share2,
} from "lucide-react";

import {
  REACTION_EMOJIS,
  commentsApi,
  feedApi,
  mediaApi,
  profileApi,
  reactionsApi,
  reportsApi,
} from "@/lib/api";
import type { CommentView, PostView, ReactionType } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";
import { useAuth } from "@/lib/use-auth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

import { MentionTextarea } from "@/components/mention-textarea";
import { UserAvatar } from "@/components/user-avatar";

const typeMeta: Record<
  PostView["type"],
  { label: string; icon: React.ElementType; className: string }
> = {
  INSIGHT: { label: "Insight", icon: Lightbulb, className: "bg-accent text-accent-foreground" },
  QUESTION: {
    label: "Pergunta",
    icon: HelpCircle,
    className: "bg-secondary/30 text-secondary-foreground",
  },
  PROJECT: { label: "Projeto", icon: FolderGit2, className: "bg-growth/15 text-growth" },
  OPPORTUNITY: {
    label: "Oportunidade",
    icon: Briefcase,
    className: "bg-opportunity/20 text-opportunity-foreground",
  },
  ARTICLE: { label: "Artigo", icon: BookOpen, className: "bg-primary-soft text-primary" },
};

function ReactionsSummary({
  postId,
  reactionStatus,
}: {
  postId: string;
  reactionStatus: string | null;
}) {
  const { data } = useQuery({
    queryKey: ["reactions-summary", postId],
    queryFn: () => reactionsApi.listReactions(postId),
    staleTime: 30_000,
  });

  const summary = data?.summary;
  if (!summary) return null;

  const entries = (Object.entries(summary) as [string, number][]).filter(([, count]) => count > 0);
  if (entries.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {entries.map(([type, count]) => (
        <span
          key={type}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs tabular-nums ${
            reactionStatus === type
              ? "bg-primary-soft text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {REACTION_EMOJIS[type] ?? type} {count}
        </span>
      ))}
    </div>
  );
}

function ReactionsDialog({
  postId,
  currentUserReaction,
  currentUserId,
  open,
  onOpenChange,
}: {
  postId: string;
  currentUserReaction: string | null;
  currentUserId?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data } = useQuery({
    queryKey: ["reactions", postId],
    queryFn: () => reactionsApi.listReactions(postId),
    enabled: open,
  });

  const apiReactions = data?.reactions ?? [];
  const reactions =
    currentUserReaction && currentUserId && !apiReactions.some((r) => r.userId === currentUserId)
      ? [
          { userId: currentUserId, type: currentUserReaction, createdAt: new Date().toISOString() },
          ...apiReactions,
        ]
      : apiReactions;

  const uniqueUserIds = [...new Set(reactions.map((r) => r.userId))];
  const { data: users } = useQuery({
    queryKey: ["profiles", "by-ids", uniqueUserIds.sort().join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        uniqueUserIds.map((id) => profileApi.getById(id).catch(() => null)),
      );
      return Object.fromEntries(results.filter(Boolean).map((u) => [u!.id, u!]));
    },
    enabled: open && uniqueUserIds.length > 0,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reações</DialogTitle>
        </DialogHeader>
        {reactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma reação ainda</p>
        ) : (
          <div className="space-y-2 pt-2">
            {reactions.map((r) => {
              const user = users?.[r.userId];
              return (
                <div
                  key={`${r.userId}-${r.type}`}
                  className="flex items-center gap-3 rounded-xl bg-muted/30 p-3"
                >
                  <UserAvatar src={user?.avatar} alt={user?.name} className="h-9 w-9 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user?.name ?? "Carregando..."}</p>
                  </div>
                  <span className="text-xl">{REACTION_EMOJIS[r.type] ?? r.type}</span>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const REPORT_REASONS = [
  "AI_GENERATED",
  "FAKE_CONTENT",
  "SCAM",
  "DISCRIMINATION",
  "PREJUDICE",
  "HARASSMENT",
  "SPAM",
  "VIOLENCE",
  "COPYRIGHT",
  "OTHER",
];

function ReportDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [reason, setReason] = useState("SPAM");
  const [description, setDescription] = useState("");

  const submit = async () => {
    try {
      await reportsApi.create({
        targetId: postId,
        targetType: "POST",
        reason: reason as any,
        description: description || undefined,
      });
      onOpenChange(false);
      setDescription("");
    } catch {
      /* silent */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Denunciar post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Motivo</Label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ").toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Descrição (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button className="w-full rounded-full" onClick={submit}>
            Denunciar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PostCard({ post }: { post: PostView }) {
  const { user: currentUser } = useAuth();
  const meta = typeMeta[post.type] ?? typeMeta.INSIGHT;
  const Icon = meta.icon;
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [commentMentions, setCommentMentions] = useState<string[]>([]);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<CommentView[]>([]);
  const [postCounters, setPostCounters] = useState(post.counters);
  const [reactionStatus, setReactionStatus] = useState<string | null>(
    post.currentUserReaction ?? null,
  );
  const [saved, setSaved] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    setReactionStatus(post.currentUserReaction ?? null);
  }, [post.currentUserReaction]);

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
      setLocalComments((current) => [...current, newComment]);
      setPostCounters((c) => ({ ...c, comments: c.comments + 1 }));
      setDraft("");
      setCommentMentions([]);
      setReplyToId(null);
    } catch {
      // silently fail
    }
  };

  const handleReaction = async (type: ReactionType) => {
    try {
      if (reactionStatus === type) {
        const result = await reactionsApi.removeReaction(post.id);
        setReactionStatus(null);
        if ("counters" in result) setPostCounters((result as any).counters);
      } else {
        const result = await reactionsApi.react(post.id, type);
        setReactionStatus(type);
        if ("counters" in result) setPostCounters((result as any).counters);
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
      setPostCounters(result.counters);
    } catch {
      // silently fail
    }
  };

  const handleShare = async () => {
    try {
      const result = await reactionsApi.share(post.id);
      setPostCounters(result.counters);
      const url = `${window.location.origin}/feed/${post.id}`;
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // silently fail
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsApi.remove(post.id, commentId);
      setLocalComments((prev) => prev.filter((c) => c.id !== commentId));
      setPostCounters((c) => ({ ...c, comments: c.comments - 1 }));
    } catch {
      // silently fail
    }
  };

  const loadComments = async () => {
    if (!showComments) {
      try {
        const data = await commentsApi.list(post.id);
        setLocalComments(data.items);
      } catch {
        // silently fail
      }
    }
    setShowComments((v) => !v);
  };

  return (
    <article className="min-w-0 surface-card p-4 transition hover:shadow-[var(--shadow-card)] sm:p-5">
      <header className="flex items-start gap-3">
        <AuthorInfo
          authorUsername={post.authorUsername}
          authorName={post.authorName}
          authorAvatar={post.authorAvatar}
          createdAt={post.createdAt}
        />
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
        >
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
      </header>

      <p className="mt-4 whitespace-pre-line break-words text-[15px] leading-relaxed text-foreground">
        {linkifyText(post.content)}
      </p>

      {post.mediaIds.length > 0 && (
        <div className="mt-4">
          <MediaGrid mediaIds={post.mediaIds} />
        </div>
      )}

      <ReactionsSummary postId={post.id} reactionStatus={reactionStatus} />

      <LinkPreviews content={post.content} />

      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="rounded-full bg-muted font-normal text-muted-foreground"
            >
              #{t}
            </Badge>
          ))}
        </div>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-3 text-sm text-muted-foreground">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground ${
                reactionStatus ? "text-primary" : ""
              }`}
              title={reactionStatus ? `Reagiu com ${REACTION_EMOJIS[reactionStatus]}` : "Reagir"}
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
          onClick={() => setShowReactions(true)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs tabular-nums transition hover:bg-muted hover:text-foreground text-muted-foreground"
        >
          {postCounters.reactions}
        </button>
        <button
          onClick={loadComments}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" /> {totalComments}
        </button>
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground ${
            saved ? "text-primary" : ""
          }`}
        >
          <Bookmark className={`h-4 w-4`} /> {postCounters.saves}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground"
        >
          <Share2 className="h-4 w-4" /> Compartilhar
        </button>
        <button
          onClick={() => setShowReport(true)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground text-muted-foreground"
        >
          <Flag className="h-4 w-4" />
        </button>
      </footer>

      <ReactionsDialog
        postId={post.id}
        currentUserReaction={reactionStatus}
        currentUserId={currentUser?.id}
        open={showReactions}
        onOpenChange={setShowReactions}
      />
      <ReportDialog postId={post.id} open={showReport} onOpenChange={setShowReport} />

      {showComments && (
        <section className="mt-4 border-t border-border pt-4">
          <div className="space-y-3">
            {localComments
              .filter((c) => !c.parentCommentId)
              .map((comment) => {
                const replies = localComments.filter((r) => r.parentCommentId === comment.id);
                return (
                  <div key={comment.id}>
                    <CommentItem
                      comment={comment}
                      currentUserId={currentUser?.id}
                      onDelete={handleDeleteComment}
                      onReply={async (c) => {
                        try {
                          const profile = await profileApi.getById(c.authorId);
                          if (profile?.username) {
                            setDraft(`@${profile.username} `);
                            setCommentMentions([c.authorId]);
                          }
                        } catch {
                          setDraft(`${c.authorName} `);
                        }
                        setReplyToId(c.id);
                      }}
                    />
                    {replies.length > 0 && (
                      <div className="ml-10 mt-2 space-y-2 border-l-2 border-border pl-4">
                        {replies.map((reply) => {
                          const parentAuthor = localComments.find(
                            (c) => c.id === reply.parentCommentId,
                          )?.authorName;
                          return (
                            <CommentItem
                              key={reply.id}
                              comment={reply}
                              replyingTo={parentAuthor}
                              currentUserId={currentUser?.id}
                              onDelete={handleDeleteComment}
                              onReply={async (c) => {
                                try {
                                  const profile = await profileApi.getById(c.authorId);
                                  if (profile?.username) {
                                    setDraft(`@${profile.username} `);
                                    setCommentMentions([c.authorId]);
                                  }
                                } catch {
                                  setDraft(`${c.authorName} `);
                                }
                                setReplyToId(c.id);
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            {localComments.filter((c) => !c.parentCommentId).length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum comentário ainda. Seja o primeiro a comentar.
              </p>
            )}
          </div>

          <form onSubmit={submitComment} className="mt-4 flex items-center gap-2">
            <UserAvatar
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="h-8 w-8 shrink-0"
            />
            <MentionTextarea
              value={draft}
              onChange={(val, ids) => {
                setDraft(val);
                setCommentMentions(ids);
              }}
              placeholder="Comente com contexto, dúvida ou referência..."
              className="h-10 resize-none rounded-full bg-muted px-4 py-2 text-sm outline-none"
              maxLength={280}
            />
            <Button type="submit" size="sm" className="rounded-full" disabled={!draft.trim()}>
              Enviar
            </Button>
          </form>
        </section>
      )}
    </article>
  );
}

function CommentItem({
  comment,
  replyingTo,
  currentUserId,
  onDelete,
  onReply,
}: {
  comment: CommentView;
  replyingTo?: string;
  currentUserId?: string;
  onDelete?: (commentId: string) => void;
  onReply?: (comment: CommentView) => void;
}) {
  const isOwner = currentUserId === comment.authorId;
  const [commentReaction, setCommentReaction] = useState<string | null>(null);

  const handleCommentReaction = async (type: ReactionType) => {
    try {
      if (commentReaction === type) {
        await reactionsApi.removeCommentReaction(comment.postId, comment.id);
        setCommentReaction(null);
      } else {
        await reactionsApi.reactComment(comment.postId, comment.id, type);
        setCommentReaction(type);
      }
    } catch {}
  };

  return (
    <div className="flex gap-3">
      <UserAvatar
        src={comment.authorAvatar}
        alt={comment.authorName}
        className="h-8 w-8 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-muted/60 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{comment.authorName}</span>
            {replyingTo && (
              <span className="text-[11px] text-muted-foreground">respondendo a {replyingTo}</span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {formatTime(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 break-words text-sm leading-relaxed">{linkifyText(comment.content)}</p>
        </div>
        <div className="mt-1 flex items-center gap-2 px-3 text-[11px] font-medium text-muted-foreground">
          <button
            onClick={() => onReply?.(comment)}
            className="transition-colors hover:text-foreground"
          >
            Responder
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button className="transition-colors hover:text-foreground">
                {commentReaction ? REACTION_EMOJIS[commentReaction] : "Reagir"}
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
                      onClick={() => handleCommentReaction(type)}
                      className={`rounded-lg px-2 py-1 text-lg transition hover:bg-muted ${
                        commentReaction === type ? "bg-muted ring-1 ring-primary" : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ),
                )}
              </div>
            </PopoverContent>
          </Popover>
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-destructive transition-colors hover:text-destructive/80"
            >
              Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthorInfo({
  authorUsername,
  authorName,
  authorAvatar,
  createdAt,
}: {
  authorUsername: string;
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Link to="/perfil/$username" params={{ username: authorUsername }}>
        <UserAvatar src={authorAvatar} alt={authorName} className="h-11 w-11" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            to="/perfil/$username"
            params={{ username: authorUsername }}
            className="font-semibold hover:underline"
          >
            {authorName}
          </Link>
          <span className="text-xs text-muted-foreground">· {formatTime(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function EmbedPlayer({ type, id, url }: { type: string; id: string; url: string }) {
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    let thumbnail = "";
    if (type === "youtube") thumbnail = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    if (type === "dailymotion") thumbnail = `https://www.dailymotion.com/thumbnail/video/${id}`;

    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="relative mt-3 block w-full overflow-hidden rounded-xl border border-border text-left transition hover:opacity-90"
      >
        {thumbnail ? (
          <img src={thumbnail} alt="" className="aspect-video w-full bg-muted object-cover" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-muted">
            <div className="text-center">
              <p className="text-2xl">
                {type === "vimeo" ? "🎬" : type === "twitch" ? "📺" : "▶️"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Clique para assistir no {type === "youtube" ? "YouTube" : type}
              </p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur">
            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </button>
    );
  }

  const srcs: Record<string, string> = {
    youtube: `https://www.youtube.com/embed/${id}?autoplay=1`,
    vimeo: `https://player.vimeo.com/video/${id}?autoplay=1`,
    dailymotion: `https://www.dailymotion.com/embed/video/${id}?autoplay=1`,
    twitch: `https://player.twitch.tv/?video=${id}&parent=${typeof window !== "undefined" ? window.location.hostname : ""}&autoplay=true`,
  };

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted">
      <iframe
        src={srcs[type] ?? ""}
        className="aspect-video w-full"
        allow="autoplay; fullscreen; encrypted-media"
        allowFullScreen
      />
    </div>
  );
}

function LinkPreviews({ content }: { content: string }) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlRegex) ?? [];
  const seen = new Set<string>();

  return (
    <>
      {urls.map((url) => {
        if (seen.has(url)) return null;
        seen.add(url);

        const video = extractVideoId(url);
        if (video) {
          return <EmbedPlayer key={url} type={video.type} id={video.id} url={url} />;
        }

        return (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm transition hover:bg-muted"
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-xs font-bold text-primary">
              {(() => {
                try {
                  return new URL(url).hostname.slice(0, 2).toUpperCase();
                } catch {
                  return "🌐";
                }
              })()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {(() => {
                  try {
                    return new URL(url).hostname;
                  } catch {
                    return url;
                  }
                })()}
              </p>
              <p className="truncate text-xs text-muted-foreground">{url}</p>
            </div>
          </a>
        );
      })}
    </>
  );
}

function extractVideoId(url: string): { type: string; id: string } | null {
  const patterns: [RegExp, string][] = [
    [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, "youtube"],
    [/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/, "dailymotion"],
    [/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/, "vimeo"],
    [/(?:twitch\.tv\/videos\/|clips\.twitch\.tv\/)([a-zA-Z0-9_-]+)/, "twitch"],
    [/twitch\.tv\/([a-zA-Z0-9_]+)\/?$/, "twitch"],
  ];
  for (const [regex, type] of patterns) {
    const m = url.match(regex);
    if (m) return { type, id: m[1] };
  }
  return null;
}

function linkifyText(text: string) {
  const parts: React.ReactNode[] = [];
  const regex = /(@\w+|https?:\/\/[^\s]+)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith("@")) {
      const username = token.slice(1);
      parts.push(
        <Link
          key={key++}
          to="/perfil/$username"
          params={{ username }}
          className="font-medium text-primary hover:underline"
        >
          {token}
        </Link>,
      );
    } else {
      parts.push(
        <a
          key={key++}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="break-words text-primary hover:underline"
        >
          {token}
        </a>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return parts.length > 0 ? parts : text;
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `há ${diffD} dias`;
  return date.toLocaleDateString("pt-BR");
}

function MediaGrid({ mediaIds }: { mediaIds: string[] }) {
  const queryResults = useQueries({
    queries: mediaIds.map((id) => ({
      queryKey: ["media", id],
      queryFn: () => mediaApi.get(id),
      staleTime: 60_000,
    })),
  });

  const items = queryResults.filter((q) => q.data?.cdnUrl).map((q) => q.data!);
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);

  if (items.length === 0) return null;

  const isVideo = items.some((m) => m.mimeType.startsWith("video/"));

  if (isVideo) {
    return (
      <div className="overflow-hidden rounded-xl border border-border">
        <video src={resolveCdnUrl(items[0].cdnUrl)} controls className="max-h-96 w-full bg-muted" />
      </div>
    );
  }

  return (
    <>
      <div className={`grid gap-2 ${items.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
        {items.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setFullscreenUrl(resolveCdnUrl(m.cdnUrl) ?? null)}
            className="overflow-hidden rounded-xl border border-border text-left"
          >
            <img
              src={resolveCdnUrl(m.cdnUrl)}
              alt=""
              className="h-48 w-full object-cover bg-muted transition hover:scale-105"
            />
          </button>
        ))}
      </div>
      {fullscreenUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setFullscreenUrl(null)}
        >
          <img
            src={fullscreenUrl}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
