import type { WithRequiredChildren } from "@/types/components/with-required-children";

import { GuestAppHeader } from "./guest-app-header";
import { AppLayout } from "./app-layout";

export function GuestAppContainer({ children }: WithRequiredChildren) {
  return (
    <AppLayout>
      <AppLayout.Header>
        <GuestAppHeader />
      </AppLayout.Header>

      <AppLayout.Content>
        <AppLayout.Main>{children}</AppLayout.Main>
      </AppLayout.Content>
    </AppLayout>
  );
}
