import { useEffect } from "react";

import { hydratePreferences, usePreferencesStore } from "@/stores/preferences.store";
import { texts } from "@/texts";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { NavigationLinks } from "./navigation-links";

export function AppSidebar() {
  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed);
  const toggleSidebar = usePreferencesStore((state) => state.toggleSidebar);

  useEffect(() => {
    hydratePreferences();
  }, []);

  return (
    <aside
      className={cn(
        // A altura para no que cabe abaixo do cabeçalho (top-20 = 5rem) e a barra rola por dentro.
        // Antes era `h-fit` + sticky: com mais itens do que cabia na tela, o fim da lista ficava
        // fora do alcance — sem rolagem nenhuma, porque um elemento do tamanho do conteúdo nunca
        // rola. `overscroll-contain` evita que a rolagem da barra puxe a página junto.
        "sticky top-20 hidden max-h-[calc(100vh-6rem)] shrink-0 overflow-y-auto overscroll-contain scrollbar-on-hover lg:block",
        sidebarCollapsed ? "w-16" : "w-60",
      )}
      style={{ transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      <div className="flex flex-col gap-1">
        <button
          onClick={toggleSidebar}
          className="mb-1 grid h-8 w-8 place-items-center self-end rounded-lg text-text-subtle transition hover:bg-surface-2 hover:text-primary"
          aria-label={
            sidebarCollapsed ? texts.navigation.expandMenu : texts.navigation.collapseMenu
          }
          title={sidebarCollapsed ? texts.navigation.expandMenu : texts.navigation.collapseMenu}
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>

        <NavigationLinks collapsed={sidebarCollapsed} />
      </div>
    </aside>
  );
}
