import { useState } from "react";

import { texts } from "@/texts";
import type { ApplicationFeedbackDialogProps } from "@/types/components/job/application-feedback-dialog-props";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Teto do retorno — o mesmo do backend (`feedback` varchar(1000)). */
const MAX_FEEDBACK = 1000;

/**
 * Retorno do empregador ao reprovar.
 *
 * Existe porque "não selecionado" seco não ajuda ninguém: quem se candidatou fica sem saber o que
 * faltou, e o processo vira uma porta que fecha em silêncio. O motivo é obrigatório — o backend
 * recusa sem ele — e vai para o candidato na mensagem, no e-mail e na lista de candidaturas dele.
 */
export function ApplicationFeedbackDialog({
  open,
  onOpenChange,
  onSubmit,
  pending,
}: ApplicationFeedbackDialogProps) {
  const [reason, setReason] = useState("");

  const canSend = reason.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setReason("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-normal">{texts.jobs.applications.feedbackTitle}</DialogTitle>
        </DialogHeader>

        <p className="text-xs font-normal text-text-subtle">
          {texts.jobs.applications.feedbackHint}
        </p>

        <div className="space-y-1.5">
          <Label className="text-xs font-normal text-text-subtle">
            {texts.jobs.applications.feedbackPlaceholder}
          </Label>

          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            maxLength={MAX_FEEDBACK}
            className="border-border-soft bg-surface-1 text-sm font-normal"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            {texts.common.cancel}
          </Button>

          <Button
            size="sm"
            className="rounded-full"
            disabled={!canSend || pending}
            onClick={() => {
              onSubmit(reason.trim());
              setReason("");
            }}
          >
            {texts.jobs.applications.feedbackSend}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
