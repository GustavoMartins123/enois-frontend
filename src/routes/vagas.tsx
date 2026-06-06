import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Bookmark, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { jobs } from "@/lib/mock-data";

export const Route = createFileRoute("/vagas")({
  head: () => ({ meta: [{ title: "Vagas · Conexão" }] }),
  component: Vagas,
});

function Vagas() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="surface-card p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Oportunidades para você</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Curadoria baseada nas suas habilidades, objetivos e disponibilidade.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Remoto", "Híbrido", "Sênior", "Pleno", "Design", "Engenharia", "Produto"].map((t) => (
              <Badge key={t} variant="outline" className="rounded-full bg-card font-normal">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((j) => (
            <article key={j.id} className="surface-card flex flex-col p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 rounded-xl">
                  <AvatarImage src={j.logo} alt={j.company} className="rounded-xl" />
                  <AvatarFallback className="rounded-xl">{j.company[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{j.title}</h3>
                  <p className="text-sm text-muted-foreground">{j.company}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {j.location}
                  </p>
                </div>
                <button className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted">
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-primary-soft px-2.5 py-1 font-medium text-primary inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> {j.matchScore}% match
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{j.type}</span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{j.level}</span>
                {j.salary && (
                  <span className="rounded-full bg-growth/15 px-2.5 py-1 font-medium text-growth">
                    {j.salary}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {j.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="rounded-full bg-accent font-normal text-accent-foreground">
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>Publicada {j.postedAt}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full">Ver detalhes</Button>
                  <Button size="sm" className="rounded-full">Candidatar</Button>
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
