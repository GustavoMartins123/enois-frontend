import type { EmptyStateProps } from "@/types/components/ui/empty-state-props";

/**
 * Estado vazio padronizado.
 *
 * Havia cinco jeitos diferentes de dizer "não tem nada aqui" (uma linha centralizada de
 * tamanhos variados, um bloco com ícone, outro sem), cada tela num tom. Este é o único.
 */
export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      {Icon && (
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface-2 text-text-subtle">
          <Icon className="h-5 w-5" />
        </span>
      )}

      <p className="text-[14px] font-medium text-text-strong">{title}</p>

      {description && (
        <p className="max-w-sm text-[13px] font-light text-text-subtle">{description}</p>
      )}

      {children}
    </div>
  );
}
