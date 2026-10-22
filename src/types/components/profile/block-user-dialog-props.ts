export type BlockUserDialogProps = {
  userId: string;
  name: string;
  /** Já bloqueado: o botão vira "Desbloquear". */
  blocked: boolean;
  onDone?: () => void;
};
