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
    <AppLayout>
      <AppLayout.Header>
        <AuthenticatedAppHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      </AppLayout.Header>

      <AppLayout.Content>
        <AppLayout.Sidebar>
          <AppSidebar />
        </AppLayout.Sidebar>

        <AppLayout.Main>{children}</AppLayout.Main>
      </AppLayout.Content>

      <AppLayout.Navigation>
        <NavigationDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </AppLayout.Navigation>
    </AppLayout>
  );
}
