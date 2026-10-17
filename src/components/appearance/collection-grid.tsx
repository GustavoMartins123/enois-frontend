import { THEME_COLLECTIONS } from "@/constants/theme-collections";
import { texts } from "@/texts";
import type { CollectionGridProps } from "@/types/components/appearance/collection-grid-props";

import { cn } from "@/lib/utils";

import { CollectionPreview } from "./collection-preview";

/**
 * Galeria de temas.
 *
 * Cada cartão é uma amostra real do tema (miniatura com fundo, superfície,
 * destaque e o efeito que o define) com nome e uma linha de descrição — não é
 * uma lista de nomes sem contexto. Selecionar aplica na hora; o cartão do
 * Padrão Énóis restaura a marca com um clique.
 */
export function CollectionGrid({ activeId, onSelect }: CollectionGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={activeId === null}
        className={cn(
          "rounded-xl border p-2 text-left transition",
          activeId === null
            ? "border-primary ring-1 ring-primary"
            : "border-border-soft hover:border-border",
        )}
      >
        <div
          className="flex h-16 w-full flex-col rounded-md border border-border-soft p-1.5"
          style={{ background: "linear-gradient(135deg, #f9f8ff, #ede8f5)" }}
        >
          <div className="h-1.5 w-2/3 rounded-full bg-primary" />
          <div className="mt-1 h-1 w-full rounded-full bg-border-soft" />
          <div className="mt-0.5 h-1 w-3/5 rounded-full bg-border-soft" />

          <span className="mt-auto inline-flex h-4 w-fit items-center self-start rounded-full bg-primary px-1.5 text-[9px] leading-none text-primary-foreground">
            Aa
          </span>
        </div>

        <p className="mt-1.5 text-xs font-medium text-text-strong">
          {texts.appearance.defaultThemeName}
        </p>

        <p className="text-[11px] leading-tight text-text-subtle">
          {texts.appearance.defaultThemeDescription}
        </p>
      </button>

      {THEME_COLLECTIONS.map((collection) => (
        <button
          key={collection.id}
          type="button"
          onClick={() => onSelect(collection.id)}
          aria-pressed={activeId === collection.id}
          className={cn(
            "rounded-xl border p-2 text-left transition",
            activeId === collection.id
              ? "border-primary ring-1 ring-primary"
              : "border-border-soft hover:border-border",
          )}
        >
          <CollectionPreview collection={collection} />

          <p className="mt-1.5 text-xs font-medium text-text-strong">{collection.name}</p>

          <p className="text-[11px] leading-tight text-text-subtle">{collection.description}</p>
        </button>
      ))}
    </div>
  );
}
