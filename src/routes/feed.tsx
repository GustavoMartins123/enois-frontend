import { createFileRoute, Link } from "@tanstack/react-router";
import { Image, FileText, BarChart3, Calendar, UserPlus, TrendingUp } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { currentUser, posts, suggestedConnections, events, type Post } from "@/lib/mock-data";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Conexão · Início" },
      { name: "description", content: "Seu feed de insights, perguntas e projetos da comunidade profissional." },
    ],
  }),
  component: Home,
});

function Home() {
  const [feedPosts, setFeedPosts] = useState(posts);
  const [draft, setDraft] = useState("");
  const [postType, setPostType] = useState<Post["type"]>("insight");

  const publishPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    const nextPost: Post = {
      id: `local-${Date.now()}`,
      authorId: currentUser.id,
      createdAt: "agora",
      type: postType,
      content,
      tags: ["Comunidade", "Aprendizado"],
      reactions: 0,
      comments: 0,
      saves: 0,
    };

    setFeedPosts((current) => [nextPost, ...current]);
    setDraft("");
    setPostType("insight");
  };

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {/* Composer */}
          <form onSubmit={publishPost} className="surface-card p-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Compartilhe algo que aprendeu hoje..."
                className="min-h-11 flex-1 resize-none rounded-2xl border-border bg-muted/40 text-sm"
                maxLength={600}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-1">
                <ComposerAction
                  icon={Image}
                  label="Insight"
                  active={postType === "insight"}
                  onClick={() => setPostType("insight")}
                />
                <ComposerAction
                  icon={FileText}
                  label="Artigo"
                  active={postType === "article"}
                  onClick={() => setPostType("article")}
                />
                <ComposerAction
                  icon={BarChart3}
                  label="Pergunta"
                  active={postType === "question"}
                  onClick={() => setPostType("question")}
                />
                <ComposerAction
                  icon={Calendar}
                  label="Projeto"
                  active={postType === "project"}
                  onClick={() => setPostType("project")}
                />
              </div>
              <Button size="sm" className="rounded-full" disabled={!draft.trim()}>
                Publicar
              </Button>
            </div>
          </form>

          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-sm">
            <TabPill active>Para você</TabPill>
            <TabPill>Seguindo</TabPill>
            <TabPill>Discussões</TabPill>
            <TabPill>Projetos</TabPill>
          </div>

          <div className="space-y-4">
            {feedPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </div>

        {/* Right rail */}
        <aside className="hidden space-y-4 lg:block">
          <div className="surface-card overflow-hidden">
            <div
              className="h-16"
              style={{ background: "var(--gradient-primary)" }}
            />
            <div className="-mt-8 px-5 pb-5 text-center">
              <Avatar className="mx-auto h-16 w-16 ring-4 ring-card">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
              <Link
                to="/perfil/$username"
                params={{ username: currentUser.username }}
                className="mt-3 block font-semibold hover:underline"
              >
                {currentUser.name}
              </Link>
              <p className="line-clamp-2 text-xs text-muted-foreground">{currentUser.headline}</p>
              <div className="mt-4 grid grid-cols-2 gap-1 border-t border-border pt-3 text-xs">
                <div>
                  <p className="font-semibold text-foreground">{currentUser.connections}</p>
                  <p className="text-muted-foreground">Conexões</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{currentUser.followers}</p>
                  <p className="text-muted-foreground">Seguidores</p>
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Sugestões para você</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Com base em interesses e objetivos em comum.
            </p>
            <ul className="mt-4 space-y-3">
              {suggestedConnections.map((u) => (
                <li key={u.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={u.avatar} alt={u.name} />
                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/perfil/$username"
                      params={{ username: u.username }}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {u.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{u.headline}</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 rounded-full px-3 text-xs">
                    Conectar
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-growth" />
              <h3 className="font-semibold">Acontecendo agora</h3>
            </div>
            <ul className="mt-3 space-y-3 text-sm">
              {events.slice(0, 3).map((e) => (
                <li key={e.id}>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.date} · {e.format} · {e.attendees} confirmados
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}

function ComposerAction({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
        active ? "bg-primary-soft text-primary" : "hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function TabPill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
