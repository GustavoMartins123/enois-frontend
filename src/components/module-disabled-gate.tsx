import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";

import { texts } from "@/texts";
import { PauseCircle } from "lucide-react";

import { preferencesApi } from "@/lib/api";
import { moduleForPath } from "@/lib/module-paths";
import { useDisabledModules } from "@/lib/use-personalization";

import { Button } from "@/components/ui/button";

/**
 * Acesso direto a uma área desativada nas preferências: em vez de uma tela quebrada, a
 * explicação e o atalho para reativar. A preferência é de INTERFACE — o backend continua
 * aplicando as regras de acesso dele.
 */
export function ModuleDisabledGate({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const disabled = useDisabledModules();
  const queryClient = useQueryClient();
  const module = moduleForPath(pathname);

  if (!module || !disabled.has(module)) {
    return <>{children}</>;
  }

  const reenable = async () => {
    await preferencesApi.setPersonalization({
      disabledModules: [...disabled].filter((value) => value !== module),
    });
    void queryClient.invalidateQueries({ queryKey: ["personalization"] });
  };

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <PauseCircle className="h-10 w-10 text-text-subtle" />

        <h1 className="mt-4 text-lg font-semibold tracking-tight">
          {texts.personalization.moduleOffTitle}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">{texts.personalization.moduleOffBody}</p>

        <Button className="mt-6 w-full rounded-full" onClick={() => void reenable()}>
          {texts.personalization.reenable}
        </Button>

        <Link
          to="/feed"
          className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {texts.personalization.backToFeed}
        </Link>
      </div>
    </div>
  );
}
