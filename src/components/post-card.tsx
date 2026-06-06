import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { commentsApi, reactionsApi } from "@/lib/api";
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

export function PostCard({ post }: { post: PostView }) {
  const meta = typeMeta[post.type] ?? typeMeta.INSIGHT;
  const Icon = meta.icon;
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [localComments, setLocalComments] = useState<CommentView[]>([]);
  const [postCounters, setPostCounters] = useState(post.counters);
  const [reactionStatus, setReactionStatus] = useState<string | null>(null);

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
      const result = await reactionsApi.save(post.id);
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
        <Link to="/perfil/$username" params={{ username: post.authorId }}>
          <UserAvatar className="h-11 w-11" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              to="/perfil/$username"
              params={{ username: post.authorId }}
              className="font-semibold hover:underline"
            >
              Usuário
            </Link>
            <span className="text-xs text-muted-foreground">· {formatTime(post.createdAt)}</span>
          </div>
          <p className="line-clamp-1 text-sm text-muted-foreground" />
        </div>
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
        >
          <Heart className={`h-4 w-4 ${reactionStatus ? "fill-primary" : ""}`} />{" "}
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
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground"
        >
          <Bookmark className="h-4 w-4" /> {postCounters.saves}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground"
        >
          <Share2 className="h-4 w-4" /> Compartilhar
        </button>
      </footer>

      {showComments && (
        <section className="mt-4 border-t border-border pt-4">
          <div className="space-y-3">
            {localComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>

          <form onSubmit={submitComment} className="mt-4 flex items-center gap-2">
            <UserAvatar className="h-8 w-8" />
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
  return (
    <div className={`flex gap-3 ${nested ? "ml-10 mt-3" : ""}`}>
      <UserAvatar className="h-8 w-8" />
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-muted/60 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Usuário</span>
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

function formatTime(iso: string): string {
  const date = new Date(iso);
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
