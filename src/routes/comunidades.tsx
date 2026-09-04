import { useEffect, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute, useMatchRoute } from "@tanstack/react-router";

import { Loader2, Plus, Users } from "lucide-react";

import { communitiesApi } from "@/lib/api";
import type { Community } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";
import { requireAuth } from "@/lib/require-auth";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { AppContainer } from "@/components/app-container";

const TOPICS = [
  "Todas",
  "TECNOLOGIA",
  "ENGENHARIA",
  "DESIGN",
  "PRODUTO",
  "LIDERANCA",
  "CARREIRA",
  "FREELANCE",
];

export const Route = createFileRoute("/comunidades")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Comunidades · Énóis" }] }),
  component: Comunidades,
});

function Comunidades() {
  const queryClient = useQueryClient();
  const matchRoute = useMatchRoute();
  const [topic, setTopic] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allItems, setAllItems] = useState<Community[]>([]);
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const isDetail = matchRoute({ to: "/comunidades/$communityId" });

  const { data: communitiesData, isFetching } = useQuery({
    queryKey: ["communities", topic, cursor],
    queryFn: () => communitiesApi.list(topic, cursor),
    enabled: !isDetail,
  });

  const nextCursor = communitiesData?.nextCursor ?? null;

  useEffect(() => {
    if (!communitiesData?.items) return;
    setAllItems((prev) => {
      if (cursorRef.current) {
        const existing = new Set(prev.map((c) => c.id));
        const newItems = communitiesData.items.filter((c) => !existing.has(c.id));
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      }
      return communitiesData.items;
    });
  }, [communitiesData]);

  const loadMore = () => {
    if (nextCursor && !isFetching) {
      setCursor(nextCursor);
    }
  };

  const handleTopicChange = (t: string) => {
    setTopic(t === "Todas" ? undefined : t);
    setCursor(undefined);
    setAllItems([]);
  };

  const join = useMutation({
    mutationFn: (id: string) => communitiesApi.join(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["communities"] }),
  });

  const leave = useMutation({
    mutationFn: (id: string) => communitiesApi.leave(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["communities"] }),
  });

  if (isDetail) {
    return <Outlet />;
  }

  return (
    <AppContainer>
      <div className="space-y-6">
        <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 sm:gap-4 sm:p-6">
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
              onClick={() => handleTopicChange(t)}
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
          {allItems.map((c) => (
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
                      <img
                        src={resolveCdnUrl(c.avatar)}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-primary">
                        {c.topic}
                      </p>
                      <h3 className="font-semibold truncate">{c.name}</h3>
                    </div>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {c.description}
                  </p>
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
                      onClick={(e) => {
                        e.preventDefault();
                        if (c.joined) {
                          leave.mutate(c.id);
                        } else {
                          join.mutate(c.id);
                        }
                      }}
                    >
                      {c.joined ? "Participando" : "Entrar"}
                    </Button>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {nextCursor && (
          <div className="flex justify-center pb-8">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={loadMore}
              disabled={isFetching}
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Carregar mais"}
            </Button>
          </div>
        )}
      </div>
    </AppContainer>
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
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 border-transparent bg-muted"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="h-10 border-transparent bg-muted"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tópico</Label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10 border-transparent bg-muted"
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
