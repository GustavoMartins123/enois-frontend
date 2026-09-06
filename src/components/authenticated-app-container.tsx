import type { ReactNode } from "react";

import { useCurrentUser } from "@/lib/current-user";

import { AuthenticatedAppHeader } from "./authenticated-app-header";
import { AppSidebar } from "./app-sidebar";
import { NavigationDrawer } from "./navigation-drawer";
import { AppLayout } from "./app-layout";

type AuthenticatedAppContainerProps = {
  children: ReactNode;
};

export function AuthenticatedAppContainer({ children }: AuthenticatedAppContainerProps) {
  useCurrentUser();

  return (
    <AppLayout>
      <AppLayout.Header>
        <AuthenticatedAppHeader />
      </AppLayout.Header>

      <AppLayout.Content>
        <AppLayout.Sidebar>
          <AppSidebar />
        </AppLayout.Sidebar>

        <AppLayout.Main>{children}</AppLayout.Main>
      </AppLayout.Content>

      <AppLayout.Navigation>
        <NavigationDrawer />
      </AppLayout.Navigation>
    </AppLayout>
  );
}
