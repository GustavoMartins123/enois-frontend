import type { Notification } from "@/types/application/notification/notification";

export type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onAcceptConnection: (actorId: string) => void;
  /**
   * Quem AINDA tem pedido de conexão pendente. O "Aceitar" fica desabilitado quando o pedido já
   * foi aceito — inclusive no Histórico, onde a notificação continua listada.
   */
  stillPendingActorIds?: ReadonlySet<string>;
  /** Pedido sendo aceito agora (desabilita o botão para não clicar duas vezes). */
  acceptingActorId?: string | null;
  /** Chamado ao navegar a partir da notificação (fecha o popover para mostrar o destino). */
  onNavigate?: () => void;
};
