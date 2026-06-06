import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Bookmark, Share2, Lightbulb, HelpCircle, Briefcase, FolderGit2, BookOpen } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/lib/mock-data";
import { findUser } from "@/lib/mock-data";

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
        <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground">
          <MessageCircle className="h-4 w-4" /> {post.comments}
        </button>
        <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground">
          <Bookmark className="h-4 w-4" /> {post.saves}
        </button>
        <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-muted hover:text-foreground">
          <Share2 className="h-4 w-4" /> Compartilhar
        </button>
      </footer>
    </article>
  );
}
