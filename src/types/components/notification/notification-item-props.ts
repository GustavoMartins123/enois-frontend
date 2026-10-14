import type { Notification } from "@/types/application/notification/notification";

export type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onAcceptConnection: (actorId: string) => void;
};
