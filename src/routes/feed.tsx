import { createFileRoute, Link } from "@tanstack/react-router";
import { Image, FileText, BarChart3, Calendar, UserPlus, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { currentUser, posts, suggestedConnections, events } from "@/lib/mock-data";

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
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {/* Composer */}
          <div className="surface-card p-5">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
              <button className="flex-1 rounded-full border border-border bg-muted/40 px-4 py-2.5 text-left text-sm text-muted-foreground transition hover:bg-muted">
                Compartilhe algo que aprendeu hoje...
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-1">
                <ComposerAction icon={Image} label="Mídia" />
                <ComposerAction icon={FileText} label="Artigo" />
                <ComposerAction icon={BarChart3} label="Enquete" />
                <ComposerAction icon={Calendar} label="Evento" />
              </div>
              <Button size="sm" className="rounded-full">Publicar</Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-sm">
            <TabPill active>Para você</TabPill>
            <TabPill>Seguindo</TabPill>
            <TabPill>Discussões</TabPill>
            <TabPill>Projetos</TabPill>
          </div>

          <div className="space-y-4">
            {posts.map((p) => (
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

function ComposerAction({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:bg-muted hover:text-foreground">
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
