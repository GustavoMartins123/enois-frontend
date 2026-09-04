import { Menu } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

import { AppBrand } from "./app-brand";
import { HeaderAccountActions } from "./header-account-actions";
import { SearchBox } from "./search-box";

type AppHeaderProps = {
  authenticated: boolean;
  onOpenMobileMenu: () => void;
};

export function AppHeader({ authenticated, onOpenMobileMenu }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-surface-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        {authenticated && (
          <button
            onClick={onOpenMobileMenu}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-text-subtle transition hover:bg-surface-2 hover:text-primary md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <AppBrand />

        {authenticated && <SearchBox />}

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <HeaderAccountActions authenticated={authenticated} />
        </div>
      </div>
    </header>
  );
}
