import type { ReactNode } from "react";

import { GuestHeader } from "./guest-header";
import { ShellLayout } from "./shell-layout";

type GuestAppShellProps = {
  children: ReactNode;
};

export function GuestAppShell({ children }: GuestAppShellProps) {
  return <ShellLayout header={<GuestHeader />}>{children}</ShellLayout>;
}
