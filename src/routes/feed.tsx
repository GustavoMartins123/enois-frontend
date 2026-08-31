import { type FormEvent, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import {
  BarChart3,
  Calendar,
  FileText,
  Film,
  Image,
  Loader2,
  TrendingUp,
  UserPlus,
  X,
} from "lucide-react";

import { ApiError, eventsApi, feedApi, networkApi, profileApi } from "@/lib/api";
import type { PostView } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";
import { useMediaUpload } from "@/lib/use-media-upload";
import type { UploadResult } from "@/lib/use-media-upload";

import { Button } from "@/components/ui/button";

import { AppShell } from "@/components/app-shell";
import { MentionTextarea } from "@/components/mention-textarea";
import { PostCard } from "@/components/post-card";
import { UserAvatar } from "@/components/user-avatar";

interface MediaItem {
  type: "image" | "video";
  file: File;
  preview: string;
}

export const Route = createFileRoute("/feed")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Énóis · Início" },
      {
        name: "description",
        content: "Seu feed de insights, perguntas e projetos da comunidade profissional.",
      },
    ],
  }),
  component: Home,
});

function useFeed(tab: string | undefined) {
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
  const [tab, setTab] = useState<string | undefined>("FOR_YOU");
  const { data: feedData } = useFeed(tab);
  const { data: profile } = useProfile();
  const { data: suggestions } = useSuggestions();
  const { data: eventsData } = useEvents();

  const [draft, setDraft] = useState("");
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [postType, setPostType] = useState<PostView["type"]>("INSIGHT");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [publishError, setPublishError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useMediaUpload();

  const createPost = useMutation({
    mutationFn: (data: {
      content: string;
      type: PostView["type"];
      mediaIds?: string[];
      mentionedUserIds?: string[];
    }) => feedApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const publishPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    setPublishError(null);
    try {
      let mediaIds: string[] = [];
      if (media.length > 0) {
        const results = await upload.uploadAll(media.map((m) => ({ file: m.file })));
        mediaIds = results.map((r) => r.mediaId);
      }
      await createPost.mutateAsync({ content, type: postType, mediaIds, mentionedUserIds });
      setDraft("");
      setMentionedUserIds([]);
      setPostType("INSIGHT");
      setMedia([]);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Erro ao publicar. Tente novamente.");
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) continue;

      const hasExistingImages = media.some((m) => m.type === "image");
      const hasExistingVideo = media.some((m) => m.type === "video");

      if (isVideo && (hasExistingImages || hasExistingVideo || media.length >= 1)) break;
      if (isImage && hasExistingVideo) break;
      if (isImage && media.length >= 4) break;

      const preview = URL.createObjectURL(file);
      setMedia((prev) => [...prev, { type: isVideo ? "video" : "image", file, preview }]);
    }
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => {
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
        <div className="min-w-0 space-y-4">
          {/* Composer */}
          <form
            onSubmit={publishPost}
            className="rounded-2xl border border-border-soft bg-surface-card p-4 sm:p-5"
          >
            <div className="flex items-center gap-3">
              <UserAvatar
                src={profileUser?.avatar}
                alt={profileUser?.name ?? "Você"}
                className="h-11 w-11"
              />
              <MentionTextarea
                value={draft}
                onChange={(val, ids) => {
                  setDraft(val);
                  setMentionedUserIds(ids);
                }}
                placeholder="Compartilhe algo que aprendeu hoje..."
                className="min-h-11 flex-1 resize-none rounded-2xl border-border-soft bg-surface-1 px-3 py-2 text-[14px] font-light"
                maxLength={600}
              />
            </div>

            {media.length > 0 && (
              <div className="relative mt-3">
                {mediaType === "image" ? (
                  <div
                    className={`grid gap-2 ${media.length === 1
                      ? "grid-cols-1"
                      : media.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-2"
                      }`}
                  >
                    {media.map((item, i) => (
                      <div
                        key={i}
                        className="relative overflow-hidden rounded-xl border border-border-soft"
                      >
                        <img
                          src={item.preview}
                          alt=""
                          className="h-48 w-full object-cover bg-surface-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia(i)}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-surface-card/80 text-text-strong shadow hover:bg-surface-card"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-xl border border-border-soft">
                    <video
                      src={media[0].preview}
                      controls
                      className="max-h-64 w-full bg-surface-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(0)}
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-surface-card/80 text-text-strong shadow hover:bg-surface-card"
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

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-soft pt-3 text-[13px] font-light text-text-subtle">
              <div className="flex flex-wrap gap-1.5">
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
                  label={
                    mediaType === "video"
                      ? "Vídeo"
                      : media.length > 0
                        ? `${media.length} mídia`
                        : "Mídia"
                  }
                  active={media.length > 0}
                  onClick={() => fileRef.current?.click()}
                />
              </div>
              <div className="flex items-center gap-2">
                {publishError && (
                  <p className="max-w-[200px] truncate text-[12px] font-light text-destructive">
                    {publishError}
                  </p>
                )}
                {!publishError && upload.status === "uploading" && (
                  <span className="text-[12px] font-light text-text-subtle">
                    Enviando... {upload.progress}%
                  </span>
                )}
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={!draft.trim() || createPost.isPending || upload.status === "uploading"}
                >
                  {createPost.isPending || upload.status === "uploading" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                      {upload.status === "uploading" ? "Enviando..." : "Publicando..."}
                    </>
                  ) : (
                    "Publicar"
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <TabPill active={tab === "FOR_YOU"} onClick={() => setTab("FOR_YOU")}>
              Para você
            </TabPill>
            <TabPill active={tab === "ALL"} onClick={() => setTab("ALL")}>
              Tudo
            </TabPill>
            <TabPill active={tab === "FOLLOWING"} onClick={() => setTab("FOLLOWING")}>
              Seguindo
            </TabPill>
            <TabPill active={tab === "RECENT"} onClick={() => setTab("RECENT")}>
              Discussões
            </TabPill>
            <TabPill active={tab === "PROJECTS"} onClick={() => setTab("PROJECTS")}>
              Projetos
            </TabPill>
          </div>

          <div className="space-y-4">
            {feedPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </div>

        {/* Right rail */}
        <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] space-y-4 overflow-y-auto lg:block">
          {profileUser && (
            <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface-card">
              <div className="h-14" style={{ background: "var(--gradient-primary)" }} />
              <div className="-mt-7 px-4 pb-4 text-center">
                <UserAvatar
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="mx-auto h-16 w-16 ring-4 ring-surface-card"
                />
                <Link
                  to="/perfil/$username"
                  params={{ username: profileUser.username }}
                  className="mt-2 block text-[14px] font-light text-text-strong hover:underline"
                >
                  {profileUser.name}
                </Link>
                <p className="line-clamp-2 text-[12px] font-light text-text-subtle">
                  {profileUser.headline}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-1 border-t border-border-soft pt-3 text-[12px]">
                  <div>
                    <p className="font-light text-text-strong">{profileUser.connectionsCount}</p>
                    <p className="text-text-subtle">Conexões</p>
                  </div>
                  <div>
                    <p className="font-light text-text-strong">{profileUser.followersCount}</p>
                    <p className="text-text-subtle">Seguidores</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {suggestionList.length > 0 && (
            <div className="rounded-2xl border border-border-soft bg-surface-card p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <h3 className="text-[14px] font-light text-text-strong">Sugestões para você</h3>
              </div>
              <p className="mt-0.5 text-[12px] font-light text-text-subtle">
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
                        className="block truncate text-[13px] font-light text-text-strong hover:underline"
                      >
                        {u.name}
                      </Link>
                      <p className="truncate text-[11px] font-light text-text-subtle">
                        {u.headline}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded-full border border-border-soft px-3 py-1 text-[12px] font-light text-text-subtle transition hover:border-primary hover:text-primary"
                      onClick={() => {
                        networkApi
                          .connect(u.id)
                          .then(() =>
                            queryClient.invalidateQueries({ queryKey: ["network", "suggestions"] }),
                          );
                      }}
                    >
                      Conectar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {eventList.length > 0 && (
            <div className="rounded-2xl border border-border-soft bg-surface-card p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-[14px] font-light text-text-strong">Acontecendo agora</h3>
              </div>
              <ul className="mt-3 space-y-3">
                {eventList.slice(0, 3).map((e) => (
                  <li key={e.id}>
                    <p className="text-[13px] font-light text-text-strong">{e.title}</p>
                    <p className="text-[11px] font-light text-text-subtle">
                      {e.date} · {e.format} · {e.attendees} confirmados
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
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
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-light transition ${active
        ? "bg-primary text-primary-foreground"
        : "border border-border-soft text-text-subtle hover:border-primary hover:text-primary"
        }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function TabPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-light transition ${active
        ? "bg-primary text-primary-foreground"
        : "border border-border-soft bg-surface-card text-text-subtle hover:border-primary hover:text-primary"
        }`}
    >
      {children}
    </button>
  );
}
