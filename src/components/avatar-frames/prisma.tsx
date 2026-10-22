import type { CSSProperties } from "react";

import { polar, round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(113);
const entre = (min: number, max: number) => round(min + rand() * (max - min));
/** Deslocamento com sinal aleatório e nunca perto de zero: o caco sempre sobe ou desce. */
const altura = (min: number, max: number) => (rand() < 0.5 ? -1 : 1) * entre(min, max);

/** Vidro: [reflexo claro, cor, sombra]. */
const VIDROS = [
  ["#ddd6fe", "#8b5cf6", "#5b21b6"],
  ["#bfdbfe", "#3b82f6", "#1e40af"],
  ["#a5f3fc", "#06b6d4", "#0e7490"],
  ["#bbf7d0", "#22c55e", "#15803d"],
  ["#fde68a", "#f59e0b", "#b45309"],
  ["#fbcfe8", "#ec4899", "#9d174d"],
];

/**
 * Cada caco tem formato, cor, tamanho e órbita próprios. A flutuação soma duas animações de
 * períodos diferentes (uma com três alturas sorteadas), então a combinação não se repete.
 */
let ultimaCor = -1;
const CACOS = Array.from({ length: 15 }, (_, i) => {
  const tamanho = entre(5.5, 10);
  const esticado = entre(0.55, 1);
  const lados = 3 + Math.floor(rand() * 3);
  const angulos = Array.from({ length: lados }, (_, k) => (k + rand() * 0.7) * (360 / lados)).sort(
    (a, b) => a - b,
  );
  const vertices = angulos.map((a) => {
    const [x, y] = polar(tamanho * entre(0.55, 1), a);
    return [round(x * esticado), y];
  });
  const [a, b] = vertices;
  let cor = Math.floor(rand() * VIDROS.length);
  if (cor === ultimaCor) cor = (cor + 1) % VIDROS.length;
  ultimaCor = cor;
  return {
    posicao: polar(entre(58, 68), i * 24 + entre(-8, 8)),
    pontos: vertices.map((v) => v.join(",")).join(" "),
    reflexo: `M${round(a[0] * 0.7)} ${round(a[1] * 0.7)} L${round(b[0] * 0.7)} ${round(b[1] * 0.7)}`,
    cor,
    flutua: {
      "--a": `${altura(1.5, 6)}px`,
      "--b": `${altura(1.5, 6)}px`,
      "--c": `${altura(1.5, 6)}px`,
      "--g0": `${entre(-40, 40)}deg`,
      "--g1": `${entre(-40, 40)}deg`,
      animationDuration: `${entre(4.2, 7.8)}s`,
      animationDelay: `${entre(-8, 0)}s`,
    } as CSSProperties,
    deriva: {
      "--d": `${altura(1.2, 3)}px`,
      animationDuration: `${entre(1.9, 3.7)}s`,
      animationDelay: `${entre(-4, 0)}s`,
    } as CSSProperties,
    brilho: { animationDuration: `${entre(2.4, 5.2)}s`, animationDelay: `${entre(-5, 0)}s` },
  };
});

/** Prisma: fragmentos de vidro colorido flutuando ao redor, com reflexos e rotação suave. */
export function PrismaFx() {
  const id = useFxId();
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        {VIDROS.map(([claro, cor, sombra], i) => (
          <linearGradient key={i} id={`${id}-vidro-${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={claro} stopOpacity="0.95" />
            <stop offset="0.45" stopColor={cor} stopOpacity="0.8" />
            <stop offset="1" stopColor={sombra} stopOpacity="0.9" />
          </linearGradient>
        ))}

        <linearGradient id={`${id}-arco-iris`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#8b5cf6" />
          <stop offset="0.2" stopColor="#3b82f6" />
          <stop offset="0.4" stopColor="#06b6d4" />
          <stop offset="0.6" stopColor="#22c55e" />
          <stop offset="0.8" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>

        <filter id={`${id}-brilho`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1" result="blur" />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g fill="none" filter={`url(#${id}-brilho)`}>
        <circle r="51" stroke={`url(#${id}-arco-iris)`} strokeWidth="1.5" />
        <path
          d="M-44.17 -25.5 A51 51 0 0 1 -17.44 -47.92"
          stroke="#fff"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>

      <g filter={`url(#${id}-brilho)`} strokeLinejoin="round">
        {CACOS.map((c, i) => (
          <g key={i} transform={`translate(${c.posicao.join(" ")})`}>
            <g className="moldura-prisma__deriva" style={c.deriva}>
              <g className="moldura-prisma__flutua" style={c.flutua}>
                <polygon
                  points={c.pontos}
                  fill={`url(#${id}-vidro-${c.cor})`}
                  stroke={VIDROS[c.cor][0]}
                  strokeWidth="0.45"
                />
                <path
                  d={c.reflexo}
                  stroke="#fff"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  className="moldura-prisma__reflexo"
                  style={c.brilho}
                />
              </g>
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}
