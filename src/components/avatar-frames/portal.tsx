import type { CSSProperties } from "react";

import { polar, round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(71);

/** Braço de espiral logarítmica: começa largo (r 80) e se enrola até a borda do avatar (r 51). */
function braco(inicio: number, sentido: 1 | -1): string {
  const pontos = Array.from({ length: 25 }, (_, i) => {
    const t = i / 24;
    return polar(80 * Math.pow(51 / 80, t), inicio + sentido * 210 * t);
  });
  return `M${pontos.map((p) => p.join(" ")).join(" L")}`;
}

const BRACOS_CIANO = Array.from({ length: 6 }, (_, i) => braco(i * 60, 1));
const BRACOS_VIOLETA = Array.from({ length: 4 }, (_, i) => braco(i * 90 + 30, -1));

/** Faíscas sugadas em espiral: giro + raio encolhendo no mesmo keyframe. */
const FAISCAS = Array.from({ length: 10 }, (_, i) => ({
  angulo: round(i * 36 + rand() * 20),
  duracao: round(1.6 + rand() * 0.9),
  atraso: round(-rand() * 2.5),
  r: round(0.8 + rand() * 0.7),
}));

const ONDAS = [0, 1, 2];

/**
 * Portal: vórtice de energia. Dois conjuntos de braços em espiral giram em sentidos opostos,
 * faíscas são sugadas para dentro e ondas se fecham no avatar. Só transform e opacidade.
 */
export function PortalFx() {
  const id = useFxId();
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <radialGradient id={`${id}-boca`}>
          <stop offset="0.66" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="0.9" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="1" stopColor="#a5f3fc" stopOpacity="0.7" />
        </radialGradient>

        <radialGradient id={`${id}-aura`}>
          <stop offset="0.6" stopColor="#7c3aed" stopOpacity="0" />
          <stop offset="0.72" stopColor="#7c3aed" stopOpacity="0.35" />
          <stop offset="1" stopColor="#0891b2" stopOpacity="0" />
        </radialGradient>

        <filter id={`${id}-brilho`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle r="80" fill={`url(#${id}-aura)`} className="moldura-portal__aura" />

      <g fill="none" strokeLinecap="round" filter={`url(#${id}-brilho)`}>
        <g className="moldura-portal__violeta">
          {BRACOS_VIOLETA.map((d, i) => (
            <g key={i}>
              <path d={d} stroke="#a78bfa" strokeWidth="3.4" strokeOpacity="0.3" />
              <path d={d} stroke="#ddd6fe" strokeWidth="0.9" />
            </g>
          ))}
        </g>

        <g className="moldura-portal__ciano">
          {BRACOS_CIANO.map((d, i) => (
            <g key={i}>
              <path d={d} stroke="#22d3ee" strokeWidth="3" strokeOpacity="0.35" />
              <path d={d} stroke="#ecfeff" strokeWidth="0.9" />
            </g>
          ))}
        </g>
      </g>

      {ONDAS.map((o) => (
        <circle
          key={o}
          r="80"
          fill="none"
          stroke="#67e8f9"
          strokeWidth="1.2"
          className="moldura-fx__particula moldura-portal__onda"
          style={{ animationDelay: `${-o * 0.8}s` }}
        />
      ))}

      <circle r="50" fill={`url(#${id}-boca)`} className="moldura-portal__boca" />
      <circle
        r="50.6"
        fill="none"
        stroke="#cffafe"
        strokeWidth="1.2"
        filter={`url(#${id}-brilho)`}
      />

      {FAISCAS.map((f, i) => (
        <g key={i} transform={`rotate(${f.angulo})`}>
          <circle
            r={f.r}
            fill="#f0fdff"
            className="moldura-fx__particula moldura-portal__faisca"
            style={
              {
                animationDuration: `${f.duracao}s`,
                animationDelay: `${f.atraso}s`,
              } as CSSProperties
            }
          />
        </g>
      ))}
    </svg>
  );
}
