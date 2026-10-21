import { Link } from "@tanstack/react-router";

import { PLATFORM_SPACES } from "@/constants/platform-spaces";
import { texts } from "@/texts";
import { ArrowUpRight } from "lucide-react";

/** Atalhos dos espaços novos no painel lateral (feed). */
export function PlatformSpacesCard() {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface-card p-4">
      <h2 className="text-sm font-medium text-text-strong">{texts.platformSpaces.title}</h2>

      <p className="mt-0.5 text-xs text-text-subtle">{texts.platformSpaces.subtitle}</p>

      <ul className="mt-3 space-y-1">
        {PLATFORM_SPACES.filter((space) => !("inSidebar" in space) || space.inSidebar !== false).map((space) => (
          <li key={space.to}>
            <Link
              to={space.to}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm font-normal text-text-strong transition hover:bg-muted hover:text-primary"
            >
              <span className="truncate">{space.label}</span>

              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-text-subtle" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
