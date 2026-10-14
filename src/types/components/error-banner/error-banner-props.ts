import type { ComponentPropsWithoutRef } from "react";

export type ErrorBannerProps = Pick<ComponentPropsWithoutRef<"div">, "className"> & {
  error: unknown;
};
