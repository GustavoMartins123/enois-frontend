import { createFileRoute, Link } from "@tanstack/react-router";
import { requireAuth } from "@/lib/require-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image, FileText, BarChart3, Calendar, UserPlus, TrendingUp, X, Film } from "lucide-react";
import { useState, useRef, type FormEvent } from "react";
import { useMediaUpload } from "@/lib/use-media-upload";
import type { UploadResult } from "@/lib/use-media-upload";

interface MediaItem {
  type: "image" | "video";
  file: File;
  preview: string;
}
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { feedApi, networkApi, eventsApi, profileApi, ApiError } from "@/lib/api";
import type { PostView } from "@/lib/api";

export const Route = createFileRoute("/feed")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Conexão · Início" },
      {
        name: "description",
        content: "Seu feed de insights, perguntas e projetos da comunidade profissional.",
      },
    ],
  }),
  component: Home,
});

function useFeed(tab: string) {
  return useQuery({
    queryKey: ["feed", tab],
    queryFn: () => feedApi.list(null, 20, tab),
  });
}

function useProfile() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => profileApi.me(),
  });
}

function useSuggestions() {
  return useQuery({
    queryKey: ["network", "suggestions"],
    queryFn: () => networkApi.suggestions(4),
  });
}

function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list(),
  });
}

