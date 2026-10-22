import type { CSSProperties } from "react";

import { polar, round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(23);
const VOLTA_DO_BRILHO = 3.6;

/** Lasca de gelo com a base na origem e a ponta para cima. */
function lasca(w: number, h: number): string {
  return `M${-w} 0 L${round(-w * 0.55)} ${round(-h * 0.82)} L0 ${-h} L${round(w * 0.55)} ${round(-h * 0.82)} L${w} 0 Z`;
}

const CRISTAIS = Array.from({ length: 14 }, (_, i) => {
  const angulo = round((i * 360) / 14 + (rand() - 0.5) * 10);
  const [x, y] = polar(48, angulo);
  const altura = round(9 + rand() * 10);
  return {
    x,
    y,
    angulo,
    principal: lasca(2.6, altura),
    esquerda: {
      d: lasca(1.8, round(altura * (0.45 + rand() * 0.2))),
      giro: round(-26 - rand() * 10),
    },
    direita: {
      d: lasca(1.8, round(altura * (0.45 + rand() * 0.2))),
      giro: round(24 + rand() * 12),
    },
    // O reflexo corre a volta inteira: cada cristal acende quando a luz passa por ele.
    atraso: round(-VOLTA_DO_BRILHO + (angulo / 360) * VOLTA_DO_BRILHO),
  };
});

const CINTILAS = Array.from({ length: 6 }, (_, i) => {
  const [x, y] = polar(56 + rand() * 10, i * 60 + rand() * 40);
  return { x, y, atraso: round(-rand() * 2.4), duracao: round(1.8 + rand()) };
});

const GEADA = Array.from({ length: 8 }, (_, i) => {
  const angulo = i * 45 + rand() * 30;
  const [x, y] = polar(51, angulo);
  const [dx, dy] = polar(12 + rand() * 8, angulo);
  return {
    x,
    y,
    r: round(0.6 + rand() * 0.6),
    dx: `${dx}px`,
    dy: `${dy}px`,
    atraso: round(-rand() * 3),
  };
});

/** Glacial: cristais de gelo com um reflexo que dá a volta, cintilas e geada que se solta. */
export function GlacialFx() {
  const id = useFxId();
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <linearGradient id={`${id}-gelo`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#0ea5e9" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#bae6fd" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>

        <radialGradient id={`${id}-frio`}>
          <stop offset="0.8" stopColor="#bae6fd" stopOpacity="0" />
          <stop offset="1" stopColor="#e0f2fe" stopOpacity="0.65" />
        </radialGradient>

        <filter id={`${id}-brilho`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle r="50" fill={`url(#${id}-frio)`} />
      <circle
        r="50"
        fill="none"
        stroke="#e0f2fe"
        strokeWidth="2.2"
        filter={`url(#${id}-brilho)`}
        className="moldura-glacial__anel"
      />

      <g filter={`url(#${id}-brilho)`} stroke="#f0f9ff" strokeWidth="0.5" strokeLinejoin="round">
        {CRISTAIS.map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.angulo})`}>
            <path
              d={c.esquerda.d}
              transform={`rotate(${c.esquerda.giro})`}
              fill={`url(#${id}-gelo)`}
            />
            <path
              d={c.direita.d}
              transform={`rotate(${c.direita.giro})`}
              fill={`url(#${id}-gelo)`}
            />
            <path d={c.principal} fill={`url(#${id}-gelo)`} />
            <path
              d={c.principal}
              fill="#ffffff"
              stroke="none"
              className="moldura-glacial__reflexo"
              style={{ animationDuration: `${VOLTA_DO_BRILHO}s`, animationDelay: `${c.atraso}s` }}
            />
          </g>
        ))}
      </g>
      {GEADA.map((g, i) => (
        <g key={i} transform={`translate(${g.x} ${g.y})`}>
          <circle
            r={g.r}
            fill="#f0f9ff"
            className="moldura-fx__particula moldura-glacial__geada"
            style={{ "--dx": g.dx, "--dy": g.dy, animationDelay: `${g.atraso}s` } as CSSProperties}
          />
        </g>
      ))}
      {CINTILAS.map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y})`}>
          <path
            d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z"
            fill="#ffffff"
            className="moldura-fx__particula moldura-glacial__cintila"
            style={{ animationDuration: `${c.duracao}s`, animationDelay: `${c.atraso}s` }}
          />
        </g>
      ))}
    </svg>
  );
}
