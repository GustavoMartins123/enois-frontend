import { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { GameView } from "@/types/application/games/game-view";

import { gamesApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

/**
 * "Novidades/atualizações": o criador conta o que mudou nesta versão e quem acompanha o criador
 * recebe o aviso. O backend já fazia isso; faltava a tela.
 */
export function GameUpdateDialog({
  game,
  open,
  onOpenChange,
}: {
  game: GameView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [version, setVersion] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setBody("");
    setVersion(game.version ?? "");
  }, [open, game.version]);

  const publish = useMutation({
    mutationFn: () =>
      gamesApi.publishUpdate(game.id, {
        title: title.trim(),
        body: body.trim() || undefined,
        version: version.trim() || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["games", "updates", game.id] });
      void queryClient.invalidateQueries({ queryKey: ["games", "slug"] });
      toast(texts.games.panel.updatePublished, "success");
      onOpenChange(false);
    },
    onError: (error) =>
      toast(error instanceof Error ? error.message : texts.games.panel.updateError, "error"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-normal">{texts.games.panel.newUpdate}</DialogTitle>

          <DialogDescription>{texts.games.panel.newUpdateHint}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-text-subtle">
              {texts.games.panel.updateTitle}
            </Label>

            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={texts.games.panel.updateTitlePlaceholder}
              maxLength={200}
              className="bg-muted"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-text-subtle">
              {texts.games.panel.updateBody}
            </Label>

            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={texts.games.panel.updateBodyPlaceholder}
              rows={4}
              maxLength={4000}
              className="bg-muted"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-normal text-text-subtle">
              {texts.games.panel.updateVersion}
            </Label>

            <Input
              value={version}
              onChange={(event) => setVersion(event.target.value)}
              placeholder="1.2"
              maxLength={40}
              className="bg-muted"
            />
          </div>

          <Button
            className="w-full rounded-full"
            disabled={title.trim() === "" || publish.isPending}
            onClick={() => publish.mutate()}
          >
            {publish.isPending ? texts.common.publishing : texts.games.panel.publishUpdate}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
