import { type ChangeEvent, type FormEvent, useCallback, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { CommunityCropPurpose } from "@/types/routes/communities/community-crop-purpose";
import type { EditCommunityFormProps } from "@/types/routes/communities/edit-community-form-props";
import { ArrowLeft, Camera, Send, Settings, Users } from "lucide-react";

import { communitiesApi, feedApi } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";
import { requireAuth } from "@/lib/require-auth";
import { useAuth } from "@/lib/use-auth";
import { useMediaUpload } from "@/lib/use-media-upload";

import { Badge } from "@/components/ui/badge";
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
import { ImageCropDialog } from "@/components/image-crop-dialog";
import { PostCard } from "@/components/post-card";
import { UserAvatar } from "@/components/user-avatar";

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
    meta: [
      {
        title: `${loaderData?.name ?? texts.communities.detail.seoFallback} · ${texts.brand.name}`,
      },
    ],
  }),
  component: CommunityDetail,
});

function CommunityDetail() {
  const queryClient = useQueryClient();
  const community = Route.useLoaderData();
  const { user: currentUser } = useAuth();
  const [draft, setDraft] = useState("");
  const [editOpen, setEditOpen] = useState(false);

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
    mutationFn: (content: string) =>
      feedApi.create({ type: "INSIGHT", content, communityId: community.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", community.id, "feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
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
  const isAdmin = currentUser ? admins.some((a) => a.userId === currentUser.id) : false;

  return (
    <AppContainer>
      <div className="space-y-6">
        <Link
          to="/comunidades"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          <>{texts.communities.title}</>
        </Link>

        <div className="surface-card overflow-hidden">
          {live.cover ? (
            <img src={resolveCdnUrl(live.cover)} alt="" className="h-48 w-full object-cover" />
          ) : (
            <div className="h-48 w-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                {live.avatar && (
                  <img
                    src={resolveCdnUrl(live.avatar)}
                    alt=""
                    className="h-16 w-16 rounded-full object-cover ring-4 ring-card shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <Badge className="rounded-full bg-primary-soft text-primary hover:bg-primary-soft">
                    {live.topic}
                  </Badge>

                  <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight">
                    {live.name}
                  </h1>

                  <p className="mt-1 break-words text-muted-foreground">{live.description}</p>

                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4" />

                      <>{texts.communities.memberCount(live.members)}</>
                    </span>
                    {admins.length > 0 && (
                      <span>
                        <>{texts.communities.detail.createdBy}</>

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
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-full gap-1.5">
                        <Settings className="h-4 w-4" />

                        <>{texts.communities.detail.edit}</>
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{texts.communities.detail.editTitle}</DialogTitle>
                      </DialogHeader>

                      <EditCommunityForm community={live} onClose={() => setEditOpen(false)} />
                    </DialogContent>
                  </Dialog>
                )}
                <Button
                  className="rounded-full shrink-0"
                  variant={isMember ? "secondary" : "default"}
                  disabled={join.isPending || leave.isPending}
                  onClick={() => (isMember ? leave.mutate() : join.mutate())}
                >
                  {isMember ? texts.communities.participating : texts.communities.enter}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isMember && (
          <form onSubmit={handlePost} className="surface-card p-5">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={texts.communities.detail.composerPlaceholder}
              className="min-h-20 resize-none rounded-2xl border-border bg-muted/40 text-sm"
              maxLength={1024}
            />

            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                className="rounded-full gap-1.5"
                disabled={!draft.trim() || createPost.isPending}
              >
                <Send className="h-4 w-4" />

                <>{createPost.isPending ? texts.common.publishing : texts.common.publish}</>
              </Button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{texts.communities.detail.feed}</h2>
            {posts.length === 0 ? (
              <p className="surface-card p-8 text-center text-sm text-muted-foreground">
                {isMember
                  ? texts.communities.detail.emptyMember
                  : texts.communities.detail.emptyGuest}
              </p>
            ) : (
              posts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>

          <aside className="space-y-4">
            <div className="surface-card p-5">
              <h3 className="mb-3 text-sm font-semibold">
                {texts.communities.detail.membersTitle(members.length)}
              </h3>

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
                        <Badge
                          variant="outline"
                          className="ml-2 rounded-full text-[10px] px-1.5 py-0"
                        >
                          {texts.communities.detail.admin}
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
    </AppContainer>
  );
}

function EditCommunityForm({ community, onClose }: EditCommunityFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description);
  const [cover, setCover] = useState(community.cover ?? "");
  const [avatar, setAvatar] = useState(community.avatar ?? "");
  const coverUpload = useMediaUpload();
  const avatarUpload = useMediaUpload();
  const coverRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropPurpose, setCropPurpose] = useState<CommunityCropPurpose | null>(null);

  const handleCropComplete = useCallback(
    async (blob: Blob) => {
      const upload = cropPurpose === "COVER" ? coverUpload : avatarUpload;
      const result = await upload.upload(
        new File([blob], "crop.jpg", { type: "image/jpeg" }),
        cropPurpose!,
      );
      if (cropPurpose === "COVER") setCover(result.cdnUrl);
      else setAvatar(result.cdnUrl);
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
      setCropPurpose(null);
    },
    [cropPurpose, cropImageSrc, coverUpload, avatarUpload],
  );

  const handleCropCancel = useCallback(() => {
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
    setCropPurpose(null);
  }, [cropImageSrc]);

  const handleFileSelect = (field: CommunityCropPurpose) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropPurpose(field);
    setCropImageSrc(URL.createObjectURL(file));
  };

  const update = useMutation({
    mutationFn: () =>
      communitiesApi.update(community.id, {
        name: name !== community.name ? name : undefined,
        description: description !== community.description ? description : undefined,
        cover: cover || null,
        avatar: avatar || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", community.id] });
      onClose();
    },
  });

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{texts.communities.create.name}</Label>

        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          {texts.communities.create.description}
        </Label>

        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{texts.communities.detail.cover}</Label>
        {cover ? (
          <div className="relative overflow-hidden rounded-xl border border-border">
            <img src={cover} alt="" className="h-24 w-full object-cover" />

            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full gap-1.5"
                onClick={() => coverRef.current?.click()}
              >
                <Camera className="h-4 w-4" />

                <>{texts.communities.detail.change}</>
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="rounded-full"
                onClick={() => setCover("")}
              >
                {texts.communities.detail.remove}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full gap-1.5"
            onClick={() => coverRef.current?.click()}
          >
            <Camera className="h-4 w-4" />

            <>{texts.communities.detail.addCover}</>
          </Button>
        )}
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect("COVER")}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{texts.communities.detail.avatar}</Label>
        {avatar ? (
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5"
                onClick={() => avatarRef.current?.click()}
              >
                <Camera className="h-4 w-4" />

                <>{texts.communities.detail.change}</>
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="rounded-full"
                onClick={() => setAvatar("")}
              >
                {texts.communities.detail.remove}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full gap-1.5"
            onClick={() => avatarRef.current?.click()}
          >
            <Camera className="h-4 w-4" />

            <>{texts.communities.detail.addAvatar}</>
          </Button>
        )}
        <input
          ref={avatarRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect("AVATAR")}
        />
      </div>

      <Button
        className="w-full rounded-full"
        disabled={!name.trim() || update.isPending}
        onClick={() => update.mutate()}
      >
        {update.isPending ? texts.common.saving : texts.common.save}
      </Button>

      {cropImageSrc && cropPurpose && (
        <ImageCropDialog
          open={!!cropImageSrc}
          onOpenChange={(v) => {
            if (!v) handleCropCancel();
          }}
          imageSrc={cropImageSrc}
          aspect={cropPurpose === "COVER" ? 3 : 1}
          title={
            cropPurpose === "COVER"
              ? texts.communities.detail.cropCover
              : texts.communities.detail.cropAvatar
          }
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
