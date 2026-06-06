import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, Briefcase, GraduationCap, Award, Link as LinkIcon, MessageCircle, UserPlus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findUserByUsername, posts } from "@/lib/mock-data";

export const Route = createFileRoute("/perfil/$username")({
  loader: ({ params }) => {
    const user = findUserByUsername(params.username);
    if (!user) throw notFound();
    return { user };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.user.name ?? "Perfil"} · Conexão` },
      { name: "description", content: loaderData?.user.headline ?? "Perfil profissional" },
    ],
  }),
  notFoundComponent: () => (
    <AppShell>
      <div className="surface-card p-10 text-center">
        <p className="text-lg font-semibold">Pessoa não encontrada</p>
        <Link to="/" className="mt-2 inline-block text-sm text-primary hover:underline">
          Voltar para o início
        </Link>
      </div>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <div className="surface-card p-10 text-center">
        <p>Não foi possível carregar este perfil.</p>
      </div>
    </AppShell>
  ),
  component: Profile,
});

function Profile() {
  const { user } = Route.useLoaderData() as { user: ReturnType<typeof findUserByUsername> & {} };
  const userPosts = posts.filter((p) => p.authorId === user.id);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="surface-card overflow-hidden">
          <div
            className="h-40 sm:h-52"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 295), oklch(0.78 0.14 320))",
            }}
          />
          <div className="px-6 pb-6">
            <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
              <Avatar className="h-28 w-28 ring-4 ring-card">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-full gap-1.5">
                  <MessageCircle className="h-4 w-4" /> Mensagem
                </Button>
                <Button className="rounded-full gap-1.5">
                  <UserPlus className="h-4 w-4" /> Conectar
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
                {user.openToWork && (
                  <span className="rounded-full bg-growth/15 px-2.5 py-0.5 text-xs font-medium text-growth">
                    Aberto a oportunidades
                  </span>
                )}
                {user.isMentor && (
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                    Mentor disponível
                  </span>
                )}
              </div>
              <p className="mt-1 text-foreground">{user.headline}</p>
              <p className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {user.company}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {user.location}</span>
                <span>· {user.connections} conexões</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Section title="Sobre">
              <p className="text-[15px] leading-relaxed text-foreground">{user.bio}</p>
            </Section>

            <Section title="Habilidades">
              <div className="flex flex-wrap gap-2">
                {user.skills.map((s) => (
                  <Badge key={s} className="rounded-full bg-primary-soft text-primary hover:bg-primary-soft">
                    {s}
                  </Badge>
                ))}
              </div>
            </Section>

            <Section title="Experiência" icon={Briefcase}>
              <Timeline
                items={[
                  { title: user.headline.split("·")[0].trim(), org: user.company, period: "2022 — Atual", desc: "Liderança de iniciativas multidisciplinares com foco em qualidade e impacto." },
                  { title: "Cargo anterior", org: "Empresa anterior", period: "2019 — 2022", desc: "Construção de produtos do zero com times pequenos e ágeis." },
                ]}
              />
            </Section>

            <Section title="Formação" icon={GraduationCap}>
              <Timeline
                items={[
                  { title: "Bacharelado em Computação", org: "Universidade Federal", period: "2014 — 2018", desc: "Foco em sistemas e interação humano-computador." },
                ]}
              />
            </Section>

            <Section title="Publicações recentes">
              {userPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ainda não há publicações.</p>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((p) => <PostCard key={p.id} post={p} />)}
                </div>
              )}
            </Section>
          </div>

          <aside className="space-y-6">
            <Section title="Reputação" icon={Award}>
              <ul className="space-y-3">
                {user.reputation.map((r) => (
                  <li key={r.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{r.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Nível {r.level}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Links">
              <ul className="space-y-2 text-sm">
                {["portfolio.exemplo.com", "github.com/" + user.username, "site.exemplo.com"].map((l) => (
                  <li key={l} className="flex items-center gap-2 text-muted-foreground">
                    <LinkIcon className="h-4 w-4" />
                    <span className="truncate">{l}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </aside>
        </div>
      </div>
      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="surface-card p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Timeline({ items }: { items: { title: string; org: string; period: string; desc: string }[] }) {
  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {items.map((it, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />
          <p className="font-medium">{it.title}</p>
          <p className="text-sm text-muted-foreground">{it.org} · {it.period}</p>
          <p className="mt-1 text-sm text-foreground/80">{it.desc}</p>
        </li>
      ))}
    </ol>
  );
}
