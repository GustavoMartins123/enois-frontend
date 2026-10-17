import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { CommunityCardProps } from "@/types/components/community-card-props";
import { Users } from "lucide-react";

import { resolveCdnUrl } from "@/lib/api/media";

import { Button } from "@/components/ui/button";

import { CommunityFavoriteButton } from "@/components/community-favorite-button";

/** Card de comunidade na aba de comunidades: capa, estrela de favorito e entrar/sair. */
export function CommunityCard({
  community,
  joinPending,
  leavePending,
  ownerBlocked,
  onJoin,
  onLeave,
}: CommunityCardProps) {
  const c = community;

  return (
    <Link to="/comunidades/$communityId" params={{ communityId: c.id }} className="min-w-0">
      <article className="surface-card relative overflow-hidden cursor-pointer transition hover:shadow-[var(--shadow-card)]">
        {c.cover ? (
          <img src={resolveCdnUrl(c.cover)} alt="" className="h-32 w-full object-cover" />
        ) : (
          <div className="h-32 w-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}

        <div className="absolute right-3 top-3">
          <CommunityFavoriteButton communityId={c.id} />
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center gap-3">
            {c.avatar && (
              <img
                src={resolveCdnUrl(c.avatar)}
                alt=""
                className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
              />
            )}

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">{c.topic}</p>

              <h3 className="truncate font-semibold">{c.name}</h3>
            </div>
          </div>

          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0" />

              <span className="truncate">{texts.communities.members(c.members ?? 0)}</span>
            </span>

            <Button
              size="sm"
              variant={c.joined ? "secondary" : "default"}
              className="shrink-0 whitespace-nowrap rounded-full"
              disabled={joinPending || leavePending}
              onClick={(e) => {
                e.preventDefault();
                if (c.joined) {
                  onLeave(c);
                } else {
                  onJoin(c.id);
                }
              }}
            >
              {c.joined ? texts.communities.participating : texts.communities.enter}
            </Button>
          </div>

          {ownerBlocked && (
            <p className="mt-2 text-xs text-destructive">{texts.communities.ownerLeaveBlocked}</p>
          )}
        </div>
      </article>
    </Link>
  );
}
