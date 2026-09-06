import type { ReactNode } from "react";

import { GuestAppHeader } from "./guest-app-header";
import { AppLayout } from "./app-layout";

type GuestAppContainerProps = {
  children: ReactNode;
};

export function GuestAppContainer({ children }: GuestAppContainerProps) {
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
