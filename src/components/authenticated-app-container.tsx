import { type ReactNode, useState } from "react";

import { AuthenticatedAppHeader } from "./authenticated-app-header";
import { AppSidebar } from "./app-sidebar";
import { NavigationDrawer } from "./navigation-drawer";
import { AppLayout } from "./app-layout";

type AuthenticatedAppContainerProps = {
  children: ReactNode;
};

export function AuthenticatedAppContainer({ children }: AuthenticatedAppContainerProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AppLayout
      header={<AuthenticatedAppHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />}
      sidebar={<AppSidebar />}
      navigation={
        <NavigationDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      }
    >
      {children}
    </AppLayout>
  );
}
