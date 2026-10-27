import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { TOPICS, TOPIC_LABELS } from "@/constants/community-topics";
import { texts } from "@/texts";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  useToast,
} from "@rede-enois/design-system/ui";
import { Hash, Lock, Plus } from "lucide-react";

import { communitiesApi } from "@/lib/api";

/**
 * Canais privados por tema da comunidade.
 *
 * A lista só é pedida quando a pessoa participa (o backend responde 403 para quem não é membro) e
 * o conteúdo de cada canal vive numa rota própria, fora dos feeds.
 */
export function CommunityChannels({
  communityId,
  joined,
}: {
  communityId: string;
  joined: boolean;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const channels = useQuery({
    queryKey: ["community", communityId, "channels"],
    queryFn: () => communitiesApi.channels(communityId),
    enabled: joined,
    retry: false,
  });

  const create = useMutation({
    mutationFn: () =>
      communitiesApi.createChannel(communityId, {
        name: name.trim(),
        ...(topic ? { topic } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
      }),
    onSuccess: () => {
      setOpen(false);
      setName("");
      setTopic("");
      setDescription("");
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["community", communityId, "channels"] });
      toast(texts.communityChannels.created, "success");
    },
    onError: (err) => setError(err instanceof Error ? err.message : texts.communityChannels.error),
  });

  const items = channels.data ?? [];

  return (
    <section className="surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-medium text-text-strong">
            <Lock className="h-4 w-4 text-primary" />

            <>{texts.communityChannels.title}</>
          </h2>

          <p className="mt-1 text-sm text-text-subtle">
            {joined ? texts.communityChannels.subtitle : texts.communityChannels.locked}
          </p>
        </div>

        {joined && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-auto gap-1.5 rounded-full">
                <Plus className="h-4 w-4" />

                <>{texts.communityChannels.create}</>
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{texts.communityChannels.createTitle}</DialogTitle>
              </DialogHeader>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setError(null);
                  if (name.trim().length < 2) {
                    setError(texts.communityChannels.invalidName);
                    return;
                  }
                  create.mutate();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="channel-name">{texts.communityChannels.name}</Label>

                  <Input
                    id="channel-name"
                    value={name}
                    required
                    maxLength={80}
                    placeholder={texts.communityChannels.namePlaceholder}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel-topic">{texts.communityChannels.topic}</Label>

                  <select
                    id="channel-topic"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-primary"
                  >
                    <option value="">{texts.communityChannels.topicNone}</option>

                    {TOPICS.filter((option) => option !== "Todas").map((option) => (
                      <option key={option} value={option}>
                        {TOPIC_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel-description">{texts.communityChannels.description}</Label>

                  <Input
                    id="channel-description"
                    value={description}
                    maxLength={300}
                    placeholder={texts.communityChannels.descriptionPlaceholder}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    {texts.communityChannels.cancel}
                  </Button>

                  <Button type="submit" disabled={create.isPending}>
                    {create.isPending
                      ? texts.communityChannels.creating
                      : texts.communityChannels.confirm}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {joined && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((channel) => (
            <Link
              key={channel.id}
              to="/comunidades/$communityId/canais/$channelId"
              params={{ communityId, channelId: channel.id }}
              className="flex min-w-0 items-start gap-2 rounded-xl border border-border-soft px-3 py-2.5 transition hover:border-primary hover:text-primary"
            >
              <Hash className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-text-strong">
                  {channel.name}
                </span>

                <span className="block truncate text-xs text-text-subtle">
                  {channel.topic ? TOPIC_LABELS[channel.topic as keyof typeof TOPIC_LABELS] : null}
                  {channel.topic && channel.description ? " · " : null}
                  {channel.description}
                </span>
              </span>
            </Link>
          ))}

          {!channels.isLoading && items.length === 0 && (
            <p className="text-sm text-text-subtle">{texts.communityChannels.empty}</p>
          )}
        </div>
      )}
    </section>
  );
}
