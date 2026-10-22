import { type FormEvent, useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { AgeGateMode } from "@/types/components/age-gate-mode";

import { BIRTH_DATE_REQUIRED_EVENT, PARENTAL_CONSENT_REQUIRED_EVENT } from "@/lib/age-required";
import { parentalApi, profileApi } from "@/lib/api";
import { hasSession } from "@/lib/require-auth";

import { Button } from "@/components/ui/button";
import { DateTextInput } from "@/components/ui/date-text-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

/**
 * Política de idade do ECA Digital, em um diálogo só.
 *
 * - Sem data de nascimento: pede a data (a conta é regularizada na hora).
 * - Menor sem responsável: pede o e-mail do responsável e envia o convite; a conta continua
 *   bloqueada para escrever até um adulto aceitar (o backend é quem decide).
 * - Qualquer 403 desses códigos abre o diálogo na tela onde a pessoa tentou agir.
 */
export function AgeGate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AgeGateMode>("date");
  const [birthDate, setBirthDate] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [inviteSentTo, setInviteSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const ageState = useQuery({
    queryKey: ["profile", "age-state"],
    queryFn: () => profileApi.ageState(),
    enabled: hydrated && hasSession(),
    retry: false,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const state = ageState.data?.state;
    if (state === "BIRTH_DATE_REQUIRED") {
      setMode("date");
      setOpen(true);
    } else if (state === "MINOR_CONSENT_PENDING") {
      setMode("parental");
      setOpen(true);
    } else if (state === "ADULT_DECLARED" || state === "MINOR_SUPERVISED") {
      setInviteSentTo(null);
      setOpen(false);
    }
  }, [ageState.data?.state]);

  useEffect(() => {
    const openDate = () => {
      setMode("date");
      setOpen(true);
    };
    const openParental = () => {
      setMode("parental");
      setOpen(true);
    };
    window.addEventListener(BIRTH_DATE_REQUIRED_EVENT, openDate);
    window.addEventListener(PARENTAL_CONSENT_REQUIRED_EVENT, openParental);
    return () => {
      window.removeEventListener(BIRTH_DATE_REQUIRED_EVENT, openDate);
      window.removeEventListener(PARENTAL_CONSENT_REQUIRED_EVENT, openParental);
    };
  }, []);

  const declare = useMutation({
    mutationFn: () => profileApi.declareBirthDate(birthDate),
    onSuccess: (state) => {
      queryClient.setQueryData(["profile", "age-state"], state);
      setBirthDate("");
      setError(null);
      toast(state.minor ? texts.ageGate.savedMinor : texts.ageGate.saved, "success");
    },
    onError: (err) => setError(err instanceof Error ? err.message : texts.ageGate.error),
  });

  const invite = useMutation({
    mutationFn: () => parentalApi.invite(guardianEmail.trim()),
    onSuccess: (view) => {
      setInviteSentTo(guardianEmail.trim());
      setError(null);
      toast(
        view.emailSent ? texts.parentalGate.sent : texts.parentalGate.emailFailed,
        view.emailSent ? "success" : "error",
      );
    },
    onError: (err) => setError(err instanceof Error ? err.message : texts.parentalGate.error),
  });

  const submitDate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    // O campo entrega ISO quando a data esta completa; no meio da digitacao vem o texto parcial,
    // entao a data pela metade e barrada por esta regex (e nao tratada como "vazia").
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      setError(texts.ageGate.invalid);
      return;
    }
    declare.mutate();
  };

  const submitInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!guardianEmail.includes("@")) {
      setError(texts.parentalGate.invalidEmail);
      return;
    }
    invite.mutate();
  };

  const today = new Date().toISOString().slice(0, 10);
  const oldest = `${new Date().getFullYear() - 120}-01-01`;

  const isParental = mode === "parental";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setOpen(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isParental ? texts.parentalGate.title : texts.ageGate.title}</DialogTitle>

          <DialogDescription>
            {isParental ? texts.parentalGate.description : texts.ageGate.description}
          </DialogDescription>
        </DialogHeader>

        {isParental ? (
          inviteSentTo ? (
            <div className="space-y-4">
              <p className="rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary">
                {texts.parentalGate.sentFor(inviteSentTo)}
              </p>

              <p className="text-sm text-text-subtle">{texts.parentalGate.waiting}</p>

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  {texts.parentalGate.later}
                </Button>

                <Button
                  type="button"
                  disabled={ageState.isFetching}
                  onClick={() => {
                    setError(null);
                    void ageState.refetch();
                  }}
                >
                  {ageState.isFetching
                    ? texts.parentalGate.checking
                    : texts.parentalGate.checkAgain}
                </Button>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submitInvite}>
              <p className="text-sm text-text-subtle">{texts.parentalGate.howItWorks}</p>

              <div className="space-y-2">
                <Label htmlFor="guardian-email">{texts.parentalGate.emailLabel}</Label>

                <Input
                  id="guardian-email"
                  type="email"
                  required
                  maxLength={255}
                  value={guardianEmail}
                  onChange={(event) => setGuardianEmail(event.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  {texts.parentalGate.later}
                </Button>

                <Button type="submit" disabled={invite.isPending}>
                  {invite.isPending ? texts.parentalGate.inviting : texts.parentalGate.invite}
                </Button>
              </div>
            </form>
          )
        ) : (
          <form className="space-y-4" onSubmit={submitDate}>
            <div className="space-y-2">
              <Label htmlFor="birth-date-gate-input">{texts.ageGate.label}</Label>

              <DateTextInput
                id="birth-date-gate-input"
                required
                autoComplete="bday"
                min={oldest}
                max={today}
                value={birthDate}
                onValueChange={setBirthDate}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                {texts.ageGate.later}
              </Button>

              <Button type="submit" disabled={declare.isPending}>
                {texts.ageGate.confirm}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
