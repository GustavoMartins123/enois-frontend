import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Briefcase,
  Link as LinkIcon,
  MessageCircle,
  UserPlus,
  Sparkles,
  Target,
  Clock,
  Camera,
  Settings,
  ThumbsUp,
  Star,
  Trophy,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  profileApi,
  feedApi,
  networkApi,
  ApiError,
  rankingApi,
  recommendationsApi,
} from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";
import { useAuth } from "@/lib/use-auth";
import { useMediaUpload } from "@/lib/use-media-upload";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { useState, useRef, useCallback } from "react";
import { ImageCropDialog } from "@/components/image-crop-dialog";

export const Route = createFileRoute("/perfil/$username")({
  loader: async ({ params }) => {
    try {
      const user = await profileApi.get(params.username);
      return { user };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.user.name ?? "Perfil"} · Conexão` },
      { name: "description", content: loaderData?.user.headline ?? "Perfil profissional" },
    ],
  }),
  notFoundComponent: () => (
    <AppShell>
      <div className="surface-card p-10 text-center">
        <p className="text-lg font-semibold">Pessoa não encontrada</p>
        <Link to="/" className="mt-2 inline-block text-sm text-primary hover:underline">
          Voltar para o início
        </Link>
      </div>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <div className="surface-card p-10 text-center">
        <p>Não foi possível carregar este perfil.</p>
      </div>
    </AppShell>
  ),
  component: Profile,
});

function Profile() {
  const { user: loaderUser } = Route.useLoaderData();
  const { user: me, requireAuth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const avatarUpload = useMediaUpload();
  const bannerUpload = useMediaUpload();
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [hoveringAvatar, setHoveringAvatar] = useState(false);
  const [hoveringBanner, setHoveringBanner] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropPurpose, setCropPurpose] = useState<"AVATAR" | "BANNER" | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [recommendComment, setRecommendComment] = useState("");

  const { data: liveProfile } = useQuery({
    queryKey: ["profile", loaderUser.username],
    queryFn: () => profileApi.get(loaderUser.username),
    initialData: loaderUser,
  });

  const user = liveProfile ?? loaderUser;
  const isOwnProfile = me?.id === user.id;

  const { data: connectionData } = useQuery({
    queryKey: ["connection-status", user.id],
    queryFn: () => networkApi.status(user.id),
    enabled: !isOwnProfile && !!me,
  });

  const connectionStatus = connectionData?.status ?? null;

  const updateProfile = useMutation({
    mutationFn: (data: { avatar?: string; banner?: string }) => profileApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["profile", user.username] });
    },
  });

  const { data: feedData } = useQuery({
    queryKey: ["feed", "user", user.id],
    queryFn: () => feedApi.listByUserId(user.id),
  });

  const userPosts = feedData?.items ?? [];

  const { data: rankingData } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => rankingApi.list(10),
  });

  const { data: recommendationsData } = useQuery({
    queryKey: ["recommendations", user.id],
    queryFn: () => recommendationsApi.listReceived(user.id),
  });

  const connect = useMutation({
    mutationFn: () => networkApi.connect(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-status", user.id] });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.code === "CONNECTION_ALREADY_REQUESTED") {
        queryClient.invalidateQueries({ queryKey: ["connection-status", user.id] });
      }
    },
  });

  const recommend = useMutation({
    mutationFn: () => recommendationsApi.create(user.id, { comment: recommendComment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations", user.id] });
      setRecommendOpen(false);
      setRecommendComment("");
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = URL.createObjectURL(file);
    setCropImageSrc(src);
    setCropPurpose("AVATAR");
    setCropFile(file);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = URL.createObjectURL(file);
    setCropImageSrc(src);
    setCropPurpose("BANNER");
    setCropFile(file);
  };

  const handleCropComplete = useCallback(
    async (blob: Blob) => {
      const upload = cropPurpose === "AVATAR" ? avatarUpload : bannerUpload;
      const result = await upload.upload(
        new File([blob], "crop.jpg", { type: "image/jpeg" }),
        cropPurpose!,
      );
      const field = cropPurpose === "AVATAR" ? "avatar" : "banner";
      await updateProfile.mutateAsync({ [field]: result.cdnUrl });
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
      setCropPurpose(null);
      setCropFile(null);
    },
    [cropPurpose, cropImageSrc, avatarUpload, bannerUpload, updateProfile],
  );

  const handleCropCancel = useCallback(() => {
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    setCropPurpose(null);
    setCropFile(null);
  }, [cropImageSrc]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="surface-card overflow-hidden">
          <div
            className="relative"
            onMouseEnter={() => setHoveringBanner(true)}
            onMouseLeave={() => setHoveringBanner(false)}
          >
            {user.banner ? (
              <img
                src={resolveCdnUrl(user.banner)}
                alt=""
                className="h-40 w-full object-cover sm:h-52"
              />
            ) : (
              <div className="h-40 w-full bg-gradient-to-r from-primary/20 to-primary/5 sm:h-52" />
            )}
            {isOwnProfile && hoveringBanner && (
              <button
                type="button"
                onClick={() => bannerRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/30 text-white transition"
                disabled={bannerUpload.status === "uploading"}
              >
                {bannerUpload.status === "uploading" ? (
                  "Enviando..."
                ) : (
                  <Camera className="h-6 w-6" />
                )}
              </button>
            )}
            <input
              ref={bannerRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
            />
          </div>
          <div className="px-6 pb-6">
            <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
              <div
                className="relative"
                onMouseEnter={() => setHoveringAvatar(true)}
                onMouseLeave={() => setHoveringAvatar(false)}
              >
                <UserAvatar
                  src={resolveCdnUrl(user.avatar)}
                  alt={user.name}
                  className="h-28 w-28 ring-4 ring-card"
                />
                {isOwnProfile && hoveringAvatar && (
                  <button
                    type="button"
                    onClick={() => avatarRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 text-white transition"
                    disabled={avatarUpload.status === "uploading"}
                  >
                    {avatarUpload.status === "uploading" ? "..." : <Camera className="h-5 w-5" />}
                  </button>
                )}
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {isOwnProfile ? (
                  <EditProfileDialog profile={user}>
                    <Button variant="outline" className="rounded-full gap-1.5">
                      <Settings className="h-4 w-4" /> Editar perfil
                    </Button>
                  </EditProfileDialog>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="rounded-full gap-1.5"
                      onClick={() => {
                        if (!requireAuth()) return;
                        navigate({ to: "/mensagens" });
                      }}
                    >
                      <MessageCircle className="h-4 w-4" /> Mensagem
                    </Button>
                    <Button
                      className="rounded-full gap-1.5"
                      onClick={() => {
                        if (!requireAuth()) return;
                        connect.mutate();
                      }}
                      disabled={
                        connect.isPending ||
                        connectionStatus === "ACCEPTED" ||
                        connectionStatus === "PENDING"
                      }
                    >
                      {connectionStatus === "PENDING"
                        ? "Aguardando resposta"
                        : connectionStatus === "ACCEPTED"
                          ? "Conectado"
                          : "Conectar"}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-2xl font-semibold tracking-tight">{user.name}</h1>
                {user.openToWork && (
                  <span className="rounded-full bg-growth/15 px-2.5 py-0.5 text-xs font-medium text-growth">
                    Aberto a oportunidades
                  </span>
                )}
                {user.isMentor && (
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                    Mentor disponível
                  </span>
                )}
              </div>
              <p className="mt-1 break-words text-foreground">{user.headline}</p>
              <p className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {user.company && (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" /> {user.company}
                  </span>
                )}
                {user.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {user.location}
                  </span>
                )}
                <span>· {user.connectionsCount} conexões</span>
                {user.reputation > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-opportunity/15 px-2 py-0.5 text-xs font-medium text-opportunity-foreground">
                    ★ {user.reputation} reputação
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            {user.bio && (
              <Section title="Sobre">
                <p className="break-words text-[15px] leading-relaxed text-foreground">{user.bio}</p>
              </Section>
            )}

            {user.skills.length > 0 && (
              <Section title="Habilidades">
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((s) => (
                    <Badge
                      key={s}
                      className="rounded-full bg-primary-soft text-primary hover:bg-primary-soft"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </Section>
            )}

            {user.goals.length > 0 && (
              <Section title="Objetivos profissionais" icon={Target}>
                <div className="grid gap-3 sm:grid-cols-3">
                  {user.goals.map((goal) => (
                    <div key={goal} className="rounded-xl border border-border bg-muted/40 p-4">
                      <p className="break-words text-sm font-medium">{goal}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Publicações recentes">
              {userPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ainda não há publicações.</p>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              )}
            </Section>
          </div>

          <aside className="space-y-6">
            <Section title="Disponibilidade" icon={Clock}>
              <p className="break-words text-sm leading-relaxed text-foreground">
                {user.availability ?? "Não informada"}
              </p>
            </Section>

            {!isOwnProfile && (
              <Section title="Recomendar" icon={ThumbsUp}>
                <p className="mb-3 text-sm text-muted-foreground">
                  Recomende este perfil para ajudar a comunidade.
                </p>
                <Dialog open={recommendOpen} onOpenChange={setRecommendOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full rounded-full gap-1.5">
                      <ThumbsUp className="h-4 w-4" /> Recomendar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Recomendar {user.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <Textarea
                        value={recommendComment}
                        onChange={(e) => setRecommendComment(e.target.value)}
                        placeholder="Descreva como conhece este profissional..."
                        rows={3}
                      />
                      <Button
                        className="w-full rounded-full"
                        disabled={!recommendComment.trim() || recommend.isPending}
                        onClick={() => recommend.mutate()}
                      >
                        {recommend.isPending ? "Enviando..." : "Enviar recomendação"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </Section>
            )}

            {recommendationsData && recommendationsData.length > 0 && (
              <Section title="Recomendações" icon={Star}>
                <div className="space-y-3">
                  {recommendationsData.map((rec) => (
                    <RecommendationItem key={rec.id} recommendation={rec} />
                  ))}
                </div>
              </Section>
            )}

            {rankingData && rankingData.length > 0 && (
              <Section title="Ranking" icon={Trophy}>
                <div className="space-y-2">
                  {rankingData.slice(0, 5).map((u, i) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <span
                        className={`w-5 text-center text-sm font-bold ${i < 3 ? "text-opportunity" : "text-muted-foreground"}`}
                      >
                        {i + 1}º
                      </span>
                      <Link to="/perfil/$username" params={{ username: u.username }}>
                        <UserAvatar src={u.avatar} alt={u.name} className="h-8 w-8 shrink-0" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/perfil/$username"
                          params={{ username: u.username }}
                          className="truncate text-sm font-medium hover:underline"
                        >
                          {u.name}
                        </Link>
                      </div>
                      <span className="text-xs font-semibold text-opportunity-foreground">
                        {u.reputation}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {user.externalLinks.length > 0 && (
              <Section title="Links">
                <ul className="space-y-2 text-sm">
                  {user.externalLinks.map((link) => (
                    <li key={link} className="flex items-center gap-2 text-muted-foreground">
                      <LinkIcon className="h-4 w-4" />
                      <span className="truncate text-foreground">{link}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </aside>
        </div>
      </div>
      <div className="h-16 lg:hidden" />

      {cropImageSrc && cropPurpose && (
        <ImageCropDialog
          open={!!cropImageSrc}
          onOpenChange={(v) => {
            if (!v) handleCropCancel();
          }}
          imageSrc={cropImageSrc}
          aspect={cropPurpose === "AVATAR" ? 1 : 3}
          title={cropPurpose === "AVATAR" ? "Ajustar foto de perfil" : "Ajustar foto de capa"}
          onCropComplete={handleCropComplete}
        />
      )}
    </AppShell>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {title}
      </h2>
      {children}
    </section>
  );
}

function RecommendationItem({
  recommendation,
}: {
  recommendation: { recommenderId: string; comment: string };
}) {
  const { data: recommender } = useQuery({
    queryKey: ["profile", "by-id", recommendation.recommenderId],
    queryFn: () => profileApi.getById(recommendation.recommenderId),
  });

  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar src={recommender?.avatar} alt={recommender?.name} className="h-6 w-6" />
        <span className="text-xs font-medium">{recommender?.name ?? "Usuário"}</span>
      </div>
      <p className="break-words text-sm leading-relaxed text-muted-foreground">"{recommendation.comment}"</p>
    </div>
  );
}
