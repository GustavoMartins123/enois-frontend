import type { ComponentProps } from "react";

import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";

export function AppBrand({ onClick }: Pick<ComponentProps<"a">, "onClick">) {
  return (
    <Link to="/feed" onClick={onClick} className="flex shrink-0 items-center gap-2">
      <img src="/brand/mark-primary.svg" alt="" className="h-9 w-9 shrink-0" />

      <span className="text-lg font-semibold tracking-tight">
        <>{texts.brand.prefix}</>

        <span className="gradient-text">{texts.brand.accent}</span>
      </span>
    </Link>
  );
}
