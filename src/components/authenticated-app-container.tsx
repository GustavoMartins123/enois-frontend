import { useCurrentUser } from "@/lib/current-user";
import type { WithRequiredChildren } from "@/types/components/with-required-children";

import { AuthenticatedAppHeader } from "./authenticated-app-header";
import { AppSidebar } from "./app-sidebar";
import { NavigationDrawer } from "./navigation-drawer";
import { AppLayout } from "./app-layout";

export function AuthenticatedAppContainer({ children }: WithRequiredChildren) {
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
