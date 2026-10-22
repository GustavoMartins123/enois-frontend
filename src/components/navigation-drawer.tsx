import { useAppShellStore } from "@/stores/app-shell.store";
import { texts } from "@/texts";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

import { AppBrand } from "./app-brand";
import { NavigationLinks } from "./navigation-links";

export function NavigationDrawer() {
  const mobileNavigationOpen = useAppShellStore((state) => state.mobileNavigationOpen);
  const closeMobileNavigation = useAppShellStore((state) => state.closeMobileNavigation);

  return (
    <Sheet
      open={mobileNavigationOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeMobileNavigation();
      }}
    >
      <SheetContent
        side="left"
        overlayClassName="bg-black/50 backdrop-blur-sm md:hidden"
        className="flex w-72 flex-col border-border-soft bg-surface-card p-0 shadow-card md:hidden [&>button]:right-3 [&>button]:top-2.5 [&>button]:grid [&>button]:h-9 [&>button]:w-9 [&>button]:place-items-center [&>button]:rounded-full [&>button]:text-text-subtle [&>button]:opacity-100 [&>button]:transition [&>button:hover]:bg-surface-2 [&>button:hover]:text-primary sm:[&>button]:top-3.5"
      >
        <SheetTitle className="sr-only">{texts.navigation.drawerTitle}</SheetTitle>

        <div className="flex h-14 items-center border-b border-border-soft px-3 sm:h-16">
          <AppBrand onClick={closeMobileNavigation} />
        </div>

        {/* `min-h-0` + `flex-1` é o que faz a lista rolar dentro do painel: sem isso ela cresce
            além da altura e o fim fica fora da tela. */}
        <NavigationLinks
          onNavigate={closeMobileNavigation}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
        />
      </SheetContent>
    </Sheet>
  );
}
