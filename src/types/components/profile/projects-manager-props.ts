export type ProjectsManagerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Username do dono (o diálogo é aberto do próprio perfil). */
  username: string;
  onSaved: () => void;
};
