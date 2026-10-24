import type { CSSProperties } from "react";

import { polar, round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(67);

/** Lâmina de capim com a base na origem e a ponta para cima, levemente curvada. */
function lamina(comprimento: number, curva: number): string {
  const l = comprimento;
  return `M-1 0 Q${round(curva * 0.4)} ${round(-l * 0.55)} ${curva} ${-l} Q${round(curva * 0.4 + 0.6)} ${round(-l * 0.5)} 1 0 Z`;
}

// Faixa de terra na borda de fora do anel, no arco de baixo: o capim nasce dela e cresce para o
// centro, cobrindo o anel e só encostando na foto.
const RAIO_DA_TERRA = 56.5;
const TERRA = (() => {
  const [x1, y1] = polar(RAIO_DA_TERRA, 116);
  const [x2, y2] = polar(RAIO_DA_TERRA, 244);
  return `M${x1} ${y1} A${RAIO_DA_TERRA} ${RAIO_DA_TERRA} 0 0 1 ${x2} ${y2}`;
})();

const CAPIM = ["#15803d", "#0f766e", "#16a34a"];

const MOITAS = Array.from({ length: 9 }, (_, i) => {
  const angulo = 124 + i * 14;
  const [x, y] = polar(RAIO_DA_TERRA, angulo);
  return {
    x,
    y,
    giro: round(angulo + 180 + (rand() - 0.5) * 10),
    laminas: Array.from({ length: 6 }, (_, j) => ({
      d: lamina(6 + rand() * 6, round((rand() - 0.5) * 6)),
      giro: round((rand() - 0.5) * 60),
      cor: CAPIM[j % CAPIM.length],
    })),
    flor: i % 2 === 1,
    atraso: round(-rand() * 3.2),
  };
});

const ESTRELAS = [292, 312, 334, 356, 18, 66, 84].map((angulo) => {
  const [x, y] = polar(52 + rand() * 4, angulo);
  return { x, y, duracao: round(1.8 + rand() * 1.6), atraso: round(-rand() * 3) };
});

// Os vaga-lumes "de verdade": voam em volta, cada um no seu raio, ritmo e sentido. O rastro são
// cópias do brilho com o mesmo movimento atrasado.
const VAGA_LUMES = [
  { raio: 62, volta: 15, sentido: 1, inicio: 0.1 },
  { raio: 57, volta: 19, sentido: -1, inicio: 0.45 },
  { raio: 66, volta: 23, sentido: 1, inicio: 0.75 },
].map((v) => ({
  ...v,
  dx: `${round((rand() - 0.5) * 10)}px`,
  dy: `${round((rand() - 0.5) * 10)}px`,
  voo: round(2.6 + rand() * 1.4),
  pisca: round(1.6 + rand() * 0.8),
}));

const RASTRO = [0.22, 0.44, 0.66];

const DISTANTES = Array.from({ length: 7 }, (_, i) => {
  const [x, y] = polar(54 + rand() * 16, i * 51 + rand() * 30);
  return { x, y, duracao: round(2.6 + rand() * 2), atraso: round(-rand() * 4.6) };
});

function orbita(v: (typeof VAGA_LUMES)[number], atrasoExtra = 0): CSSProperties {
  const atraso = round(-v.inicio * v.volta + atrasoExtra);
  return {
    animationDuration: `${v.volta}s`,
    animationDelay: `${atraso}s`,
    animationDirection: v.sentido === 1 ? "normal" : "reverse",
  };
}

function voo(v: (typeof VAGA_LUMES)[number], atrasoExtra = 0): CSSProperties {
  return {
    "--dx": v.dx,
    "--dy": v.dy,
    animationDuration: `${v.voo}s`,
    animationDelay: `${round(-v.inicio * v.voo + atrasoExtra)}s`,
  } as CSSProperties;
}

/**
 * Vaga-lumes: noite no campo. O anel é o céu com lua e estrelas, o capim e as flores-sino
 * balançam embaixo, três vaga-lumes com asas voam em volta deixando rastro e luzes distantes
 * piscam ao fundo. O brilho é gradiente, sem filtro de desfoque.
 */
export function VagaLumesFx() {
  const id = useFxId();
  const [luaX, luaY] = polar(54, 40);
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <linearGradient id={`${id}-ceu`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e1b4b" />
          <stop offset="0.6" stopColor="#1e3a5f" />
          <stop offset="1" stopColor="#134e4a" />
        </linearGradient>

        <radialGradient id={`${id}-luz`}>
          <stop offset="0" stopColor="#fefce8" />
          <stop offset="0.2" stopColor="#d9f99d" stopOpacity="0.95" />
          <stop offset="1" stopColor="#a3e635" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${id}-luar`}>
          <stop offset="0.3" stopColor="#fef9c3" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fef9c3" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle r="54" fill="none" stroke={`url(#${id}-ceu)`} strokeWidth="9" />

      <g fill="none" strokeWidth="0.6">
        <circle r="58.5" stroke="#a5b4fc" strokeOpacity="0.35" />
        <circle r="49.5" stroke="#a5b4fc" strokeOpacity="0.45" />
      </g>

      <g transform={`translate(${luaX} ${luaY})`}>
        <circle r="11" fill={`url(#${id}-luar)`} />
        <path d="M-1 -4.6 A4.6 4.6 0 1 0 3.6 3 A3.6 3.6 0 1 1 -1 -4.6 Z" fill="#fef9c3" />
      </g>
      {ESTRELAS.map((e, i) => (
        <g key={i} transform={`translate(${e.x} ${e.y})`}>
          <path
            d="M0 -2.2 L0.5 -0.5 L2.2 0 L0.5 0.5 L0 2.2 L-0.5 0.5 L-2.2 0 L-0.5 -0.5 Z"
            fill="#e0e7ff"
            className="moldura-vaga-lumes__estrela"
            style={{ animationDuration: `${e.duracao}s`, animationDelay: `${e.atraso}s` }}
          />
        </g>
      ))}

      {DISTANTES.map((d, i) => (
        <g key={i} transform={`translate(${d.x} ${d.y})`}>
          <circle
            r="4.5"
            fill={`url(#${id}-luz)`}
            className="moldura-fx__particula moldura-vaga-lumes__distante"
            style={{ animationDuration: `${d.duracao}s`, animationDelay: `${d.atraso}s` }}
          />
        </g>
      ))}

      <path d={TERRA} fill="none" stroke="#14532d" strokeWidth="4" strokeLinecap="round" />
      {MOITAS.map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.giro})`}>
          <g className="moldura-vaga-lumes__capim" style={{ animationDelay: `${m.atraso}s` }}>
            {m.laminas.map((l, j) => (
              <path key={j} d={l.d} transform={`rotate(${l.giro})`} fill={l.cor} />
            ))}
            {m.flor && (
              <g transform="scale(1.05)">
                <path d="M0 0 Q2 -7 0 -12" fill="none" stroke="#166534" strokeWidth="0.8" />
                <path
                  d="M0 -12 C-2.6 -11.6 -3 -8.6 -2.4 -7.4 L-1 -8.2 L0 -7.2 L1 -8.2 L2.4 -7.4 C3 -8.6 2.6 -11.6 0 -12 Z"
                  fill="#c4b5fd"
                />
              </g>
            )}
          </g>
        </g>
      ))}

      {VAGA_LUMES.map((v, i) => (
        <g key={i}>
          {RASTRO.map((lag, j) => (
            <g key={j} className="moldura-vaga-lumes__orbita" style={orbita(v, lag)}>
              <g transform={`translate(0 ${-v.raio})`}>
                <g className="moldura-vaga-lumes__voo" style={voo(v, lag)}>
                  <circle
                    r={round(2.6 - j * 0.6)}
                    fill={`url(#${id}-luz)`}
                    opacity={round(0.6 - j * 0.17)}
                    className="moldura-fx__particula"
                  />
                </g>
              </g>
            </g>
          ))}
          <g className="moldura-vaga-lumes__orbita" style={orbita(v)}>
            <g transform={`translate(0 ${-v.raio}) scale(${1.4 * v.sentido} 1.4)`}>
              <g className="moldura-vaga-lumes__voo" style={voo(v)}>
                <circle
                  r="8"
                  cx="-2"
                  fill={`url(#${id}-luz)`}
                  className="moldura-vaga-lumes__luz"
                  style={{ animationDuration: `${v.pisca}s` }}
                />

                <g className="moldura-vaga-lumes__asa">
                  <ellipse cx="0.2" cy="-1.9" rx="2.4" ry="1.1" fill="#e0f2fe" fillOpacity="0.6" />
                </g>

                <ellipse cx="1" rx="2.2" ry="1.1" fill="#1c1917" />
                <circle cx="3.1" r="0.85" fill="#292524" />
                <circle cx="-1.6" r="1.3" fill="#fefce8" />
              </g>
            </g>
          </g>
        </g>
      ))}
    </svg>
  );
}
