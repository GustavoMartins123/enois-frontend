import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { requireAuth } from "@/lib/require-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Users, UserPlus, Settings, ArrowLeft, Send } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { communitiesApi, feedApi } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";

export const Route = createFileRoute("/comunidades/$communityId")({
  beforeLoad: requireAuth,
  loader: async ({ params }) => {
    try {
      return await communitiesApi.get(params.communityId);
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? "Comunidade"} · Conexão` }],
  }),
  component: CommunityDetail,
});

function CommunityDetail() {
  const queryClient = useQueryClient();
  const community = Route.useLoaderData();
  const [draft, setDraft] = useState("");

  const { data: live } = useQuery({
    queryKey: ["community", community.id],
    queryFn: () => communitiesApi.get(community.id),
    initialData: community,
  });

  const { data: membersData } = useQuery({
    queryKey: ["community", community.id, "members"],
    queryFn: () => communitiesApi.getMembers(community.id),
  });

  const { data: feedData } = useQuery({
    queryKey: ["community", community.id, "feed"],
    queryFn: () => communitiesApi.getFeed(community.id),
  });

  const members = membersData?.items ?? [];
  const posts = feedData?.items ?? [];

  const join = useMutation({
    mutationFn: () => communitiesApi.join(community.id),
    onSuccess: () => invalidate(),
  });

  const leave = useMutation({
    mutationFn: () => communitiesApi.leave(community.id),
    onSuccess: () => invalidate(),
  });

  const createPost = useMutation({
    mutationFn: (content: string) => feedApi.create({ type: "INSIGHT", content, communityId: community.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", community.id, "feed"] });
      setDraft("");
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["community", community.id] });
  };

  const handlePost = (e: FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    createPost.mutate(content);
  };

  const isMember = live.joined;
  const admins = members.filter((m) => m.role === "ADMIN");

  return (
    <AppShell>
      <div className="space-y-6">
        <Link to="/comunidades" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Comunidades
        </Link>

        <div className="surface-card overflow-hidden">
          {live.cover ? (
            <img src={resolveCdnUrl(live.cover)} alt="" className="h-48 w-full object-cover" />
          ) : (
            <div className="h-48 w-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge className="rounded-full bg-primary-soft text-primary hover:bg-primary-soft">
                  {live.topic}
                </Badge>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">{live.name}</h1>
                <p className="mt-1 text-muted-foreground">{live.description}</p>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {live.members} membro{live.members > 1 ? "s" : ""}
                  </span>
                  {admins.length > 0 && (
                    <span>
                      Criada por{" "}
                      <Link
                        to="/perfil/$username"
                        params={{ username: admins[0].username }}
                        className="font-medium text-foreground hover:underline"
                      >
                        {admins[0].name}
                      </Link>
                    </span>
                  )}
                </div>
              </div>
              <Button
                className="rounded-full shrink-0"
                variant={isMember ? "secondary" : "default"}
                disabled={join.isPending || leave.isPending}
                onClick={() => (isMember ? leave.mutate() : join.mutate())}
              >
                {isMember ? "Participando" : "Entrar"}
              </Button>
            </div>
          </div>
        </div>

        {isMember && (
          <form onSubmit={handlePost} className="surface-card p-5">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Compartilhe algo com a comunidade..."
              className="min-h-20 resize-none rounded-2xl border-border bg-muted/40 text-sm"
              maxLength={1024}
            />
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                className="rounded-full gap-1.5"
                disabled={!draft.trim() || createPost.isPending}
              >
                <Send className="h-4 w-4" /> {createPost.isPending ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </form>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Feed</h2>
            {posts.length === 0 ? (
              <p className="surface-card p-8 text-center text-sm text-muted-foreground">
                {isMember ? "Nenhum post ainda. Seja o primeiro!" : "Entre na comunidade para ver o feed."}
              </p>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>

          <aside className="space-y-4">
            <div className="surface-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Membros ({members.length})</h3>
              <div className="space-y-3">
                {members.map((m) => (
                  <div key={m.userId} className="flex items-center gap-3">
                    <Link to="/perfil/$username" params={{ username: m.username }}>
                      <UserAvatar src={m.avatar} alt={m.name} className="h-9 w-9 shrink-0" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/perfil/$username"
                        params={{ username: m.username }}
                        className="truncate text-sm font-medium hover:underline"
                      >
                        {m.name}
                      </Link>
                      {m.role === "ADMIN" && (
                        <Badge variant="outline" className="ml-2 rounded-full text-[10px] px-1.5 py-0">
                          ADMIN
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
