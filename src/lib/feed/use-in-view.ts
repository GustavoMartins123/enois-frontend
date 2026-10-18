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

    // O limiar é o MENOR entre o pedido e o que o elemento consegue atingir: um vídeo mais alto
    // que 60% da janela nunca chega a 0.6 de visibilidade, então `inView` ficava falso para
    // sempre — o player não tocava (e, uma vez fora de vista, não voltava). O que vale é "a maior
    // parte do que dá para ver", não uma fração impossível.
    const height = element.getBoundingClientRect().height;
    const viewport = window.innerHeight || 0;
    const reachable =
      height > 0 && viewport > 0 ? Math.min(1, (viewport * threshold) / height) : threshold;
    const effective = Math.max(0.15, Math.min(threshold, reachable));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      },
      // 25% de margem: o player já está montado quando a publicação encosta na borda, então o
      // vídeo começa sem o atraso de carregar na frente de quem está olhando.
      { threshold: effective, rootMargin: "25% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
