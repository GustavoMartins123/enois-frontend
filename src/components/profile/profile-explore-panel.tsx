import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";
import { ChevronRight, Gamepad2, Palette, Sparkles } from "lucide-react";

/** O convite de exploração encerra o trilho, sem interromper a leitura dos cards sociais. */
export function ProfileExplorePanel() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border-soft bg-surface-card">
      <div className="p-4">
        <h2 className="flex items-center gap-2 text-sm font-medium text-text-strong">
          <span className="grid h-8 w-8 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_18%,transparent)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>

          <>{texts.profile.dashboard.exploreTitle}</>
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-text-subtle">
          {texts.profile.dashboard.exploreDescription}
        </p>
      </div>

      <div className="divide-y divide-border-soft border-t border-border-soft">
        <Link
          to="/jogos-diarios"
          className="flex items-center justify-between px-4 py-3 text-sm font-medium text-text-strong transition hover:bg-surface-2 hover:text-primary"
        >
          <span className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" aria-hidden="true" />

            <>{texts.profile.dashboard.dailyGames}</>
          </span>

          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>

        <Link
          to="/marketplace"
          className="flex items-center justify-between px-4 py-3 text-sm font-medium text-text-strong transition hover:bg-surface-2 hover:text-primary"
        >
          <span className="flex items-center gap-2">
            <Palette className="h-4 w-4" aria-hidden="true" />

            <>{texts.profile.dashboard.appearance}</>
          </span>

          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
