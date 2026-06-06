import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Bookmark, Share2, Lightbulb, HelpCircle, Briefcase, FolderGit2, BookOpen } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Comment, Post } from "@/lib/mock-data";
import { currentUser, findUser, getCommentsForPost } from "@/lib/mock-data";

const typeMeta: Record<Post["type"], { label: string; icon: React.ElementType; className: string }> = {
  insight: { label: "Insight", icon: Lightbulb, className: "bg-accent text-accent-foreground" },
  question: { label: "Pergunta", icon: HelpCircle, className: "bg-secondary/30 text-secondary-foreground" },
  project: { label: "Projeto", icon: FolderGit2, className: "bg-growth/15 text-growth" },
  opportunity: { label: "Oportunidade", icon: Briefcase, className: "bg-opportunity/20 text-opportunity-foreground" },
  article: { label: "Artigo", icon: BookOpen, className: "bg-primary-soft text-primary" },
};

export function PostCard({ post }: { post: Post }) {
  const author = findUser(post.authorId);
  const meta = typeMeta[post.type];
  const Icon = meta.icon;
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>(() =>
    getCommentsForPost(post.id),
  );
  const totalComments = useMemo(() => {
    const replies = localComments.reduce(
      (total, comment) => total + (comment.replies?.length ?? 0),
      0,
    );
    return localComments.length + replies;
  }, [localComments]);

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    setLocalComments((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        postId: post.id,
        authorId: currentUser.id,
        content,
        createdAt: "agora",
        reactions: 0,
      },
    ]);
    setDraft("");
  };

  return (
    <article className="surface-card p-5 transition hover:shadow-[var(--shadow-card)]">
      <header className="flex items-start gap-3">
        <Link to="/perfil/$username" params={{ username: author.username }}>
          <Avatar className="h-11 w-11">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              to="/perfil/$username"
              params={{ username: author.username }}
              className="font-semibold hover:underline"
            >
              {author.name}
            </Link>
            <span className="text-xs text-muted-foreground">· {post.createdAt}</span>
          </div>
          <p className="line-clamp-1 text-sm text-muted-foreground">{author.headline}</p>
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

      {post.image && (
        <img
          src={post.image}
          alt=""
          className="mt-4 aspect-[2/1] w-full rounded-xl object-cover"
        />
      )}

      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Badge key={t} variant="secondary" className="rounded-full bg-muted font-normal text-muted-foreground">
              #{t}
            </Badge>
          ))}
        </div>
      )}

      <footer className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
        <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground">
          <Heart className="h-4 w-4" /> {post.reactions}
        </button>
        <button
          onClick={() => setShowComments((value) => !value)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" /> {Math.max(post.comments, totalComments)}
        </button>
        <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground">
          <Bookmark className="h-4 w-4" /> {post.saves}
        </button>
        <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground">
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
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>VC</AvatarFallback>
            </Avatar>
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

function CommentItem({ comment, nested = false }: { comment: Comment; nested?: boolean }) {
  const author = findUser(comment.authorId);

  return (
    <div className={`flex gap-3 ${nested ? "ml-10 mt-3" : ""}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={author.avatar} alt={author.name} />
        <AvatarFallback>{author.name[0]}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-muted/60 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/perfil/$username"
              params={{ username: author.username }}
              className="text-sm font-semibold hover:underline"
            >
              {author.name}
            </Link>
            <span className="text-[11px] text-muted-foreground">{comment.createdAt}</span>
            {comment.highlighted && (
              <span className="rounded-full bg-growth/15 px-2 py-0.5 text-[10px] font-medium text-growth">
                Comentário relevante
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed">{comment.content}</p>
        </div>
        <div className="mt-1 flex gap-3 px-3 text-[11px] font-medium text-muted-foreground">
          <button className="hover:text-foreground">Reagir · {comment.reactions}</button>
          <button className="hover:text-foreground">Responder</button>
        </div>
        {comment.replies?.map((reply) => (
          <CommentItem key={reply.id} comment={reply} nested />
        ))}
      </div>
    </div>
  );
}
