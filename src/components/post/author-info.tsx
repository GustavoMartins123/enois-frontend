import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { AuthorInfoProps } from "@/types/components/post/author-info-props";

import { UserAvatar } from "@/components/user-avatar";

import { formatTime } from "./format-time";

/** Avatar + nome + tempo relativo do autor de um post. */
export function AuthorInfo({
  authorUsername,
  authorName,
  authorAvatar,
  createdAt,
  fallbackClassName,
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

          <span className="text-[12px] font-light text-text-date">
            {texts.posts.authorTime(formatTime(createdAt))}
          </span>
        </div>
      </div>
    </div>
  );
}
