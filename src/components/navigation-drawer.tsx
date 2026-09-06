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
        className="w-72 border-border-soft bg-surface-card p-0 shadow-card md:hidden [&>button]:right-3 [&>button]:top-2.5 [&>button]:grid [&>button]:h-9 [&>button]:w-9 [&>button]:place-items-center [&>button]:rounded-full [&>button]:text-text-subtle [&>button]:opacity-100 [&>button]:transition [&>button:hover]:bg-surface-2 [&>button:hover]:text-primary sm:[&>button]:top-3.5"
      >
        <SheetTitle className="sr-only">{texts.navigation.drawerTitle}</SheetTitle>

        <div className="flex h-14 items-center border-b border-border-soft px-3 sm:h-16">
          <AppBrand onClick={closeMobileNavigation} />
        </div>

        <NavigationLinks onNavigate={closeMobileNavigation} className="overflow-y-auto p-3" />
      </SheetContent>
    </Sheet>
  );
}
