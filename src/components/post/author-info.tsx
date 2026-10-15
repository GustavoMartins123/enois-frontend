import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { AuthorInfoProps } from "@/types/components/post/author-info-props";

import { UserAvatar } from "@/components/user-avatar";

import { formatTime } from "./format-time";

/** Avatar + nome + tempo relativo do autor de um post, com a comunidade quando houver. */
export function AuthorInfo({
  authorUsername,
  authorName,
  authorAvatar,
  createdAt,
  community,
  fallbackClassName,
  onFollowCommunity,
  followPending,
}: AuthorInfoProps) {
  return (
    <div className="flex items-start gap-3">
      <Link to="/perfil/$username" params={{ username: authorUsername }}>
        <UserAvatar
          src={authorAvatar}
          alt={authorName}
          fallbackClassName={fallbackClassName}
          className="h-11 w-11"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <Link
            to="/perfil/$username"
            params={{ username: authorUsername }}
            className="font-bold hover:underline text-[14px]"
          >
            {authorName}
          </Link>

          {community ? (
            <span className="text-[12px] font-light text-text-subtle">
              {texts.posts.community.publishedIn}{" "}
              <Link
                to="/comunidades/$communityId"
                params={{ communityId: community.id }}
                className="font-medium text-primary hover:underline"
              >
                {community.name}
              </Link>
            </span>
          ) : null}

          {community && !community.joined && onFollowCommunity ? (
            <button
              type="button"
              onClick={onFollowCommunity}
              disabled={followPending}
              className="rounded-full border border-primary/40 px-2.5 py-0.5 text-[12px] font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-60"
            >
              {followPending ? texts.common.sending : texts.posts.community.follow}
            </button>
          ) : null}

          <span className="text-[12px] font-light text-text-date">
            {texts.posts.authorTime(formatTime(createdAt))}
          </span>
        </div>
      </div>
    </div>
  );
}
