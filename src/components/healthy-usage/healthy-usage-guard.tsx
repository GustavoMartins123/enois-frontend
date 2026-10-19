import { useEffect, useRef, useState } from "react";

import { texts } from "@/texts";
import { HeartPulse } from "lucide-react";

import { readHealthyUsage, subscribeHealthyUsage } from "@/lib/healthy-usage";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Conta o tempo da SESSÃO (recarregar zera) e mostra o lembrete quando o limite configurado
 * chega. Fica montado no root para continuar correndo em qualquer página do app.
 */
export function HealthyUsageGuard() {
  const [config, setConfig] = useState(readHealthyUsage);
  const [open, setOpen] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const update = () => setConfig(readHealthyUsage());
    return subscribeHealthyUsage(update);
  }, []);

  // Mudar o intervalo nas configurações reinicia a contagem — vale para a próxima pausa.
  useEffect(() => {
    startedAt.current = Date.now();
    if (!config.enabled) setOpen(false);
  }, [config.enabled, config.minutes]);

  useEffect(() => {
    if (!config.enabled) return;
    const limitMs = config.minutes * 60_000;
    const check = () => {
      if (Date.now() - startedAt.current >= limitMs) {
        startedAt.current = Date.now();
        setOpen(true);
      }
    };
    check();
    // O intervalo pode ser estrangulado em aba de fundo; a conta é pelo relógio, não pelos ticks.
    const timer = window.setInterval(check, 5000);
    return () => window.clearInterval(timer);
  }, [config.enabled, config.minutes]);

  const dismiss = () => {
    startedAt.current = Date.now();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : dismiss())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-normal">
            <HeartPulse className="h-5 w-5 text-primary" />

            <>{texts.account.healthyUsage.reminderTitle}</>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-3">
            <img
              src="/icons/brand-icon-192.png"
              alt={texts.brand.name}
              className="h-16 w-16 shrink-0 rounded-2xl"
            />

            {/* Balão do Nois, ao lado da logo. */}
            <div className="relative flex-1 rounded-2xl rounded-bl-sm border border-border-soft bg-primary-soft px-3 py-2 text-sm text-primary-text">
              {texts.account.healthyUsage.noise}
            </div>
          </div>

          <p className="text-sm text-text-strong">{texts.account.healthyUsage.reminderBody}</p>

          <div className="flex justify-end">
            <Button className="rounded-full" onClick={dismiss}>
              {texts.account.healthyUsage.reminderCta}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
