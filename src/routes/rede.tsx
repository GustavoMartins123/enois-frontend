import { createFileRoute, Link } from "@tanstack/react-router";
import { UserPlus, Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/mock-data";

export const Route = createFileRoute("/rede")({
  head: () => ({ meta: [{ title: "Rede · Conexão" }] }),
  component: Rede,
});

function Rede() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="surface-card p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Sua rede</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Construa relacionamentos por afinidade, não por volume.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Conexões" value="482" />
            <Stat label="Seguindo" value="318" />
            <Stat label="Solicitações" value="7" highlight />
            <Stat label="Sugestões" value="24" />
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold">Pessoas que combinam com você</h2>
              <p className="text-sm text-muted-foreground">Baseado em habilidades, objetivos e comunidades em comum.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((u) => (
              <article key={u.id} className="surface-card overflow-hidden text-center">
                <div className="h-16" style={{ background: "var(--gradient-soft)" }} />
                <div className="-mt-10 px-5 pb-5">
                  <Avatar className="mx-auto h-20 w-20 ring-4 ring-card">
                    <AvatarImage src={u.avatar} alt={u.name} />
                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <Link
                    to="/perfil/$username"
                    params={{ username: u.username }}
                    className="mt-3 block font-semibold hover:underline"
                  >
                    {u.name}
                  </Link>
                  <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground">
                    {u.headline}
                  </p>
                  <p className="mt-2 text-xs text-primary">
                    <Check className="mr-1 inline h-3 w-3" />
                    3 interesses em comum
                  </p>
                  <Button className="mt-4 w-full rounded-full gap-1.5" variant="outline">
                    <UserPlus className="h-4 w-4" /> Conectar
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-primary/30 bg-primary-soft" : "border-border bg-muted/40"}`}>
      <p className={`text-2xl font-semibold ${highlight ? "text-primary" : ""}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
