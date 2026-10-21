import { useEffect, useRef, useState } from "react";

import { useLocation } from "@tanstack/react-router";

import { texts } from "@/texts";
import { Moon } from "lucide-react";

import { shouldShowNightRest } from "@/lib/night-rest";
import { usePersonalization } from "@/lib/use-personalization";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Popup de cuidado ao abrir o feed entre 00:00 e 04:59 no relógio do aparelho.
 *
 * - a preferência vem da conta (`nightRestReminder`), com default ligado no backend;
 * - ao voltar para o feed o componente monta de novo e a janela é reavaliada;
 * - um tick de 30s fecha o popup quando o relógio passa das 05:00 e o reabre se a página
 *   atravessar a meia-noite (só uma vez por noite, até fechar);
 * - falha ao carregar a preferência não bloqueia nem atrasa o feed: simplesmente não aparece.
 */
export function NightRestReminder() {
  const { data } = usePersonalization();
  const pathname = useLocation({ select: (state) => state.pathname });
  const enabled = data?.nightRestReminder;
  const [open, setOpen] = useState(false);
  const dismissed = useRef(false);

  // Cada retorno ao feed é uma visita nova: permite o popup de novo na mesma madrugada.
  useEffect(() => {
    if (pathname === "/feed") dismissed.current = false;
  }, [pathname]);

  useEffect(() => {
    const check = () => {
      if (pathname !== "/feed") {
        setOpen(false);
        return;
      }
      const now = new Date();
      const night = shouldShowNightRest(enabled, now);
      if (!night) {
        // Fora da janela (ou opção desligada) zera a dispensa: a próxima madrugada conta de novo.
        dismissed.current = false;
        setOpen(false);
        return;
      }
      if (!dismissed.current) setOpen(true);
    };

    check();
    const timer = window.setInterval(check, 30_000);
    return () => window.clearInterval(timer);
  }, [enabled, pathname]);

  const dismiss = () => {
    dismissed.current = true;
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : dismiss())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-normal">
            <Moon className="h-5 w-5 text-primary" />

            <>{texts.account.healthyUsage.nightRest.title}</>
          </DialogTitle>

          <DialogDescription className="text-sm leading-relaxed text-text-strong">
            {texts.account.healthyUsage.nightRest.body}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="outline" className="rounded-full" onClick={dismiss}>
            {texts.account.healthyUsage.nightRest.keep}
          </Button>

          <Button className="rounded-full" onClick={dismiss}>
            {texts.account.healthyUsage.nightRest.rest}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
