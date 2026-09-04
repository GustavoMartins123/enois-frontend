import { type ReactNode, useState } from "react";

import { isAuthenticated } from "@/lib/use-auth";

import { AppHeader } from "./app-shell/app-header";
import { AppSidebar } from "./app-shell/app-sidebar";
import { MobileNavigation } from "./app-shell/mobile-navigation";

export function AppShell({ children }: { children: ReactNode }) {
  const authenticated = isAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        authenticated={authenticated}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <div className="mx-auto flex max-w-7xl gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:pb-6">
        {authenticated && <AppSidebar />}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {authenticated && (
        <MobileNavigation open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
}
