import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/require-auth";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, MapPin, Video } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { eventsApi } from "@/lib/api";

const formatLabels: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "Presencial",
  HYBRID: "Híbrido",
};

export const Route = createFileRoute("/eventos")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Eventos · Conexão" }] }),
  component: Eventos,
});

function Eventos() {
  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list(),
  });

  const events = eventsData?.items ?? [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="surface-card p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Eventos da comunidade</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Webinars, meetups, workshops e encontros — online e presenciais.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => {
            const formatLabel = formatLabels[e.format] ?? e.format;
            const Icon = e.format === "ONLINE" ? Video : MapPin;
            const dateParts = e.date.split("T")[0]?.split("-") ?? [];
            const day = dateParts[2] ?? "";
            const month = dateParts[1] ?? "";
            return (
              <article key={e.id} className="surface-card overflow-hidden">
                <div className="relative">
                  {e.cover && <img src={e.cover} alt="" className="h-40 w-full object-cover" />}
                  {!e.cover && (
                    <div className="h-40 w-full bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                  <div className="absolute left-4 top-4 rounded-xl bg-card/95 px-3 py-2 text-center shadow-md backdrop-blur">
                    <p className="text-[10px] font-medium uppercase text-primary">{month}</p>
                    <p className="text-lg font-semibold leading-none">{day}</p>
                  </div>
                </div>
                <div className="p-5">
                  <Badge variant="outline" className="rounded-full bg-card font-normal">
                    <Icon className="mr-1 h-3 w-3" /> {formatLabel}
                  </Badge>
                  <h3 className="mt-2 font-semibold">{e.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">por {e.host}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> {e.date} · {e.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> {e.attendees}
                    </span>
                  </div>
                  <Button className="mt-4 w-full rounded-full">Confirmar presença</Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
