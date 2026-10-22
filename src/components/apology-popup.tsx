import { useEffect, useState } from "react";

import { Link } from "@tanstack/react-router";

import { PLATFORM_SPACES } from "@/constants/platform-spaces";
import { texts } from "@/texts";
import { Heart, Sparkles } from "lucide-react";

import { hasSession } from "@/lib/require-auth";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const APOLOGY_KEY = "enois:apology-2026-10-21";

function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Desculpas pelos últimos dias, com adiamento opcional até o próximo dia local.
 *
 * O aviso das 100 faíscas acompanha o crédito real, feito pelo backend para cada conta; aqui é
 * só o convite para conhecer os espaços novos. Só aparece para quem tem sessão.
 */
export function ApologyPopup() {
  const [open, setOpen] = useState(false);
  const [dontRemindToday, setDontRemindToday] = useState(false);

  useEffect(() => {
    if (!hasSession()) return;
    try {
      if (localStorage.getItem(APOLOGY_KEY) === todayKey()) return;
    } catch {
      return;
    }
    const timer = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const close = (remember = dontRemindToday) => {
    if (remember) {
      try {
        localStorage.setItem(APOLOGY_KEY, todayKey());
      } catch {
        // modo privado: aparece de novo no próximo acesso, sem quebrar nada.
      }
    }
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close(false);
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-primary" />

            <>{texts.apology.title}</>
          </DialogTitle>

          <DialogDescription>{texts.apology.body}</DialogDescription>
        </DialogHeader>

        <p className="rounded-xl bg-primary-soft px-4 py-3 text-sm font-medium text-primary">
          {texts.apology.bonus}
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PLATFORM_SPACES.map((space) => (
            <Link
              key={space.to}
              to={space.to}
              onClick={() => close()}
              className="rounded-xl border border-border-soft px-3 py-2.5 transition hover:border-primary hover:text-primary"
            >
              <span className="block text-sm font-medium text-text-strong">{space.label}</span>

              <span className="block text-xs text-text-subtle">{space.description}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border-soft pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-text-strong">
            <input
              type="checkbox"
              checked={dontRemindToday}
              onChange={(event) => setDontRemindToday(event.target.checked)}
              className="h-4 w-4 rounded border-border-soft accent-primary"
            />

            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />

              <>{texts.apology.dontRemindToday}</>
            </span>
          </label>

          <Button className="w-auto rounded-full" onClick={() => close()}>
            {texts.apology.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
