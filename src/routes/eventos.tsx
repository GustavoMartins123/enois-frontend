import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/require-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Users, MapPin, Video, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { eventsApi } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";

const formatLabels: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "Presencial",
  HYBRID: "Híbrido",
};

const MONTHS = ["", "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export const Route = createFileRoute("/eventos")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Eventos · Conexão" }] }),
  component: Eventos,
});

function Eventos() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list(),
  });

  const events = eventsData?.items ?? [];

  const attend = useMutation({
    mutationFn: (eventId: string) => eventsApi.attend(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  const createEvent = useMutation({
    mutationFn: (data: {
      title: string;
      date: string;
      time: string;
      format: string;
      host: string;
      cover?: string | null;
    }) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setOpen(false);
    },
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 sm:gap-4 sm:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Eventos da comunidade</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Webinars, meetups, workshops e encontros — online e presenciais.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full gap-1.5">
                <Plus className="h-4 w-4" /> Criar evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar evento</DialogTitle>
              </DialogHeader>
              <CreateEventForm
                onSave={(data) => createEvent.mutate(data)}
                isPending={createEvent.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => {
            const formatLabel = formatLabels[e.format] ?? e.format;
            const Icon = e.format === "ONLINE" ? Video : MapPin;
            const [year, month, day] = (e.date ?? "").split("-");
            return (
              <article key={e.id} className="surface-card overflow-hidden">
                <div className="relative">
                  {e.cover ? (
                    <img src={resolveCdnUrl(e.cover)} alt="" className="h-40 w-full object-cover" />
                  ) : (
                    <div className="h-40 w-full bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                  <div className="absolute left-4 top-4 rounded-xl bg-card/95 px-3 py-2 text-center shadow-md backdrop-blur">
                    <p className="text-[10px] font-medium uppercase text-primary">
                      {MONTHS[Number(month)] ?? month}
                    </p>
                    <p className="text-lg font-semibold leading-none">{day ?? ""}</p>
                  </div>
                </div>
                <div className="p-5">
                  <Badge variant="outline" className="rounded-full bg-card font-normal">
                    <Icon className="mr-1 h-3 w-3" /> {formatLabel}
                  </Badge>
                  <h3 className="mt-2 break-words font-semibold">{e.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">por {e.host}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> {e.date ?? ""} · {e.time ?? ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> {e.attendees ?? 0}
                    </span>
                  </div>
                  <Button
                    className="mt-4 w-full rounded-full"
                    disabled={attend.isPending}
                    onClick={() => attend.mutate(e.id)}
                  >
                    Confirmar presença
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      
    </AppShell>
  );
}

function CreateEventForm({
  onSave,
  isPending,
}: {
  onSave: (data: { title: string; date: string; time: string; format: string; host: string }) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [format, setFormat] = useState("ONLINE");
  const [host, setHost] = useState("");

  return (
    <div className="space-y-4 pt-2">
      <Field label="Título">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Data">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Horário">
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
      <Field label="Realizador">
        <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder="Comunidade X" />
      </Field>
      <Field label="Formato">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="ONLINE">Online</option>
          <option value="IN_PERSON">Presencial</option>
          <option value="HYBRID">Híbrido</option>
        </select>
      </Field>
      <Button
        className="w-full rounded-full"
        disabled={!title.trim() || !date || !host.trim() || isPending}
        onClick={() => onSave({ title, date, time, format, host })}
      >
        {isPending ? "Criando..." : "Criar evento"}
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
