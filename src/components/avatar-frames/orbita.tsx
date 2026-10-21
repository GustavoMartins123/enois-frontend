import type { CSSProperties } from "react";

const COMETAS = [
  { inclinacao: -18, cor: "#c4b5fd", volta: 3.2, fase: 0 },
  { inclinacao: 34, cor: "#67e8f9", volta: 4.4, fase: 0.35 },
  { inclinacao: 80, cor: "#f9a8d4", volta: 5.6, fase: 0.7 },
];

/** Cabeça do cometa e a cauda: cada ponto é o mesmo cometa um pouco atrás no tempo. */
const CAUDA = [9, 7.5, 6.2, 5, 4, 3.2, 2.5].map((tamanho, k) => ({
  tamanho,
  opacidade: 1 - k * 0.12,
  k,
}));

/**
 * Órbita: cometas em órbitas inclinadas. O movimento é uma elipse (x e y em seno, um
 * quarto de volta defasados) e a metade de trás de cada órbita some atrás do avatar —
 * a máscara do plano esconde o que cai dentro do círculo na metade de cima.
 */
export function OrbitaFx() {
  return (
    <span className="moldura-orbita">
      <span className="moldura-orbita__brilho" />
      {COMETAS.map((c) => (
        <span
          key={c.cor}
          className="moldura-orbita__plano"
          style={{ transform: `rotate(${c.inclinacao}deg)`, "--cor": c.cor } as CSSProperties}
        >
          <span className="moldura-orbita__trilha" />
          {CAUDA.map(({ tamanho, opacidade, k }) => {
            const atraso = -c.volta * (1 + c.fase) + k * 0.03 * c.volta;
            return (
              <span
                key={k}
                className="moldura-orbita__x"
                style={{
                  animationDuration: `${c.volta / 2}s`,
                  animationDelay: `${atraso.toFixed(3)}s`,
                }}
              >
                <span
                  className="moldura-fx__particula moldura-orbita__cometa"
                  style={
                    {
                      "--tamanho": `${tamanho}cqw`,
                      opacity: opacidade,
                      animationDuration: `${c.volta / 2}s`,
                      animationDelay: `${(atraso - c.volta / 4).toFixed(3)}s`,
                    } as CSSProperties
                  }
                />
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
