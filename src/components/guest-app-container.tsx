import type { ReactNode } from "react";

import { GuestAppHeader } from "./guest-app-header";
import { AppLayout } from "./app-layout";

type GuestAppContainerProps = {
  children: ReactNode;
};

export function GuestAppContainer({ children }: GuestAppContainerProps) {
  return <AppLayout header={<GuestAppHeader />}>{children}</AppLayout>;
}
