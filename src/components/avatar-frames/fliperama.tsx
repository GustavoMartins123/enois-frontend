import type { CSSProperties } from "react";

import { polar, round } from "@/lib/avatar-frames";

const BLOCO = 6;

/**
 * Anel "pixelado": as células da grade de BLOCO unidades por onde passa o círculo de raio 57,
 * na ordem em que o círculo passa por elas (sentido horário, a partir do topo).
 */
const CELULAS = (() => {
  const vistas = new Map<string, [number, number]>();
  for (let angulo = 0; angulo < 360; angulo++) {
    const [px, py] = polar(57, angulo);
    const x = Math.round(px / BLOCO) * BLOCO;
    const y = Math.round(py / BLOCO) * BLOCO;
    vistas.set(`${x},${y}`, [x, y]);
  }
  return [...vistas.values()];
})();

/**
 * A cobrinha (moldura-fliperama-cobra no styles.css): o ciclo é uma PAUSA e quatro voltas. Cada
 * célula acende quando a cabeça chega nela, com o atraso da sua posição, e a cobra cresce a cada
 * volta. No fim da quarta volta ela entra na toca do topo; a PAUSA é o tempo de o corpo entrar
 * inteiro (a cauda maior leva 0,9s) e de um respiro antes de a cobra nova sair da toca. As
 * porcentagens do styles.css saem de VOLTA, PAUSA e MACAS: se um mudar, elas mudam junto.
 */
const VOLTA = 5.875;
const PAUSA = 1.5;
const CICLO = VOLTA * 4 + PAUSA;
const PASSO = VOLTA / CELULAS.length;

/**
 * A maçã de cada volta, na fração da volta em que a cabeça passa por ela; no styles.css é onde a
 * maçã some, a moeda gira e o "+1" sobe. A célula é arredondada para baixo, então a cabeça chega
 * nela um pouco antes de a maçã sumir, nunca depois: por isso a fração vezes o número de células
 * do anel (74) cai no meio de uma célula, e a cabeça chega meio passo antes de a maçã sumir.
 */
const MACAS = [0.304, 0.709, 0.52, 0.128].map((fracao) => {
  const [x, y] = CELULAS[Math.floor(fracao * CELULAS.length)];
  return { x, y };
});

/**
 * Quadrados de lado `lado` centrados em cada ponto, num path só: o que não se mexe sozinho fica
 * num elemento por cor, e o SVG continua leve mesmo com dezenas de avatares na tela.
 */
function quadrados(pontos: [number, number][], lado: number): string {
  const meio = lado / 2;
  return pontos
    .map(([x, y]) => `M${round(x - meio)} ${round(y - meio)}h${lado}v${lado}h${-lado}Z`)
    .join("");
}

/**
 * Pixel art centrada na origem: cada caractere vira um quadrado da cor do mapa (ponto é vazio).
 * Devolve um path por cor.
 */
function pixels(desenho: string[], cores: Record<string, string>, unidade: number) {
  const meiaLargura = (desenho[0].length * unidade) / 2;
  const meiaAltura = (desenho.length * unidade) / 2;
  return Object.entries(cores).map(([letra, cor]) => {
    const pontos = desenho.flatMap((linha, y) =>
      [...linha].flatMap((c, x): [number, number][] =>
        c === letra
          ? [[x * unidade - meiaLargura + unidade / 2, y * unidade - meiaAltura + unidade / 2]]
          : [],
      ),
    );
    return { cor, d: quadrados(pontos, unidade) };
  });
}

const ANEL = quadrados(CELULAS, 5.4);

/** A toca no topo do anel, de onde a cobra sai e para onde ela volta no fim do ciclo. */
const TOCA = CELULAS[0];

const MACA = pixels(
  ["..G..", ".RRR.", "RWRRR", "RRRRR", ".RRR."],
  { R: "#ef4444", W: "#fecaca", G: "#22c55e" },
  1.3,
);

const MOEDA = pixels(
  ["..YYY..", ".YWYYY.", "YWYYYOY", "YWYYYOY", "YWYYYOY", ".YYYOY.", "..OOO.."],
  { Y: "#facc15", W: "#fef9c3", O: "#ca8a04" },
  1.7,
);

