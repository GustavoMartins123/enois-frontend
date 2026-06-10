import { createFileRoute, Link } from "@tanstack/react-router";
import { requireAuth } from "@/lib/require-auth";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { feedApi } from "@/lib/api";

export const Route = createFileRoute("/salvos")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Posts salvos · Conexão" }] }),
  component: SavedPosts,
});

function SavedPosts() {
  const { data: savedData } = useQuery({
    queryKey: ["saved-posts"],
    queryFn: () => feedApi.listSaved(),
  });

  const savedPosts = savedData?.items ?? [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="surface-card p-6">
          <div className="flex items-center gap-3">
            <Link
              to="/feed"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Posts salvos</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {savedPosts.length} post{savedPosts.length !== 1 ? "s" : ""} salvo
            {savedPosts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {savedPosts.length === 0 ? (
          <div className="surface-card p-8 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Nenhum post salvo ainda. Salve posts para encontrá-los facilmente depois.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
      
    </AppShell>
  );
}
