import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Ícone pequeno ao lado do título, na cor de destaque. */
  icon?: LucideIcon;
  /** Botões da página (criar, filtros rápidos). Ficam à direita no desktop e descem no celular. */
  actions?: ReactNode;
  /** Conteúdo extra dentro do mesmo cartão, abaixo do título (filtros, números). */
  children?: ReactNode;
};
