import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/require-auth";
import { useQuery } from "@tanstack/react-query";
import { Users, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { communitiesApi } from "@/lib/api";

export const Route = createFileRoute("/comunidades")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Comunidades · Conexão" }] }),
  component: Comunidades,
});

function Comunidades() {
  const { data: communitiesData } = useQuery({
    queryKey: ["communities"],
    queryFn: () => communitiesApi.list(),
  });

  const communities = communitiesData?.items ?? [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Comunidades</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Encontre grupos profissionais, fóruns temáticos e círculos de mentoria.
            </p>
          </div>
          <Button className="rounded-full gap-1.5">
            <Plus className="h-4 w-4" /> Criar comunidade
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {["Todas", "Engenharia", "Design", "Produto", "Liderança", "Carreira", "Freelance"].map(
            (t, i) => (
              <button
                key={t}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                  i === 0
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ),
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((c) => (
            <article key={c.id} className="surface-card overflow-hidden">
              {c.cover && <img src={c.cover} alt="" className="h-32 w-full object-cover" />}
              {!c.cover && (
                <div className="h-32 w-full bg-gradient-to-br from-primary/20 to-primary/5" />
              )}
              <div className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  {c.topic}
                </p>
                <h3 className="mt-1 font-semibold">{c.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {c.memberCount.toLocaleString("pt-BR")} membros
                  </span>
                  <Button
                    size="sm"
                    variant={c.joined ? "secondary" : "default"}
                    className="rounded-full"
                  >
                    {c.joined ? "Participando" : "Entrar"}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
