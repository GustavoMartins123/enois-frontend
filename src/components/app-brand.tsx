import { Link } from "@tanstack/react-router";

import { Sparkles } from "lucide-react";

type AppBrandProps = {
  onClick?: () => void;
};

export function AppBrand({ onClick }: AppBrandProps) {
  return (
    <Link to="/feed" onClick={onClick} className="flex shrink-0 items-center gap-2">
      <div
        className="grid h-8 w-8 place-items-center rounded-xl text-primary-foreground sm:h-9 sm:w-9"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Sparkles className="h-4 w-4" />
      </div>
      <span className="text-lg font-semibold tracking-tight">
        É<span className="gradient-text">nóis</span>
      </span>
    </Link>
  );
}
