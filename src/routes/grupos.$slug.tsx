import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { GroupPost } from "@/types/application/group/group-post";
import type { GroupView } from "@/types/application/group/group-view";
import { Loader2, Plus, Users } from "lucide-react";

import { groupsApi } from "@/lib/api";
import { getSessionToken } from "@/lib/api-client";
import { resolveCdnUrl } from "@/lib/api/media";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

import { AppContainer } from "@/components/app-container";
import { SandboxedHtmlFrame } from "@/components/post/sandboxed-html-frame";
import { UserAvatar } from "@/components/user-avatar";
import { UserBadges } from "@/components/user-badge";

export const Route = createFileRoute("/grupos/$slug")({
  head: () => ({ meta: [{ title: texts.groups.seoTitle }] }),
  component: GrupoPage,
});

/**
 * A página do grupo.
 *
 * A apresentação é pública; o feed (tópicos, publicações) só aparece para quem participa — e quem
 * decide isso é o backend, que responde 403 para o resto.
 */
function GrupoPage() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authenticated = Boolean(getSessionToken());

  const {
    data: group,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["group", slug],
    queryFn: () => groupsApi.get(slug),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["group", slug] });
    void queryClient.invalidateQueries({ queryKey: ["groups"] });
  };

  const join = useMutation({
    mutationFn: () => groupsApi.join(group!.id),
    onSuccess: (result) => {
      toast(result.status === "MEMBER" ? texts.groups.joined : texts.groups.pending);
      invalidate();
    },
    onError: () => toast(texts.groups.joinError, "error"),
  });

  const leave = useMutation({
    mutationFn: () => groupsApi.leave(group!.id),
    onSuccess: invalidate,
    onError: () => toast(texts.groups.leaveError, "error"),
  });

  if (isLoading) {
    return (
      <AppContainer>
        <div className="flex justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </AppContainer>
    );
  }

  if (isError || !group) {
    return (
      <AppContainer>
        <p className="py-10 text-center text-sm text-text-subtle">{texts.groups.notFound}</p>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface-card">
          {group.bannerHtml ? (
            <SandboxedHtmlFrame
              html={group.bannerHtml}
              title={group.name}
              className="h-40 w-full rounded-none border-0 shadow-none"
              clip
            />
          ) : group.banner ? (
            <img src={resolveCdnUrl(group.banner)} alt="" className="h-40 w-full object-cover" />
          ) : (
            <div className="h-40 w-full" style={{ background: "var(--gradient-primary)" }} />
          )}

          <div className="space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-text-strong">
                {group.name}
              </h1>

              <span className="rounded-full border border-border-soft px-2 py-0.5 text-xs text-text-subtle">
                {group.joinMode === "OPEN"
                  ? texts.groups.joinModeOpen
                  : texts.groups.joinModeApproval}
              </span>
            </div>

            <p className="flex items-center gap-1.5 text-sm text-text-subtle">
              <Users className="h-4 w-4" />

              <>{texts.groups.members(group.members)}</>
            </p>

            {group.description && (
              <p className="whitespace-pre-line text-sm text-text-subtle">{group.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {group.joined ? (
                <>
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                    {texts.groups.joined}
                  </span>

                  <Button
                    variant="outline"
                    className="w-auto rounded-full"
                    disabled={leave.isPending}
                    onClick={() => leave.mutate()}
                  >
                    {texts.groups.leave}
                  </Button>
                </>
              ) : group.requestPending ? (
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                  {texts.groups.pending}
                </span>
              ) : authenticated ? (
                <Button
                  className="w-auto rounded-full"
                  disabled={join.isPending}
                  onClick={() => join.mutate()}
                >
                  {group.joinMode === "OPEN" ? texts.groups.join : texts.groups.requestJoin}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {group.joined ? (
          <GroupFeed group={group} />
        ) : (
          <p className="text-sm text-text-subtle">{texts.groups.membersOnly}</p>
        )}
      </div>
    </AppContainer>
  );
}

/** Feed privado: tópicos, publicações e o compositor. Tudo por endpoints do grupo. */
function GroupFeed({ group }: { group: GroupView }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [topicId, setTopicId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [topicName, setTopicName] = useState("");

  const { data: topicsData } = useQuery({
    queryKey: ["group-topics", group.id],
    queryFn: () => groupsApi.topics(group.id),
  });
  const topics = topicsData?.items ?? [];
  const canManage = group.viewerRole === "OWNER" || group.viewerRole === "ADMIN";
  const activeTopicId = topicId ?? topics.find((topic) => topic.status === "OPEN")?.id ?? null;
  const activeTopic = topics.find((topic) => topic.id === activeTopicId) ?? null;

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["group-posts", group.id, activeTopicId],
    queryFn: () => groupsApi.posts(group.id, activeTopicId ?? undefined),
    enabled: Boolean(activeTopicId),
  });
  const posts = postsData?.items ?? [];

  const invalidatePosts = () => {
    void queryClient.invalidateQueries({ queryKey: ["group-posts", group.id] });
    void queryClient.invalidateQueries({ queryKey: ["group", group.slug] });
  };

  const publish = useMutation({
    mutationFn: () =>
      groupsApi.publish(group.id, {
        topicId: activeTopicId ?? "",
        content: content.trim(),
      }),
    onSuccess: () => {
      setContent("");
      invalidatePosts();
    },
    onError: () => toast(texts.groups.publishError, "error"),
  });

  const createTopic = useMutation({
    mutationFn: () => groupsApi.createTopic(group.id, { name: topicName.trim() }),
    onSuccess: () => {
      setTopicName("");
      setNewTopicOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["group-topics", group.id] });
    },
    onError: () => toast(texts.groups.topicCreateError, "error"),
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-medium text-text-strong">{texts.groups.topics}</h2>

        {topics.length > 0 && (
          <button
            type="button"
            onClick={() => setTopicId(null)}
            className={
              topicId === null
                ? "rounded-full border border-primary bg-primary-soft px-3 py-1 text-xs font-medium text-primary"
                : "rounded-full border border-border-soft px-3 py-1 text-xs font-normal text-text-subtle transition hover:text-text-strong"
            }
          >
            {texts.groups.allTopics}
          </button>
        )}

        {topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => setTopicId(topic.id)}
            className={
              activeTopicId === topic.id
                ? "rounded-full border border-primary bg-primary-soft px-3 py-1 text-xs font-medium text-primary"
                : "rounded-full border border-border-soft px-3 py-1 text-xs font-normal text-text-subtle transition hover:text-text-strong"
            }
          >
            {topic.name}
            {topic.status === "ARCHIVED" ? " ·" : ""}
          </button>
        ))}

        {canManage && (
          <Button
            variant="outline"
            size="sm"
            className="w-auto rounded-full gap-1.5"
            onClick={() => setNewTopicOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />

            <>{texts.groups.newTopic}</>
          </Button>
        )}
      </div>

      {topics.length === 0 ? (
        <p className="text-sm text-text-subtle">
          {texts.groups.noTopics} {canManage ? texts.groups.noTopicsHint : ""}
        </p>
      ) : (
        <>
          {activeTopic && activeTopic.status === "OPEN" && (
            <div className="space-y-2 rounded-2xl border border-border-soft bg-surface-card p-4">
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={texts.groups.composerPlaceholder}
                maxLength={1200}
                className="min-h-20"
              />

              <div className="flex justify-end">
                <Button
                  className="w-auto rounded-full"
                  disabled={!content.trim() || publish.isPending}
                  onClick={() => publish.mutate()}
                >
                  {publish.isPending ? texts.groups.publishing : texts.groups.publish}
                </Button>
              </div>
            </div>
          )}

          {postsLoading ? (
            <div className="flex justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-text-subtle">{texts.groups.feedEmpty}</p>
          ) : (
            <ul className="space-y-3">
              {posts.map((post) => (
                <GroupPostItem key={post.id} post={post} />
              ))}
            </ul>
          )}
        </>
      )}

      <Dialog open={newTopicOpen} onOpenChange={setNewTopicOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-normal">{texts.groups.newTopic}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="topicName">{texts.groups.topicName}</Label>

              <Input
                id="topicName"
                value={topicName}
                onChange={(event) => setTopicName(event.target.value)}
                placeholder={texts.groups.topicNamePlaceholder}
                maxLength={80}
              />
            </div>

            <Button
              className="w-full rounded-full"
              disabled={!topicName.trim() || createTopic.isPending}
              onClick={() => createTopic.mutate()}
            >
              {texts.groups.createAction}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function GroupPostItem({ post }: { post: GroupPost }) {
  return (
    <li className="rounded-2xl border border-border-soft bg-surface-card p-4">
      <div className="flex items-center gap-2">
        <UserAvatar
          src={post.authorAvatar}
          alt={post.authorName ?? ""}
          className="h-8 w-8 shrink-0"
        />

        <span className="text-sm font-medium text-text-strong">{post.authorName ?? ""}</span>

        <UserBadges badges={post.authorBadges} />
      </div>

      <p className="mt-2 whitespace-pre-line text-sm text-text-strong">{post.content}</p>

      <p className="mt-2 text-xs text-text-date">
        {texts.groups.postMeta(post.reactions, post.comments)}
      </p>
    </li>
  );
}
