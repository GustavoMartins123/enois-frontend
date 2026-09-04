import type { ReactNode } from "react";

import { isAuthenticated } from "@/lib/use-auth";

import { AuthenticatedAppShell } from "./authenticated-app-shell";
import { GuestAppShell } from "./guest-app-shell";

export function AppShell({ children }: { children: ReactNode }) {
  return isAuthenticated() ? (
    <AuthenticatedAppShell>{children}</AuthenticatedAppShell>
  ) : (
    <GuestAppShell>{children}</GuestAppShell>
  );
}
