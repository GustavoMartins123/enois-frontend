import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { topicLabel } from "@/constants/community-topics";
import { texts } from "@/texts";
import type { ProfileCommunityShelfProps } from "@/types/components/profile/profile-community-shelf-props";
import { ArrowUpRight, Hash, Users } from "lucide-react";

import { communitiesApi } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";

/**
 * O perfil só consulta as comunidades da própria pessoa: a API não expõe os círculos de terceiros,
 * então não inventamos uma associação para quem está visitando o perfil.
 */
export function ProfileCommunityShelf({ isOwner }: ProfileCommunityShelfProps) {
  const { data: communitiesData, isLoading } = useQuery({
    queryKey: ["communities", "mine", "profile-shelf"],
    queryFn: () => communitiesApi.mine(4),
    enabled: isOwner,
  });

  if (!isOwner) return null;

  const communities = communitiesData?.items ?? [];

  return (
    <section className="overflow-hidden rounded-2xl border border-border-soft bg-surface-card shadow-[0_18px_50px_-44px_color-mix(in_oklab,var(--primary)_85%,transparent)]">
      <div className="border-b border-border-soft bg-surface-1/50 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
              {texts.profile.dashboard.communityEyebrow}
            </p>

            <h2 className="mt-1 text-base font-medium text-text-strong">
              {texts.profile.dashboard.communityTitle}
            </h2>
          </div>

          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
            title={texts.profile.dashboard.communityTitle}
          >
            <Hash className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-text-subtle">
          {texts.profile.dashboard.communityDescription}
        </p>
      </div>

      {isLoading ? (
        <p className="px-4 py-4 text-sm text-text-subtle sm:px-5">{texts.common.loading}</p>
      ) : communities.length > 0 ? (
        <ul className="divide-y divide-border-soft">
          {communities.map((community) => (
            <li key={community.id}>
              <Link
                to="/comunidades/$communityId"
                params={{ communityId: community.id }}
                className="group flex items-center gap-3 px-4 py-3 transition hover:bg-primary/5 sm:px-5"
              >
                {community.avatar ? (
                  <img
                    src={resolveCdnUrl(community.avatar)}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-border-soft"
                  />
                ) : (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-primary">
                    <Hash className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 truncate text-sm font-medium text-text-strong">
                    <Hash className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />

                    <span className="truncate">{community.name}</span>
                  </span>

                  <span className="mt-0.5 flex items-center gap-2 text-xs text-text-subtle">
                    {community.topic && (
                      <span className="truncate">{topicLabel(community.topic)}</span>
                    )}

                    <span className="inline-flex shrink-0 items-center gap-1">
                      <Users className="h-3 w-3" aria-hidden="true" />

                      <>{texts.communities.members(community.members ?? 0)}</>
                    </span>
                  </span>
                </span>

                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-4 text-sm leading-relaxed text-text-subtle sm:px-5">
          {texts.profile.dashboard.communityEmpty}
        </p>
      )}

      <Link
        to="/comunidades"
        className="flex items-center justify-between border-t border-border-soft px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/5 sm:px-5"
      >
        <>{texts.profile.dashboard.communityAction}</>

        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
