export type ApplicationFeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Recebe o motivo escrito (nunca vazio: o botão só habilita com texto). */
  onSubmit: (feedback: string) => void;
  pending: boolean;
};
