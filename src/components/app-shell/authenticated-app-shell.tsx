import { type ReactNode, useState } from "react";

import { AuthenticatedHeader } from "./authenticated-header";
import { AppSidebar } from "./app-sidebar";
import { MobileNavigation } from "./mobile-navigation";
import { ShellLayout } from "./shell-layout";

type AuthenticatedAppShellProps = {
  children: ReactNode;
};

export function AuthenticatedAppShell({ children }: AuthenticatedAppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ShellLayout
      header={<AuthenticatedHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />}
      sidebar={<AppSidebar />}
      navigation={
        <MobileNavigation open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      }
    >
      {children}
    </ShellLayout>
  );
}
