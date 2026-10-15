import type { Notification } from "@/types/application/notification/notification";

export type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onAcceptConnection: (actorId: string) => void;
  /** Chamado ao navegar a partir da notificação (fecha o popover para mostrar o destino). */
  onNavigate?: () => void;
};
