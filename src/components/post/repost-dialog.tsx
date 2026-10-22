import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import { Repeat2 } from "lucide-react";

import { ApiError, reactionsApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

/** Limite combinado com o backend (`RepostPostService`). */
export const REPOST_OPINION_MAX = 600;

/**
 * Republicar em duas portas: direto (cópia com o crédito) ou COM opinião — o comentário vira o
 * texto da publicação e o post original aparece citado embaixo, como um quote-repost.
 */
export function RepostDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [opinion, setOpinion] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const repost = useMutation({
    mutationFn: (text?: string) => reactionsApi.repost(postId, text),
    onSuccess: () => {
      toast(texts.posts.reposted, "success");
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      setOpinion("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast(
        error instanceof ApiError && error.code === "ALREADY_REPOSTED"
          ? texts.posts.alreadyReposted
          : texts.posts.repostError,
        "error",
      );
    },
  });

  const cleanOpinion = opinion.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setOpinion("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-normal">
            <Repeat2 className="h-5 w-5 text-primary" />

            <>{texts.posts.repostTitle}</>
          </DialogTitle>

          <DialogDescription className="text-sm leading-relaxed text-text-subtle">
            {texts.posts.repostDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <label
            htmlFor={`repost-opinion-${postId}`}
            className="text-xs font-normal text-text-subtle"
          >
            {texts.posts.opinionLabel}
          </label>

          <Textarea
            id={`repost-opinion-${postId}`}
            value={opinion}
            onChange={(event) => setOpinion(event.target.value)}
            placeholder={texts.posts.opinionPlaceholder}
            rows={4}
            maxLength={REPOST_OPINION_MAX}
          />

          <p className="text-right text-xs text-text-subtle">
            {texts.posts.opinionCount(opinion.length)}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="rounded-full"
            disabled={repost.isPending}
            onClick={() => repost.mutate(undefined)}
          >
            {texts.posts.repostPlain}
          </Button>

          <Button
            className="rounded-full"
            disabled={repost.isPending || cleanOpinion.length === 0}
            onClick={() => repost.mutate(cleanOpinion)}
          >
            {texts.posts.repostWithOpinion}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
