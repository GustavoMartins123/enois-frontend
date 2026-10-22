import type { CSSProperties } from "react";

import type { ThemeCollection } from "@/types/preferences/theme-collection";

/**
 * Miniatura de um tema da coleção: um cartãozinho desenhado com os dados de
 * preview do próprio tema — fundo, superfície, destaque, borda e o efeito que o
 * define (relevo, vidro, gloss, néon).
 *
 * É o lugar único onde estilo inline é permitido aqui: a galeria existe para
 * *mostrar os valores do tema*, e cada tema tem os seus.
 */
export function CollectionPreview({ collection }: { collection: ThemeCollection }) {
  const preview = collection.preview;

  const effect: CSSProperties =
    preview.effect === "bevel"
      ? {
          boxShadow:
            "inset -1px -1px #0a0a0a, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf",
        }
      : preview.effect === "glass"
        ? {
            backdropFilter: "blur(6px) saturate(1.15)",
            boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.7)",
          }
        : preview.effect === "glossy"
          ? { boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.8)" }
          : preview.effect === "neumorph"
            ? {
                boxShadow: "4px 4px 8px #c5cad3, -4px -4px 8px #ffffff",
                borderColor: "transparent",
              }
            : preview.effect === "terminal"
              ? { textShadow: "0 0 6px currentColor" }
              : {};

  return (
    <div
      className="h-16 w-full rounded-md border p-1.5"
      style={{ background: preview.background, borderColor: preview.border }}
    >
      <div
        className="flex h-full w-full flex-col rounded-sm p-1.5"
        style={{ background: preview.surface, border: `1px solid ${preview.border}`, ...effect }}
      >
        <div className="h-1.5 w-2/3 rounded-full" style={{ background: preview.primary }} />
        <div className="mt-1 h-1 w-full rounded-full" style={{ background: preview.border }} />
        <div className="mt-0.5 h-1 w-3/5 rounded-full" style={{ background: preview.border }} />

        <span
          className="mt-auto inline-flex h-4 w-fit items-center self-start px-1.5 text-[9px] leading-none"
          style={{ background: preview.primary, color: preview.onPrimary }}
        >
          Aa
        </span>
      </div>
    </div>
  );
}
