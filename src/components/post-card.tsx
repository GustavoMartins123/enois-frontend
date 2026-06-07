import { Link } from "@tanstack/react-router";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Lightbulb,
  HelpCircle,
  Briefcase,
  FolderGit2,
  BookOpen,
  Flag,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useAuth } from "@/lib/use-auth";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { commentsApi, reactionsApi, mediaApi, profileApi, reportsApi, feedApi } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";
import type { PostView, CommentView } from "@/lib/api";

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

function ReactionsDialog({ postId, open, onOpenChange }: { postId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: reactions } = useQuery({
    queryKey: ["reactions", postId],
    queryFn: () => feedApi.listReactions(postId),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reações</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {(!reactions || reactions.length === 0) && <p className="text-sm text-muted-foreground">Nenhuma reação ainda.</p>}
          {reactions?.map((r) => (
            <ReactionUserItem key={r.userId} userId={r.userId} type={r.type} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReactionUserItem({ userId, type }: { userId: string; type: string }) {
  const { data: user } = useQuery({
    queryKey: ["profile", "by-id", userId],
    queryFn: () => profileApi.getById(userId),
  });

  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
      <Link to="/perfil/$username" params={{ username: user?.username ?? userId }}>
        <UserAvatar src={user?.avatar} alt={user?.name} className="h-8 w-8" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{user?.name ?? "Carregando..."}</p>
      </div>
      <span className="text-sm">{type === "LIKE" ? "❤️" : type}</span>
    </div>
  );
}

const REPORT_REASONS = [
  "AI_GENERATED", "FAKE_CONTENT", "SCAM", "DISCRIMINATION",
  "PREJUDICE", "HARASSMENT", "SPAM", "VIOLENCE", "COPYRIGHT", "OTHER",
];

function ReportDialog({ postId, open, onOpenChange }: { postId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [reason, setReason] = useState("SPAM");
  const [description, setDescription] = useState("");

  const submit = async () => {
    try {
      await reportsApi.create({ targetId: postId, targetType: "POST", reason: reason as any, description: description || undefined });
      onOpenChange(false);
      setDescription("");
    } catch { /* silent */ }
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
                <option key={r} value={r}>{r.replace(/_/g, " ").toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Descrição (opcional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
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
  const [localComments, setLocalComments] = useState<CommentView[]>([]);
  const [postCounters, setPostCounters] = useState(post.counters);
  const [reactionStatus, setReactionStatus] = useState<string | null>(post.currentUserReaction ?? null);
  const [saved, setSaved] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const totalComments = useMemo(() => postCounters.comments, [postCounters.comments]);

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    try {
      const newComment = await commentsApi.create(post.id, content);
      setLocalComments((current) => [...current, newComment]);
      setPostCounters((c) => ({ ...c, comments: c.comments + 1 }));
      setDraft("");
    } catch {
      // silently fail
    }
  };

  const handleReaction = async () => {
    try {
      const result = reactionStatus
        ? await reactionsApi.removeReaction(post.id)
        : await reactionsApi.react(post.id);
      setReactionStatus(result.status === "REACTED" ? "REACTED" : null);
      setPostCounters(result.counters);
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
    <article className="surface-card p-5 transition hover:shadow-[var(--shadow-card)]">
      <header className="flex items-start gap-3">
        <AuthorInfo authorId={post.authorId} createdAt={post.createdAt} />
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
        >
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
      </header>

      <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground">
        {post.content}
      </p>

      {post.mediaIds.length > 0 && (
        <div className="mt-4">
          <MediaGrid mediaIds={post.mediaIds} />
        </div>
      )}

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

      <footer className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
        <button
          onClick={handleReaction}
          className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground ${
            reactionStatus ? "text-primary" : ""
          }`}
          title={reactionStatus ? "Remover reação" : "Curtir"}
        >
          <Heart className={`h-4 w-4 ${reactionStatus ? "fill-primary" : ""}`} />
        </button>
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

      <ReactionsDialog postId={post.id} open={showReactions} onOpenChange={setShowReactions} />
      <ReportDialog postId={post.id} open={showReport} onOpenChange={setShowReport} />

      {showComments && (
        <section className="mt-4 border-t border-border pt-4">
          <div className="space-y-3">
            {localComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>

          <form onSubmit={submitComment} className="mt-4 flex items-center gap-2">
            <UserAvatar src={currentUser?.avatar} alt={currentUser?.name} className="h-8 w-8" />
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Comente com contexto, dúvida ou referência..."
              className="h-10 rounded-full bg-muted"
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

function CommentItem({ comment, nested = false }: { comment: CommentView; nested?: boolean }) {
  const { data: author } = useQuery({
    queryKey: ["profile", "by-id", comment.authorId],
    queryFn: () => profileApi.getById(comment.authorId),
    staleTime: 120_000,
  });

  return (
    <div className={`flex gap-3 ${nested ? "ml-10 mt-3" : ""}`}>
      <Link to="/perfil/$username" params={{ username: author?.username ?? comment.authorId }}>
        <UserAvatar src={author?.avatar} alt={author?.name} className="h-8 w-8" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-muted/60 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/perfil/$username"
              params={{ username: author?.username ?? comment.authorId }}
              className="text-sm font-semibold hover:underline"
            >
              {author?.name ?? "Usuário"}
            </Link>
            <span className="text-[11px] text-muted-foreground">
              {formatTime(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed">{comment.content}</p>
        </div>
        <div className="mt-1 flex gap-3 px-3 text-[11px] font-medium text-muted-foreground">
          <button className="hover:text-foreground">Responder</button>
        </div>
      </div>
    </div>
  );
}

function AuthorInfo({ authorId, createdAt }: { authorId: string; createdAt: string }) {
  const { data: author } = useQuery({
    queryKey: ["profile", "by-id", authorId],
    queryFn: () => profileApi.getById(authorId),
    staleTime: 120_000,
  });

  return (
    <div className="flex items-start gap-3">
      <Link to="/perfil/$username" params={{ username: author?.username ?? authorId }}>
        <UserAvatar src={author?.avatar} alt={author?.name} className="h-11 w-11" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            to="/perfil/$username"
            params={{ username: author?.username ?? authorId }}
            className="font-semibold hover:underline"
          >
            {author?.name ?? "Usuário"}
          </Link>
          <span className="text-xs text-muted-foreground">· {formatTime(createdAt)}</span>
        </div>
        {author?.headline && (
          <p className="line-clamp-1 text-sm text-muted-foreground">{author.headline}</p>
        )}
      </div>
    </div>
  );
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

  const items = queryResults
    .filter((q) => q.data?.cdnUrl)
    .map((q) => q.data!);

  if (items.length === 0) return null;

  const isVideo = items.some((m) => m.mimeType.startsWith("video/"));

  if (isVideo) {
    return (
      <div className="overflow-hidden rounded-xl border border-border">
        <video
          src={resolveCdnUrl(items[0].cdnUrl)}
          controls
          className="max-h-96 w-full bg-muted"
        />
    </div>
  );
}

  return (
    <div
      className={`grid gap-2 ${
        items.length === 1 ? "grid-cols-1" : "grid-cols-2"
      }`}
    >
      {items.map((m) => (
        <div key={m.id} className="overflow-hidden rounded-xl border border-border">
          <img
            src={resolveCdnUrl(m.cdnUrl)}
            alt=""
            className="h-48 w-full object-cover bg-muted"
          />
        </div>
      ))}
    </div>
  );
}
