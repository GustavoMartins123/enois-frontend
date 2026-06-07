import { createFileRoute, Link } from "@tanstack/react-router";
import { requireAuth } from "@/lib/require-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { communitiesApi } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";

const TOPICS = ["Todas", "TECNOLOGIA", "ENGENHARIA", "DESIGN", "PRODUTO", "LIDERANCA", "CARREIRA", "FREELANCE"];

export const Route = createFileRoute("/comunidades")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Comunidades · Conexão" }] }),
  component: Comunidades,
});

function Comunidades() {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const { data: communitiesData } = useQuery({
    queryKey: ["communities", topic],
    queryFn: () => communitiesApi.list(topic),
  });

  const communities = communitiesData?.items ?? [];

  const join = useMutation({
    mutationFn: (id: string) => communitiesApi.join(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["communities"] }),
  });

  const leave = useMutation({
    mutationFn: (id: string) => communitiesApi.leave(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["communities"] }),
  });

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
          <CreateCommunityDialog open={open} onOpenChange={setOpen}>
            <Button className="rounded-full gap-1.5">
              <Plus className="h-4 w-4" /> Criar comunidade
            </Button>
          </CreateCommunityDialog>
        </div>

        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t === "Todas" ? undefined : t)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                (t === "Todas" && !topic) || t === topic
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((c) => (
            <Link key={c.id} to="/comunidades/$communityId" params={{ communityId: c.id }}>
              <article className="surface-card overflow-hidden cursor-pointer transition hover:shadow-[var(--shadow-card)]">
              {c.cover ? (
                <img src={resolveCdnUrl(c.cover)} alt="" className="h-32 w-full object-cover" />
              ) : (
                <div className="h-32 w-full bg-gradient-to-br from-primary/20 to-primary/5" />
              )}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {c.avatar && (
                    <img src={resolveCdnUrl(c.avatar)} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-border" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">{c.topic}</p>
                    <h3 className="font-semibold truncate">{c.name}</h3>
                  </div>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {(c.members ?? 0).toLocaleString("pt-BR")} membros
                  </span>
                  <Button
                    size="sm"
                    variant={c.joined ? "secondary" : "default"}
                    className="rounded-full"
                    disabled={join.isPending || leave.isPending}
                    onClick={() => (c.joined ? leave.mutate(c.id) : join.mutate(c.id))}
                  >
                    {c.joined ? "Participando" : "Entrar"}
                  </Button>
                </div>
              </div>
            </article>
            </Link>
          ))}
        </div>
      </div>
      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}

function CreateCommunityDialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("TECNOLOGIA");

  const create = useMutation({
    mutationFn: () => communitiesApi.create({ name, description, topic }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      onOpenChange(false);
      setName("");
      setDescription("");
      setTopic("TECNOLOGIA");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar comunidade</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tópico</Label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {TOPICS.filter((t) => t !== "Todas").map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <Button
            className="w-full rounded-full"
            disabled={!name.trim() || !description.trim() || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? "Criando..." : "Criar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
