import { useEffect, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute, useMatchRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { Community } from "@/types/application/community/community";
import type { CommunityTopic } from "@/types/application/community/community-topic";
import type { CreateCommunityDialogProps } from "@/types/routes/communities/create-community-dialog-props";
import { Loader2, Plus, Users } from "lucide-react";

import { communitiesApi } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";
import { requireAuth } from "@/lib/require-auth";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
] as const;

const TOPIC_LABELS: Record<(typeof TOPICS)[number], string> = {
  Todas: texts.communities.topics.all,
  TECNOLOGIA: texts.communities.topics.TECNOLOGIA,
  ENGENHARIA: texts.communities.topics.ENGENHARIA,
  DESIGN: texts.communities.topics.DESIGN,
  PRODUTO: texts.communities.topics.PRODUTO,
  LIDERANCA: texts.communities.topics.LIDERANCA,
  CARREIRA: texts.communities.topics.CARREIRA,
  FREELANCE: texts.communities.topics.FREELANCE,
};

export const Route = createFileRoute("/comunidades")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.communities.seoTitle }] }),
  component: Comunidades,
});

function Comunidades() {
  const queryClient = useQueryClient();
  const matchRoute = useMatchRoute();
  const [topic, setTopic] = useState<CommunityTopic | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allItems, setAllItems] = useState<Community[]>([]);
  const [leaveTarget, setLeaveTarget] = useState<Community | null>(null);
  const [ownerBlockedId, setOwnerBlockedId] = useState<string | null>(null);
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

  const handleTopicChange = (t: (typeof TOPICS)[number]) => {
    setTopic(t === "Todas" ? undefined : t);
    setCursor(undefined);
    setAllItems([]);
  };

  const join = useMutation({
    mutationFn: (id: string) => communitiesApi.join(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
  });

  const leave = useMutation({
    mutationFn: (id: string) => communitiesApi.leave(id),
    onSuccess: () => {
      setLeaveTarget(null);
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
    onError: () => {
      // Dono não sai sem transferir: orientamos a abrir a comunidade para transferir.
      setLeaveTarget(null);
      setOwnerBlockedId(leaveTarget?.id ?? null);
    },
  });

  if (isDetail) {
    return <Outlet />;
  }

  return (
    <AppContainer>
      <div className="space-y-6">
        <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 sm:gap-4 sm:p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{texts.communities.title}</h1>

            <p className="mt-1 text-sm text-muted-foreground">{texts.communities.description}</p>
          </div>

          <CreateCommunityDialog open={open} onOpenChange={setOpen}>
            <Button className="rounded-full gap-1.5">
              <Plus className="h-4 w-4" />

              <>{texts.communities.createCommunity}</>
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
              {TOPIC_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allItems.map((c) => (
            <Link
              key={c.id}
              to="/comunidades/$communityId"
              params={{ communityId: c.id }}
              className="min-w-0"
            >
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

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0" />

                      <span className="truncate">{texts.communities.members(c.members ?? 0)}</span>
                    </span>

                    <Button
                      size="sm"
                      variant={c.joined ? "secondary" : "default"}
                      className="shrink-0 whitespace-nowrap rounded-full"
                      disabled={join.isPending || leave.isPending}
                      onClick={(e) => {
                        e.preventDefault();
                        if (c.joined) {
                          setLeaveTarget(c);
                        } else {
                          join.mutate(c.id);
                        }
                      }}
                    >
                      {c.joined ? texts.communities.participating : texts.communities.enter}
                    </Button>
                  </div>

                  {ownerBlockedId === c.id && (
                    <p className="mt-2 text-xs text-destructive">{texts.communities.ownerLeaveBlocked}</p>
                  )}
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
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                texts.communities.loadMore
              )}
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={leaveTarget !== null}
        onOpenChange={(open) => !open && setLeaveTarget(null)}
        title={texts.communities.leave.title}
        description={
          leaveTarget
            ? texts.communities.leave.description(leaveTarget.name)
            : ""
        }
        confirmLabel={texts.communities.leave.confirm}
        destructive
        pending={leave.isPending}
        onConfirm={() => leaveTarget && leave.mutate(leaveTarget.id)}
      />
    </AppContainer>
  );
}

function CreateCommunityDialog({ children, open, onOpenChange }: CreateCommunityDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState<CommunityTopic>("TECNOLOGIA");

  const create = useMutation({
    mutationFn: () => communitiesApi.create({ name, description, topic }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
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
          <DialogTitle>{texts.communities.create.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{texts.communities.create.name}</Label>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 border-transparent bg-muted"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {texts.communities.create.description}
            </Label>

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              // Sem `h-10`: brigava com o `min-h-[60px]` do primitivo e o campo não respeitava
              // as `rows`. Aqui a descrição merece as 3 linhas.
              className="border-transparent bg-muted"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {texts.communities.create.topic}
            </Label>

            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as CommunityTopic)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10 border-transparent bg-muted"
            >
              {TOPICS.filter((t) => t !== "Todas").map((t) => (
                <option key={t} value={t}>
                  {TOPIC_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <Button
            className="w-full rounded-full"
            disabled={!name.trim() || !description.trim() || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? texts.common.creating : texts.common.create}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
