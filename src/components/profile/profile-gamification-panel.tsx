import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { ProfileGamificationPanelProps } from "@/types/components/profile/profile-gamification-panel-props";
import { Award, ChevronRight, CircleDollarSign, Trophy } from "lucide-react";

import { walletApi } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";
import { formatFaisca } from "@/lib/faisca";

function PanelTitle({ icon: Icon, children }: { icon: typeof Award; children: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-medium text-text-strong">
      <span className="grid h-8 w-8 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_18%,transparent)]">
        <Icon className="h-4 w-4" />
      </span>

      {children}
    </h2>
  );
}

export function ProfileGamificationPanel({
  profile,
  isOwner,
  postsCount,
}: ProfileGamificationPanelProps) {
  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => walletApi.wallet(),
    enabled: isOwner,
    staleTime: 60_000,
  });
  const badges = profile.badges?.length ? profile.badges : profile.badge ? [profile.badge] : [];

  return (
    <div className="space-y-4">
      {isOwner && (
        <section className="overflow-hidden rounded-2xl border border-primary/20 bg-surface-card shadow-[0_18px_50px_-32px_color-mix(in_oklab,var(--primary)_85%,transparent)]">
          <div className="flex items-start justify-between gap-3 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                {texts.profile.dashboard.walletEyebrow}
              </p>

              <p className="mt-1 text-2xl font-medium tracking-tight text-text-strong">
                {wallet ? formatFaisca(wallet.balance) : texts.common.loading}
              </p>

              <p className="mt-1 text-xs text-text-subtle">
                {texts.profile.dashboard.walletCaption}
              </p>
            </div>

            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
              <CircleDollarSign className="h-5 w-5" />
            </span>
          </div>

          <Link
            to="/carteira"
            className="flex items-center justify-between border-t border-border-soft px-4 py-3 text-sm font-medium text-text-strong transition hover:bg-surface-2 hover:text-primary"
          >
            {texts.profile.dashboard.walletAction}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      <section className="rounded-2xl border border-border-soft bg-surface-card p-4 shadow-[0_18px_50px_-38px_color-mix(in_oklab,var(--primary)_70%,transparent)]">
        <PanelTitle icon={Trophy}>{texts.profile.dashboard.progressTitle}</PanelTitle>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border-soft bg-surface-1 p-3">
            <span className="text-xl font-medium text-text-strong">{profile.reputation ?? 0}</span>

            <p className="mt-1 text-xs text-text-subtle">
              {texts.profile.dashboard.reputationLabel}
            </p>
          </div>

          <div className="rounded-xl border border-border-soft bg-surface-1 p-3">
            <span className="text-xl font-medium text-text-strong">{postsCount}</span>

            <p className="mt-1 text-xs text-text-subtle">{texts.profile.dashboard.postsLabel}</p>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>

        <p className="mt-2 text-xs leading-relaxed text-text-subtle">
          {texts.profile.dashboard.progressCaption}
        </p>
      </section>

      <section className="rounded-2xl border border-border-soft bg-surface-card p-4">
        <PanelTitle icon={Award}>{texts.profile.dashboard.badgesTitle}</PanelTitle>

        {badges.length > 0 ? (
          <div className="mt-4 grid grid-cols-5 gap-2">
            {badges.map((badge) => (
              <img
                key={badge}
                src={resolveCdnUrl(badge)}
                alt={texts.profile.dashboard.badgeAlt}
                className="aspect-square w-full rounded-xl border border-border-soft object-cover shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/50"
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-text-subtle">
            {texts.profile.dashboard.badgesEmpty}
          </p>
        )}
      </section>
    </div>
  );
}
