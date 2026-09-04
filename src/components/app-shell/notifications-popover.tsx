import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { Bell, CheckCheck } from "lucide-react";

import { networkApi, notificationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { notificationMeta } from "./notification-meta";
import { formatNotificationTime } from "./utils/notification-time";
import { navigateToHref } from "./utils/navigation";

export function NotificationsPopover() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [notifTab, setNotifTab] = useState<"novas" | "historico">("novas");

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(),
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notificationList = useMemo(() => notificationsData?.items ?? [], [notificationsData]);
  const unreadCount = useMemo(
    () => notificationList.filter((notification) => !notification.read).length,
    [notificationList],
  );
  const displayedNotifications = useMemo(
    () =>
      notificationList.filter((notification) =>
        notifTab === "novas" ? !notification.read : notification.read,
      ),
    [notificationList, notifTab],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative grid h-10 w-10 place-items-center rounded-full text-text-subtle transition hover:bg-surface-2 hover:text-primary"
          aria-label={unreadCount > 0 ? `${unreadCount} notificações não lidas` : "Notificações"}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-medium leading-none text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-2xl border-border-soft bg-surface-card p-0 shadow-card"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border-soft px-4 py-3">
          <span className="text-[14px] font-light text-text-strong">Notificações</span>
          {unreadCount > 0 && notifTab === "novas" && (
            <button
              type="button"
              onClick={() => markAllAsRead.mutate()}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-light text-text-subtle transition hover:text-primary"
            >
              <CheckCheck className="h-3 w-3" />
              Ler tudo
            </button>
          )}
        </div>

        <div className="flex border-b border-border-soft">
          <button
            type="button"
            onClick={() => setNotifTab("novas")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-light transition",
              notifTab === "novas"
                ? "border-b-2 border-primary text-primary"
                : "text-text-subtle hover:text-text-strong",
            )}
          >
            Novas
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setNotifTab("historico")}
            className={cn(
              "flex-1 py-2.5 text-[12px] font-light transition",
              notifTab === "historico"
                ? "border-b-2 border-primary text-primary"
                : "text-text-subtle hover:text-text-strong",
            )}
          >
            Histórico
          </button>
        </div>

        <div className="max-h-[28rem] overflow-y-auto">
          {displayedNotifications.length === 0 && (
            <p className="px-4 py-8 text-center text-[13px] font-light text-text-subtle">
              {notifTab === "novas" ? "Nenhuma notificação nova." : "Nenhum histórico ainda."}
            </p>
          )}
          {displayedNotifications.map((notification) => {
            const meta =
              notificationMeta[notification.kind.toLowerCase()] ?? notificationMeta.connection;
            const Icon = meta.icon;

            return (
              <div
                key={notification.id}
                className={cn(
                  "border-b border-border-soft px-4 py-3 last:border-b-0",
                  notification.read ? "bg-surface-card" : "bg-surface-3",
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!notification.read) markAsRead.mutate(notification.id);
                      navigateToHref(notification.href, navigate);
                    }}
                    className="shrink-0 rounded-full transition hover:opacity-80"
                  >
                    {notification.actorAvatar ? (
                      <img
                        src={notification.actorAvatar}
                        alt={notification.actorName ?? ""}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-full",
                          meta.className,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-light leading-tight text-text-strong">
                        {notification.actorName && <span>{notification.actorName} </span>}
                        <span className="text-text-subtle">{notification.title.toLowerCase()}</span>
                      </p>
                      {!notification.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-1 break-words text-[13px] font-light leading-snug text-text-subtle">
                      {notification.body}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-light text-text-subtle">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={() => markAsRead.mutate(notification.id)}
                            className="rounded-full px-2 py-1 text-[11px] font-light text-text-subtle transition hover:bg-surface-2 hover:text-text-strong"
                          >
                            Lida
                          </button>
                        )}
                        {notification.ctaLabel === "Aceitar" && !!notification.actorId ? (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!notification.read) markAsRead.mutate(notification.id);
                              try {
                                await networkApi.accept(notification.actorId!);
                                queryClient.invalidateQueries({ queryKey: ["network"] });
                              } catch {
                                /* ignore */
                              }
                            }}
                            className="rounded-full bg-primary px-3 py-1 text-[11px] font-light text-primary-foreground transition hover:bg-primary/90"
                          >
                            Aceitar
                          </button>
                        ) : notification.ctaLabel && notification.ctaLabel !== "Aceitar" ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (!notification.read) markAsRead.mutate(notification.id);
                              navigateToHref(notification.href, navigate);
                            }}
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
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
