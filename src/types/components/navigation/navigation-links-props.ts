import type { ComponentPropsWithoutRef } from "react";

export type NavigationLinksProps = Pick<ComponentPropsWithoutRef<"nav">, "className"> & {
  collapsed?: boolean;
  onNavigate?: () => void;
};
