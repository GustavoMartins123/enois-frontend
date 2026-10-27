import type { CSSProperties } from "react";

import { polar, round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(83);

const RAIO_DO_TUBO = 54;
/** A faixa em volta do tubo onde a chuva pega a cor do neon. */
const BRILHO_DE_DENTRO = 47;
const BRILHO_DE_FORA = 63;

/** O brilho do tubo é feito com traços cada vez mais largos e fracos, sem filtro de desfoque. */
const BRILHO = [
  { largura: 9, opacidade: 0.12 },
  { largura: 4.5, opacidade: 0.3 },
];

/**
 * Camadas de chuva: cada uma cai uma altura de 160 (o quadro inteiro) por volta, com as gotas
 * repetidas 160 acima, então a camada desliza (só transform) e emenda sem buraco. Camadas com
 * velocidades diferentes dão profundidade.
 */
const CHUVA = [0.8, 1.05, 1.4].map((duracao, camada) => ({
  duracao,
  largura: round(0.9 - camada * 0.2),
  // As gotas de uma camada se movem juntas, então vão todas num path só.
  d: Array.from({ length: 9 }, () => {
    const x = round(-74 + rand() * 148);
    const y = round(-80 + rand() * 160);
    const comprimento = round(6 + rand() * 4 - camada);
    return `M${x} ${y}v${comprimento}M${x} ${round(y - 160)}v${comprimento}`;
  }).join(""),
}));

// Gotas que se formam embaixo do tubo, pendem, caem na poça e fazem a onda onde batem.
const PINGOS = [158, 181, 203].map((angulo) => {
  const [x, y] = polar(RAIO_DO_TUBO + 1.5, angulo);
  return { x, y, duracao: round(2.2 + rand() * 1.2), atraso: round(-rand() * 3) };
});
const CHAO = 73;

const RESPINGOS = Array.from({ length: 5 }, () => {
  const angulo = (rand() - 0.5) * 70;
  const [x, y] = polar(RAIO_DO_TUBO + 1, angulo);
  const [dx, dy] = polar(4 + rand() * 4, angulo + (rand() - 0.5) * 60);
  return {
    x,
    y,
    dx: `${dx}px`,
    dy: `${dy}px`,
    duracao: round(0.7 + rand() * 0.5),
    atraso: round(-rand() * 1.2),
  };
});

/** O raio do relâmpago, no céu do alto à esquerda, fora do brilho do tubo. */
const RAIO = "M-62 -64 L-54 -58 L-57.5 -56 L-49 -50.5 L-52.5 -49 L-45 -45";

// Presilhas que prendem o tubo, com a haste para fora.
const PRESILHAS = [70, 290];

// Gotas paradas no tubo que pegam a luz, fora do arco de baixo (onde ficam os pingos).
const GOTAS_NO_TUBO = Array.from({ length: 7 }, (_, i) => {
  const [x, y] = polar(RAIO_DO_TUBO + (rand() - 0.5) * 1.6, -100 + i * 30 + rand() * 18);
  return { x, y, atraso: round(-rand() * 2.4) };
});

// O cabo sai do tubo embaixo à direita e desce até o transformador, balançando com o vento.
const [CABO_X, CABO_Y] = polar(RAIO_DO_TUBO, 135);

/** Círculo como subcaminho de path, para montar regiões com furo (regra evenodd). */
function circulo(r: number): string {
  return `M0 ${-r} A${r} ${r} 0 1 1 0 ${r} A${r} ${r} 0 1 1 0 ${-r} Z`;
}

/**
 * Neon na chuva: um tubo rosa numa noite de chuva. A mesma chuva é desenhada duas vezes,
 * recortada em regiões fixas: fora do brilho as gotas são claras e, na faixa do tubo, rosa, então
 * cada gota acende ao passar pelo neon. A chuva não passa pela foto. Embaixo, pingos escorrem do
 * tubo e caem numa poça que reflete a luz; em cima, a chuva respinga no tubo. O tubo é preso por
 * presilhas, tem gotas brilhando e um cabo até o transformador, e de vez em quando relampeja.
 */
export function NeonFx() {
  const id = useFxId();
  const chuva = (cor: string, opacidade: number) =>
    CHUVA.map((c, i) => (
      <g
        key={i}
        className="moldura-fx__particula moldura-neon__chuva"
        style={{ animationDuration: `${c.duracao}s` }}
        stroke={cor}
        strokeOpacity={opacidade}
        strokeWidth={c.largura}
        strokeLinecap="round"
      >
        <path d={c.d} />
      </g>
    ));
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <clipPath id={`${id}-fora`}>
          <path clipRule="evenodd" d={`M-80 -80 H80 V80 H-80 Z ${circulo(BRILHO_DE_FORA)}`} />
        </clipPath>

        <clipPath id={`${id}-faixa`}>
          <path clipRule="evenodd" d={`${circulo(BRILHO_DE_FORA)} ${circulo(BRILHO_DE_DENTRO)}`} />
        </clipPath>

        <radialGradient id={`${id}-noite`}>
          <stop offset="0.58" stopColor="#1e1b4b" stopOpacity="0" />
          <stop offset="0.66" stopColor="#1e1b4b" stopOpacity="0.38" />
          <stop offset="0.88" stopColor="#1e1b4b" stopOpacity="0.14" />
          <stop offset="1" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${id}-clarao`}>
          <stop offset="0.58" stopColor="#e0e7ff" stopOpacity="0" />
          <stop offset="0.68" stopColor="#e0e7ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#e0e7ff" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${id}-poca`}>
          <stop offset="0" stopColor="#ff4fd8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff4fd8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle r="80" fill={`url(#${id}-noite)`} />
      <circle r="80" fill={`url(#${id}-clarao)`} className="moldura-neon__clarao" />
      <path
        d={RAIO}
        fill="none"
        stroke="#eef2ff"
        strokeWidth="1"
        strokeLinejoin="round"
        className="moldura-neon__clarao"
      />

      <g clipPath={`url(#${id}-fora)`}>{chuva("#94a3b8", 0.7)}</g>

      <g clipPath={`url(#${id}-faixa)`}>{chuva("#ffb3ec", 0.95)}</g>

      <ellipse
        cy={CHAO}
        rx="36"
        ry="4.5"
        fill={`url(#${id}-poca)`}
        className="moldura-neon__poca"
      />
      {PINGOS.map((p, i) => (
        <g key={i}>
          <g transform={`translate(${p.x} ${CHAO})`}>
            <ellipse
              rx="5"
              ry="1.2"
              fill="none"
              stroke="#ffb3ec"
              strokeWidth="0.5"
              className="moldura-fx__particula moldura-neon__onda"
              style={{ animationDuration: `${p.duracao}s`, animationDelay: `${p.atraso}s` }}
            />
          </g>

          <g transform={`translate(${p.x} ${p.y})`}>
            <path
              d="M0 -1.6 C1.4 0 1.5 1.2 0 2 C-1.5 1.2 -1.4 0 0 -1.6 Z"
              fill="#ffd6f5"
              className="moldura-fx__particula moldura-neon__pingo"
              style={
                {
                  "--queda": `${round(CHAO - p.y)}px`,
                  animationDuration: `${p.duracao}s`,
                  animationDelay: `${p.atraso}s`,
                } as CSSProperties
              }
            />
          </g>
        </g>
      ))}

      <g fill="none" className="moldura-neon__tubo">
        {BRILHO.map((b) => (
          <circle
            key={b.largura}
            r={RAIO_DO_TUBO}
            stroke="#ff4fd8"
            strokeWidth={b.largura}
            strokeOpacity={b.opacidade}
          />
        ))}
        <circle r={RAIO_DO_TUBO} stroke="#ffe4fa" strokeWidth="1.4" />
      </g>

      {PRESILHAS.map((angulo) => (
        <g key={angulo} transform={`rotate(${angulo}) translate(0 ${-RAIO_DO_TUBO})`}>
          <line y2="-7" stroke="#64748b" strokeWidth="1" />
          <circle cy="-7.4" r="1.1" fill="#94a3b8" />
          <rect x="-1.7" y="-2.8" width="3.4" height="5.6" rx="0.6" fill="#475569" />
        </g>
      ))}

      <g transform={`translate(${CABO_X} ${CABO_Y})`}>
        <g className="moldura-neon__cabo">
          <path d="M0 0 C3 7 12 8 14 19" fill="none" stroke="#475569" strokeWidth="1.1" />
          <rect
            x="9.5"
            y="19"
            width="9"
            height="6.5"
            rx="0.8"
            fill="#334155"
            stroke="#64748b"
            strokeWidth="0.5"
          />
          <circle cx="16" cy="22.2" r="0.75" fill="#fb7185" className="moldura-neon__led" />
        </g>
      </g>

      {GOTAS_NO_TUBO.map((g, i) => (
        <circle
          key={i}
          cx={g.x}
          cy={g.y}
          r="0.75"
          fill="#ffffff"
          className="moldura-neon__gota"
          style={{ animationDelay: `${g.atraso}s` }}
        />
      ))}

      {RESPINGOS.map((r, i) => (
        <g key={i} transform={`translate(${r.x} ${r.y})`}>
          <circle
            r="0.7"
            fill="#ffe4fa"
            className="moldura-fx__particula moldura-neon__respingo"
            style={
              {
                "--dx": r.dx,
                "--dy": r.dy,
                animationDuration: `${r.duracao}s`,
                animationDelay: `${r.atraso}s`,
              } as CSSProperties
            }
          />
        </g>
      ))}
    </svg>
  );
}