function Home() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("FOR_YOU");
  const { data: feedData } = useFeed(tab);
  const { data: profile } = useProfile();
  const { data: suggestions } = useSuggestions();
  const { data: eventsData } = useEvents();

  const [draft, setDraft] = useState("");
  const [postType, setPostType] = useState<PostView["type"]>("INSIGHT");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useMediaUpload();

  const createPost = useMutation({
    mutationFn: (data: { content: string; type: PostView["type"]; mediaIds?: string[] }) =>
      feedApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const publishPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    try {
      let mediaIds: string[] = [];
      if (media.length > 0) {
        const results = await upload.uploadAll(
          media.map(m => ({ file: m.file }))
        );
        mediaIds = results.map(r => r.mediaId);
      }
      await createPost.mutateAsync({ content, type: postType, mediaIds });
      setDraft("");
      setPostType("INSIGHT");
      setMedia([]);
    } catch {
      // error handled by mutation state
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) continue;

      const hasExistingImages = media.some(m => m.type === "image");
      const hasExistingVideo = media.some(m => m.type === "video");

      if (isVideo && (hasExistingImages || hasExistingVideo || media.length >= 1)) break;
      if (isImage && hasExistingVideo) break;
      if (isImage && media.length >= 4) break;

      const preview = URL.createObjectURL(file);
      setMedia(prev => [...prev, { type: isVideo ? "video" : "image", file, preview }]);
    }
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMedia(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const mediaType = media.length > 0 ? (media[0].type === "image" ? "image" : "video") : null;

  const feedPosts = feedData?.items ?? [];
  const profileUser = profile;
  const suggestionList = suggestions ?? [];
  const eventList = eventsData?.items ?? [];

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {/* Composer */}
          <form onSubmit={publishPost} className="surface-card p-5">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={profileUser?.avatar}
                alt={profileUser?.name ?? "Você"}
                className="h-11 w-11"
              />
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Compartilhe algo que aprendeu hoje..."
                className="min-h-11 flex-1 resize-none rounded-2xl border-border bg-muted/40 text-sm"
                maxLength={600}
              />
            </div>

            {media.length > 0 && (
              <div className="relative mt-3">
                {mediaType === "image" ? (
                  <div className={`grid gap-2 ${
                    media.length === 1 ? "grid-cols-1" :
                    media.length === 2 ? "grid-cols-2" :
                    "grid-cols-2"
                  }`}>
                    {media.map((item, i) => (
                      <div key={i} className="relative overflow-hidden rounded-xl border border-border">
                        <img
                          src={item.preview}
                          alt=""
                          className="h-48 w-full object-cover bg-muted"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia(i)}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/80 text-foreground shadow hover:bg-background"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-xl border border-border">
                    <video
                      src={media[0].preview}
                      controls
                      className="max-h-64 w-full bg-muted"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(0)}
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/80 text-foreground shadow hover:bg-background"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleMediaSelect}
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-1">
                <ComposerAction
                  icon={Image}
                  label="Insight"
                  active={postType === "INSIGHT"}
                  onClick={() => setPostType("INSIGHT")}
                />
                <ComposerAction
                  icon={FileText}
                  label="Artigo"
                  active={postType === "ARTICLE"}
                  onClick={() => setPostType("ARTICLE")}
                />
                <ComposerAction
                  icon={BarChart3}
                  label="Pergunta"
                  active={postType === "QUESTION"}
                  onClick={() => setPostType("QUESTION")}
                />
                <ComposerAction
                  icon={Calendar}
                  label="Projeto"
                  active={postType === "PROJECT"}
                  onClick={() => setPostType("PROJECT")}
                />
                <ComposerAction
                  icon={mediaType === "video" ? Film : Image}
                  label={mediaType === "video" ? "Vídeo" : media.length > 0 ? `${media.length} mídia` : "Mídia"}
                  active={media.length > 0}
                  onClick={() => fileRef.current?.click()}
                />
              </div>
              <div className="flex items-center gap-2">
                {upload.status === "uploading" && (
                  <span className="text-xs text-muted-foreground">Enviando... {upload.progress}%</span>
                )}
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={!draft.trim() || createPost.isPending || upload.status === "uploading"}
                >
                  {createPost.isPending ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </div>
          </form>

          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-sm">
            <TabPill active={tab === "FOR_YOU"} onClick={() => setTab("FOR_YOU")}>Para você</TabPill>
            <TabPill active={tab === "FOLLOWING"} onClick={() => setTab("FOLLOWING")}>Seguindo</TabPill>
            <TabPill active={tab === "RECENT"} onClick={() => setTab("RECENT")}>Discussões</TabPill>
            <TabPill active={tab === "PROJECTS"} onClick={() => setTab("PROJECTS")}>Projetos</TabPill>
          </div>

          <div className="space-y-4">
            {feedPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </div>

        {/* Right rail */}
        <aside className="hidden space-y-4 lg:block">
          {profileUser && (
            <div className="surface-card overflow-hidden">
              <div className="h-16" style={{ background: "var(--gradient-primary)" }} />
              <div className="-mt-8 px-5 pb-5 text-center">
                <UserAvatar
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="mx-auto h-16 w-16 ring-4 ring-card"
                />
                <Link
                  to="/perfil/$username"
                  params={{ username: profileUser.username }}
                  className="mt-3 block font-semibold hover:underline"
                >
                  {profileUser.name}
                </Link>
                <p className="line-clamp-2 text-xs text-muted-foreground">{profileUser.headline}</p>
                <div className="mt-4 grid grid-cols-2 gap-1 border-t border-border pt-3 text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{profileUser.connectionsCount}</p>
                    <p className="text-muted-foreground">Conexões</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{profileUser.followersCount}</p>
                    <p className="text-muted-foreground">Seguidores</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {suggestionList.length > 0 && (
            <div className="surface-card p-5">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Sugestões para você</h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Com base em interesses e objetivos em comum.
              </p>
              <ul className="mt-4 space-y-3">
                {suggestionList.map((u) => (
                  <li key={u.id} className="flex items-center gap-3">
                    <UserAvatar src={u.avatar} alt={u.name} className="h-10 w-10" />
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/perfil/$username"
                        params={{ username: u.username }}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {u.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{u.headline}</p>
                    </div>
      <Button size="sm" variant="outline" className="h-8 rounded-full px-3 text-xs" onClick={() => {
        networkApi.connect(u.id).then(() => queryClient.invalidateQueries({ queryKey: ["network", "suggestions"] }));
      }}>
        Conectar
      </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {eventList.length > 0 && (
            <div className="surface-card p-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-growth" />
                <h3 className="font-semibold">Acontecendo agora</h3>
              </div>
              <ul className="mt-3 space-y-3 text-sm">
                {eventList.slice(0, 3).map((e) => (
                  <li key={e.id}>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.date} · {e.format} · {e.attendees} confirmados
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}

function ComposerAction({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
        active ? "bg-primary-soft text-primary" : "hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function TabPill({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
