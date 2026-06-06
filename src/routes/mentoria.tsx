import { createFileRoute, Link } from "@tanstack/react-router";
import { requireAuth } from "@/lib/require-auth";
import { useQuery } from "@tanstack/react-query";
import { Star, Calendar, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mentorsApi, profileApi } from "@/lib/api";

export const Route = createFileRoute("/mentoria")({
  head: () => ({ meta: [{ title: "Mentoria · Conexão" }] }),
  component: Mentoria,
});

function Mentoria() {
  const { data: mentorsData } = useQuery({
    queryKey: ["mentors"],
    queryFn: () => mentorsApi.list(),
  });

  const mentors = mentorsData?.items ?? [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div
          className="surface-card relative overflow-hidden p-8"
          style={{ background: "var(--gradient-soft)" }}
        >
          <div className="relative max-w-2xl">
            <Badge className="rounded-full bg-primary-soft text-primary hover:bg-primary-soft">
              <Sparkles className="mr-1 h-3 w-3" /> Mentoria nativa
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Aprenda com quem já passou por onde você quer chegar.
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sessões reais com mentores verificados — sem performance, sem ruído. Avaliações
              honestas, trilhas de aprendizado e agendamento em um clique.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button className="rounded-full">Encontrar mentor</Button>
              <Button variant="outline" className="rounded-full">
                Tornar-me mentor
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Mentores em destaque</h2>
          <p className="text-sm text-muted-foreground">
            Avaliados pela comunidade nas últimas 8 semanas.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mentors.map((m) => (
              <MentorCard key={m.id} mentor={m} />
            ))}
          </div>
        </div>
      </div>
      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}

function MentorCard({
  mentor,
}: {
  mentor: {
    id: string;
    userId: string;
    expertise: string[];
    rating: number;
    sessions: number;
    price: string;
    nextSlot: string;
  };
}) {
  const { data: user } = useQuery({
    queryKey: ["profile", mentor.userId],
    queryFn: () => profileApi.get(mentor.userId),
  });

  return (
    <article className="surface-card flex flex-col p-5">
      <div className="flex items-start gap-3">
        <UserAvatar src={user?.avatar} alt={user?.name ?? "Mentor"} className="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <Link
            to="/perfil/$username"
            params={{ username: user?.username ?? mentor.userId }}
            className="block truncate font-semibold hover:underline"
          >
            {user?.name ?? "Mentor"}
          </Link>
          <p className="line-clamp-2 text-xs text-muted-foreground">{user?.headline ?? ""}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {mentor.expertise.map((e) => (
          <Badge
            key={e}
            variant="secondary"
            className="rounded-full bg-accent font-normal text-accent-foreground"
          >
            {e}
          </Badge>
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Avaliação</dt>
          <dd className="mt-0.5 inline-flex items-center gap-1 font-semibold">
            <Star className="h-3.5 w-3.5 fill-opportunity text-opportunity" /> {mentor.rating}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Sessões</dt>
          <dd className="mt-0.5 font-semibold">{mentor.sessions}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Investimento</dt>
          <dd className="mt-0.5 font-medium">{mentor.price}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Próxima vaga</dt>
          <dd className="mt-0.5 inline-flex items-center gap-1 font-medium">
            <Calendar className="h-3.5 w-3.5" /> {mentor.nextSlot}
          </dd>
        </div>
      </dl>

      <Button className="mt-4 w-full rounded-full">Agendar sessão</Button>
    </article>
  );
}
