import { useEffect, useRef, useState } from "react";

/**
 * Diz se o elemento está visível na tela (e acompanha mudanças).
 *
 * É o que permite "tocar automático sem virar barulheira": o player só monta/roda quando a
 * publicação está de fato à vista, e para quando sai. Sem isso, um feed de 20 posts montaria 20
 * players ao mesmo tempo — pesado, e todos tocando de uma vez.
 */
export function useInView<T extends Element>(threshold = 0.5) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      // Sem IntersectionObserver o vídeo ainda funciona: fica no modo "clique para tocar".
      setInView(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      },
      // 25% de margem: o player já está montado quando a publicação encosta na borda, então o
      // vídeo começa sem o atraso de carregar na frente de quem está olhando.
      { threshold, rootMargin: "25% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
