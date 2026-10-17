import { useState } from "react";

import type { ReadMoreProps } from "@/types/components/ui/read-more-props";

/**
 * Corta texto longo com "ler mais".
 *
 * Existe para o feed e os comentários não virarem um paredão de texto: quem quer ler abre, quem não
 * quer passa o olho. O corte é por linhas (CSS), então não corta palavra no meio.
 *
 * O controle só aparece quando o texto passa de {@code threshold} caracteres — abaixo disso não há
 * o que expandir, e um "ler mais" que não faz nada é ruído.
 */
export function ReadMore({
  children,
  clampClassName,
  length,
  threshold,
  moreLabel,
  lessLabel,
}: ReadMoreProps) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = length > threshold;

  return (
    <>
      <div className={expanded ? undefined : clampClassName}>{children}</div>

      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="mt-1 text-sm font-normal text-primary hover:underline"
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </>
  );
}
