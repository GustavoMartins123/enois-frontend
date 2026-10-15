import { Link, useNavigate } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { NotificationItemProps } from "@/types/components/notification/notification-item-props";
import { navigateToHref } from "@/utils/navigation";
import { formatNotificationTime } from "@/utils/notification-time";

import { cn } from "@/lib/utils";

import { UserAvatar } from "@/components/user-avatar";

import { notificationMeta } from "./notification-meta";

export function NotificationItem({
  notification,
  onMarkAsRead,
  onAcceptConnection,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const kind = notification.kind.toLowerCase();
  const meta = notificationMeta[kind] ?? notificationMeta.connection;
  const Icon = meta.icon;
  const canAcceptConnection = kind === "connection_request" && Boolean(notification.actorId);

  const markAsRead = () => {
    if (!notification.read) onMarkAsRead(notification.id);
  };

  const handleNavigate = () => {
    markAsRead();
    navigateToHref(notification.href, navigate);
  };

  const handleAcceptConnection = () => {
    if (!notification.actorId) return;

    markAsRead();
    onAcceptConnection(notification.actorId);
  };

  // UserAvatar resolve o caminho do CDN: com <img> cru a foto do usuario nao carregava.
  const avatar = (
    <UserAvatar
      src={notification.actorAvatar}
      alt={notification.actorName ?? ""}
      className="h-9 w-9"
      fallbackClassName={cn("grid h-9 w-9 place-items-center rounded-full", meta.className)}
    />
  );

  const actorProfile = notification.actorUsername ? (
    <Link
      to="/perfil/$username"
      params={{ username: notification.actorUsername }}
      onClick={markAsRead}
      className="shrink-0 rounded-full transition hover:opacity-80"
      aria-label={texts.notifications.openActorProfile(notification.actorName ?? "")}
    >
      {avatar}
    </Link>
  ) : (
    <button
      type="button"
      onClick={handleNavigate}
      className="shrink-0 rounded-full transition hover:opacity-80"
    >
      {notification.actorAvatar ? (
        avatar
      ) : (
        <span className={cn("grid h-9 w-9 place-items-center rounded-full", meta.className)}>
          <Icon className="h-4 w-4" />
        </span>
      )}
    </button>
  );

  return (
    <div
      className={cn(
        "border-b border-border-soft px-4 py-3 last:border-b-0",
        notification.read ? "bg-surface-card" : "bg-surface-3",
      )}
    >
      <div className="flex items-start gap-3">
        {actorProfile}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-light leading-tight text-text-strong">
              {notification.actorName &&
                (notification.actorUsername ? (
                  <Link
                    to="/perfil/$username"
                    params={{ username: notification.actorUsername }}
                    onClick={markAsRead}
                    className="font-medium hover:underline"
                  >
                    {notification.actorName}{" "}
                  </Link>
                ) : (
                  <span className="font-medium">{notification.actorName} </span>
                ))}
              <span className="text-text-subtle">{notification.title.toLowerCase()}</span>
            </p>
            {!notification.read && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>

          <button
            type="button"
            onClick={handleNavigate}
            className="mt-1 block w-full break-words text-left text-[13px] font-light leading-snug text-text-subtle transition hover:text-text-strong"
          >
            {notification.body}
          </button>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[11px] font-light text-text-subtle">
              {formatNotificationTime(notification.createdAt)}
            </span>

            <div className="flex items-center gap-2">
              {!notification.read && (
                <button
                  type="button"
                  onClick={markAsRead}
                  className="rounded-full px-2 py-1 text-[11px] font-light text-text-subtle transition hover:bg-surface-2 hover:text-text-strong"
                >
                  {texts.notifications.markRead}
                </button>
              )}

              {canAcceptConnection ? (
                <button
                  type="button"
                  onClick={handleAcceptConnection}
                  className="rounded-full bg-primary px-3 py-1 text-[11px] font-light text-primary-foreground transition hover:bg-primary/90"
                >
                  {notification.ctaLabel || texts.notifications.accept}
                </button>
              ) : notification.ctaLabel ? (
                <button
                  type="button"
                  onClick={handleNavigate}
                  className="rounded-full bg-primary px-3 py-1 text-[11px] font-light text-primary-foreground transition hover:bg-primary/90"
                >
                  {notification.ctaLabel}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
