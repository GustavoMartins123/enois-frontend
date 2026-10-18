/** Pedido de ingresso pendente (só quem administra vê). */
export type GroupRequest = {
  id: string;
  userId: string;
  username: string | null;
  name: string | null;
  avatar: string | null;
  message: string | null;
  createdAt: string;
};
