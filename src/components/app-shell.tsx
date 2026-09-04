import type { ReactNode } from "react";

import { isAuthenticated } from "@/lib/use-auth";

import { AuthenticatedAppShell } from "./app-shell/authenticated-app-shell";
import { GuestAppShell } from "./app-shell/guest-app-shell";

export function AppShell({ children }: { children: ReactNode }) {
  return isAuthenticated() ? (
    <AuthenticatedAppShell>{children}</AuthenticatedAppShell>
  ) : (
    <GuestAppShell>{children}</GuestAppShell>
  );
}
