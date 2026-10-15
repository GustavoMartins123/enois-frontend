import type { PillProps } from "@/types/components/ui/pill-props";

import { cn } from "@/lib/utils";

const SIZES = {
  sm: "px-3 py-1 text-xs",
  md: "px-3.5 py-1.5 text-[13px]",
} as const;

/**
 * Filtro/aba em formato de pílula.
 *
 * Existiam quatro implementações do mesmo controle (feed, filtros de vaga, tópicos de
 * comunidade, abas do editar perfil) com bordas, fundos e tamanhos levemente diferentes.
 * Aqui vira um só, com a variante `active`.
 */
export function Pill({ active = false, size = "md", onClick, className, children }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border font-light transition",
        SIZES[size],
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border-soft bg-surface-card text-text-subtle hover:border-primary hover:text-primary",
        className,
      )}
    >
      {children}
    </button>
  );
}
