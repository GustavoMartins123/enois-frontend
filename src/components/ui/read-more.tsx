import { useEffect, useRef, useState } from "react";

import type { ReadMoreProps } from "@/types/components/ui/read-more-props";

/**
 * Corta texto longo com "ler mais".
 *
 * Existe para o feed e os comentários não virarem um paredão de texto: quem quer ler abre, quem não
 * quer passa o olho. O corte é por linhas (CSS), então não corta palavra no meio.
 *
 * Quem decide se o controle aparece é a **altura de verdade**, não uma contagem de caracteres: o
 * corte é por linhas, então um comentário curto com muitas quebras (uma lista, um recado em várias
 * linhas) passava das 5 linhas e ficava cortado com "..." **sem** botão para abrir — o limite de
 * caracteres dizia que não havia o que expandir enquanto a tela mostrava o contrário. Medir também
 * resolve o inverso: um texto longo que cabe no corte não ganha um "ler mais" que não faz nada.
 */
export function ReadMore({ children, clampClassName, moreLabel, lessLabel }: ReadMoreProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = contentRef.current;
    // Expandido não há corte para medir — e o estado fica como está, para o "ler menos" continuar.
    if (!element || expanded) return;

    const measure = () => setOverflowing(element.scrollHeight - element.clientHeight > 1);
    measure();

    // Fonte que carrega depois, tela que gira, texto editado: tudo muda a altura e a medida antiga
    // deixaria de valer.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded]);

  return (
    <>
      <div ref={contentRef} className={expanded ? undefined : clampClassName}>
        {children}
      </div>

      {overflowing && (
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
