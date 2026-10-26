import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { FreelanceView } from "@/types/application/freelance/freelance-view";
import { Send } from "lucide-react";

import { messagesApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/**
 * Candidatura a um freela: não existe formulário — abre (ou reaproveita) a conversa direta com quem
 * publicou e manda a mensagem de apresentação, que é onde escopo, prazo e valor são combinados.
 *
 * A mensagem vem preenchida para a pessoa não travar no "o que eu escrevo?", mas é editável.
 */
export function ApplyFreelanceDialog({
  freelance,
  open,
  onOpenChange,
}: {
  freelance: FreelanceView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState(() =>
    texts.jobs.freelancePage.applyMessage(freelance.title),
  );
  const [error, setError] = useState<string | null>(null);
  const [sentConversation, setSentConversation] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: async () => {
      const conversation = await messagesApi.openDirect(freelance.userId);
      await messagesApi.sendMessage(conversation.id, message.trim());
      return conversation;
    },
    onSuccess: (conversation) => {
      setError(null);
      setSentConversation(conversation.id);
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) =>
      setError(err instanceof Error ? err.message : texts.jobs.freelancePage.applyError),
  });

  const handleOpenChange = (next: boolean) => {
    // Reabrir o diálogo volta ao rascunho original: a mensagem enviada não fica no campo.
    if (!next) {
      setError(null);
      setSentConversation(null);
      setMessage(texts.jobs.freelancePage.applyMessage(freelance.title));
      send.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-normal">{texts.jobs.freelancePage.applyTitle}</DialogTitle>

          <DialogDescription>{texts.jobs.freelancePage.applyHint}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="rounded-lg bg-surface-1 p-3 text-sm">
            <span className="font-semibold text-text-strong">{freelance.title}</span>

            {freelance.username && (
              <span className="text-text-subtle"> · @{freelance.username}</span>
            )}
          </p>

          {sentConversation ? (
            <div className="space-y-3">
              <p role="status" className="text-sm text-growth">
                {texts.jobs.freelancePage.applySent}
              </p>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => handleOpenChange(false)}
                >
                  {texts.projects.editor.cancel}
                </Button>

                <Button
                  className="gap-2 rounded-full"
                  onClick={() => {
                    handleOpenChange(false);
                    void navigate({
                      to: "/mensagens",
                      search: { conversation: sentConversation },
                    });
                  }}
                >
                  {texts.jobs.freelancePage.applyOpenChat}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={texts.jobs.freelancePage.applyPlaceholder}
                aria-label={texts.jobs.freelancePage.applyPlaceholder}
                rows={5}
                maxLength={2000}
              />

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={send.isPending}
                  onClick={() => handleOpenChange(false)}
                >
                  {texts.projects.editor.cancel}
                </Button>

                <Button
                  className="gap-2 rounded-full"
                  disabled={send.isPending || message.trim().length === 0}
                  onClick={() => send.mutate()}
                >
                  <Send className="h-4 w-4" />

                  {send.isPending
                    ? texts.jobs.freelancePage.applySending
                    : texts.jobs.freelancePage.applySend}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
