import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Lock } from "lucide-react";

import { MIN_REPUTATION_TO_CREATE_JOB } from "@/constants/job-rules";
import { texts } from "@/texts";
import type { CreateExternalJobInput } from "@/types/application/job/create-external-job-input";
import type { CreateExternalJobDialogProps } from "@/types/routes/jobs/create-external-job-dialog-props";

import { ApiError, jobsApi } from "@/lib/api";
import { useCurrentUser } from "@/lib/current-user";
import { canCreateJob, missingReputationToCreateJob } from "@/lib/job-permissions";

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

/**
 * Cadastro de vaga EXTERNA: a pessoa cola uma vaga achada em outro site e o Énóis só lista.
 * O "Candidatar-se" do card leva direto ao link da origem — nenhuma candidatura passa por aqui.
 *
 * Mesmo gate de reputação da vaga da casa e a mesma declaração da comunidade: cadastrar vaga é
 * um ato de confiança, de qualquer origem.
 */
export function CreateExternalJobDialog({ open, onOpenChange }: CreateExternalJobDialogProps) {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const reputation = user?.reputation ?? 0;
  const canPublish = canCreateJob(reputation);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [url, setUrl] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (data: CreateExternalJobInput) => jobsApi.submitExternal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      onOpenChange(false);
    },
    // A mensagem do backend manda (vaga duplicada, link inválido): é ela que explica o motivo.
    onError: (err) =>
      setError(
        err instanceof ApiError
          ? err.message
          : texts.jobs.external.registerError,
      ),
  });

  const reset = () => {
    setTitle("");
    setCompany("");
    setLocation("");
    setUrl("");
    setAgreed(false);
    setError(null);
  };

  const valid = title.trim() !== "" && company.trim() !== "" && url.trim() !== "" && agreed;

  const submit = () => {
    setError(null);
    create.mutate({
      title: title.trim(),
      company: company.trim(),
      location: location.trim() || undefined,
      url: url.trim(),
      communityAgreement: agreed,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-normal">{texts.jobs.external.registerTitle}</DialogTitle>

          <DialogDescription>{texts.jobs.external.registerDescription}</DialogDescription>
        </DialogHeader>

        {!canPublish ? (
          <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />

            <div>
              <p className="font-medium text-foreground">{texts.jobs.gate.title}</p>

              <p className="mt-1">
                {texts.jobs.gate.requirement(MIN_REPUTATION_TO_CREATE_JOB)}{" "}
                {texts.jobs.gate.current(reputation)}
              </p>

              <p className="mt-1">{texts.jobs.gate.missing(missingReputationToCreateJob(reputation))}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-text-subtle">
                {texts.jobs.fields.title}
              </Label>

              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={texts.jobs.fields.titlePlaceholder}
                className="bg-muted"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-normal text-text-subtle">
                  {texts.jobs.fields.company}
                </Label>

                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={texts.jobs.fields.companyPlaceholder}
                  className="bg-muted"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-normal text-text-subtle">
                  {texts.jobs.fields.location}
                </Label>

                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={texts.jobs.external.locationPlaceholder}
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-text-subtle">
                {texts.jobs.external.url}
              </Label>

              <Input
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="bg-muted"
              />

              <p className="inline-flex items-center gap-1.5 text-xs font-normal text-text-subtle">
                <ExternalLink className="h-3.5 w-3.5" />

                <>{texts.jobs.external.urlHint}</>
              </p>
            </div>

            <label className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs font-normal text-text-subtle">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
              />

              <span>{texts.jobs.communityAgreement}</span>
            </label>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button
              className="w-full rounded-full"
              disabled={!valid || create.isPending}
              onClick={submit}
            >
              {create.isPending ? texts.common.publishing : texts.jobs.external.registerAction}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
