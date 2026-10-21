import { type FormEvent, useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";

import { profileApi } from "@/lib/api";
import { BIRTH_DATE_REQUIRED_EVENT } from "@/lib/birth-date-required";
import { hasSession } from "@/lib/require-auth";

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
import { useToast } from "@/components/ui/toast";

/**
 * Regularização da data de nascimento (ECA Digital).
 *
 * O backend exige a data declarada para escrever (publicar, comentar, mandar mensagem). O diálogo
 * abre sozinho quando o estado da conta é BIRTH_DATE_REQUIRED e também quando qualquer chamada
 * recebe esse 403 — assim quem tenta postar cai aqui direto, em qualquer tela.
 */
export function BirthDateGate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [birthDate, setBirthDate] = useState("");
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
    if (ageState.data?.state === "BIRTH_DATE_REQUIRED") setOpen(true);
  }, [ageState.data?.state]);

  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener(BIRTH_DATE_REQUIRED_EVENT, reopen);
    return () => window.removeEventListener(BIRTH_DATE_REQUIRED_EVENT, reopen);
  }, []);

  const declare = useMutation({
    mutationFn: () => profileApi.declareBirthDate(birthDate),
    onSuccess: (state) => {
      queryClient.setQueryData(["profile", "age-state"], state);
      setOpen(false);
      setBirthDate("");
      setError(null);
      toast(state.minor ? texts.birthDateGate.savedMinor : texts.birthDateGate.saved, "success");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : texts.birthDateGate.error);
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!birthDate) {
      setError(texts.birthDateGate.invalid);
      return;
    }
    declare.mutate();
  };

  const today = new Date().toISOString().slice(0, 10);
  const oldest = `${new Date().getFullYear() - 120}-01-01`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setOpen(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{texts.birthDateGate.title}</DialogTitle>

          <DialogDescription>{texts.birthDateGate.description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="birth-date-gate-input">{texts.birthDateGate.label}</Label>

            <Input
              id="birth-date-gate-input"
              type="date"
              required
              min={oldest}
              max={today}
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {texts.birthDateGate.later}
            </Button>

            <Button type="submit" disabled={declare.isPending}>
              {texts.birthDateGate.confirm}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
