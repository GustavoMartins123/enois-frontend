import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { ConversationItemProps } from "@/types/routes/messages/conversation-item-props";

import { profileApi } from "@/lib/api";
import { useCurrentUser } from "@/lib/current-user";

import { formatTime } from "@/components/post/format-time";
import { UserAvatar } from "@/components/user-avatar";
import { UserBadges } from "@/components/user-badge";

/** Uma linha da lista de conversas. Vive fora da rota para o dock poder reaproveitá-la. */
export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  selecting,
  selected,
  onToggle,
}: ConversationItemProps) {
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id ?? null;
  const otherId = conversation.participantIds.find((id) => id !== currentUserId);
  const { data: otherUser } = useQuery({
    queryKey: ["profile", "by-id", otherId],
    queryFn: () => profileApi.getById(otherId ?? ""),
    enabled: !!otherId,
  });

  const title = conversation.title ?? otherUser?.name ?? texts.messages.conversationFallback;

  return (
    <li>
      <button
        onClick={onSelect}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
          selected ? "bg-primary-soft" : isActive ? "bg-primary-soft" : "hover:bg-muted"
        }`}
      >
        {selecting && (
          <span
            aria-hidden
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
              selected ? "border-primary bg-primary text-primary-foreground" : "border-border-soft"
            }`}
          >
            {selected ? "✓" : ""}
          </span>
        )}
        <Link to="/perfil/$username" params={{ username: otherUser?.username ?? otherId ?? "" }}>
          <UserAvatar src={otherUser?.avatar} alt={title} className="h-11 w-11 shrink-0" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-sm font-medium">{title}</span>

              <UserBadges badges={otherUser?.badges} badge={otherUser?.badge} />
            </span>

            <span className="text-xs text-muted-foreground shrink-0 ml-2">
              {conversation.time ? formatTime(conversation.time) : ""}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs text-muted-foreground">
              {conversation.lastMessage ?? ""}
            </p>
            {conversation.unread > 0 && (
              <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {conversation.unread}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}