const MAIS_UM = pixels(
  [".W...W.", "WWW.WW.", ".W...W.", ".....W.", "....WWW"],
  { W: "#fef08a" },
  1.1,
);

const CORACAO = pixels(
  [".RR.RR.", "RWRRRRR", "RRRRRRR", ".RRRRR.", "..RRR..", "...R..."],
  { R: "#f43f5e", W: "#ffe4e6" },
  1.6,
);

const ESTRELA = pixels([".W.", "WWW", ".W."], { W: "#e0e7ff" }, 1.5);

const ESTRELAS = [62, 118, 242, 298].map((angulo, i) => {
  const [x, y] = polar(70, angulo);
  return { x, y, atraso: round(-i * 0.55) };
});

/**
 * Fliperama: o jogo da cobrinha no anel de pixels. A cobra sai da toca do topo, dá quatro voltas
 * comendo uma maçã por volta e crescendo, e entra de volta na toca; a cada maçã a moeda do alto
 * gira e sobe um "+1". O coração pulsa embaixo e as estrelas piscam. Tudo anda em step-end,
 * quadro a quadro, como num jogo antigo.
 */
export function FliperamaFx() {
  const [moedaX, moedaY] = polar(68, 0);
  const [coracaoX, coracaoY] = polar(68, 180);
  const posicoesDasMacas = Object.fromEntries(
    MACAS.flatMap((m, i) => [
      [`--x${i}`, `${m.x}px`],
      [`--y${i}`, `${m.y}px`],
    ]),
  ) as CSSProperties;
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg" shapeRendering="crispEdges">
      <path d={ANEL} fill="#312e81" />
      <rect
        x={TOCA[0] - 2.7}
        y={TOCA[1] - 2.7}
        width="5.4"
        height="5.4"
        fill="#0b0a1f"
        stroke="#818cf8"
        strokeWidth="0.6"
      />

      <g fill="#4ade80">
        {CELULAS.map(([x, y], i) => (
          <rect
            key={i}
            x={x - 2.7}
            y={y - 2.7}
            width="5.4"
            height="5.4"
            className="moldura-fliperama__cobra"
            style={{
              animationDuration: `${CICLO}s`,
              // Milésimos: com centésimos, células vizinhas ficariam até 5ms fora de passo e
              // a cabeça piscaria na troca.
              animationDelay: `${(i * PASSO - CICLO).toFixed(3)}s`,
            }}
          />
        ))}
      </g>

      <g
        className="moldura-fliperama__maca"
        style={{ ...posicoesDasMacas, animationDuration: `${CICLO}s` }}
      >
        {MACA.map((p) => (
          <path key={p.cor} d={p.d} fill={p.cor} />
        ))}
      </g>

      <g transform={`translate(${moedaX} ${moedaY})`}>
        <g className="moldura-fliperama__moeda" style={{ animationDuration: `${CICLO}s` }}>
          {MOEDA.map((p) => (
            <path key={p.cor} d={p.d} fill={p.cor} />
          ))}
        </g>

        <g transform="translate(9 -2)">
          <g className="moldura-fliperama__ponto" style={{ animationDuration: `${CICLO}s` }}>
            {MAIS_UM.map((p) => (
              <path key={p.cor} d={p.d} fill={p.cor} />
            ))}
          </g>
        </g>
      </g>

      <g transform={`translate(${coracaoX} ${coracaoY})`}>
        <g className="moldura-fliperama__coracao">
          {CORACAO.map((p) => (
            <path key={p.cor} d={p.d} fill={p.cor} />
          ))}
        </g>
      </g>
      {ESTRELAS.map((e, i) => (
        <g key={i} transform={`translate(${e.x} ${e.y})`}>
          <g className="moldura-fliperama__estrela" style={{ animationDelay: `${e.atraso}s` }}>
            {ESTRELA.map((p) => (
              <path key={p.cor} d={p.d} fill={p.cor} />
            ))}
          </g>
        </g>
      ))}
    </svg>
  );
}
