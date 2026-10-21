import type { PillRowProps } from "@/types/components/ui/pill-row-props";

import { cn } from "@/lib/utils";

/**
 * Faixa de pílulas numa linha só, que rola para o lado.
 *
 * Quebrando linha, os filtros do feed viravam duas fileiras no desktop e quatro no celular, e as
 * 33 categorias de comunidades enchiam a primeira tela inteira antes de aparecer uma comunidade.
 * A barra de rolagem só aparece com o mouse em cima; no toque, o arrasto lateral já é natural.
 * A margem negativa no celular (igual ao px-3 da casca) deixa a faixa encostar na borda da tela, que é o sinal de "tem mais".
 */
export function PillRow({ label, className, children }: PillRowProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "-mx-3 flex items-center gap-1.5 overflow-x-auto overscroll-x-contain px-3 pb-1 scrollbar-on-hover sm:mx-0 sm:px-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
