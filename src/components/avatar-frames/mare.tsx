import type { CSSProperties } from "react";

import { polar, round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(41);

/**
 * Superfície ondulada em `nivel`, de uma ponta a outra do tubo e um período a mais: deslizar a
 * camada exatamente um `periodo` (só transform) emenda a onda sem salto.
 */
function superficie(nivel: number, amplitude: number, periodo: number): string {
  const pontos: string[] = [];
  for (let x = -100; x <= 100 + periodo; x += periodo / 8) {
    pontos.push(`${round(x)} ${round(nivel + amplitude * Math.sin((x / periodo) * 2 * Math.PI))}`);
  }
  return `M${pontos.join(" L")}`;
}

function agua(borda: string, periodo: number): string {
  return `${borda} L${100 + periodo} 100 L-100 100 Z`;
}

const ONDA_DE_TRAS = { d: agua(superficie(19, 2.2, 20), 20), periodo: 20 };
// A espuma é só a borda de cima da onda da frente.
const ESPUMA = superficie(23, 2.6, 26);
const ONDA_DA_FRENTE = { d: agua(ESPUMA, 26), periodo: 26 };

const BOLHAS = Array.from({ length: 7 }, () => {
  const [x, y] = polar(50 + rand() * 9, 140 + rand() * 80);
  return {
    x,
    y,
    r: round(0.7 + rand() * 0.9),
    duracao: round(2 + rand() * 1.6),
    atraso: round(-rand() * 3.6),
  };
});

/**
 * Maré: o anel é um tubo de vidro com água. A maré enche e vaza, a água balança, a superfície
 * corre em duas camadas, bolhas sobem e um peixe nada de um lado para o outro no fundo.
 */
export function MareFx() {
  const id = useFxId();
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <clipPath id={`${id}-tubo`}>
          <path
            clipRule="evenodd"
            d="M0 -60.5 A60.5 60.5 0 1 1 0 60.5 A60.5 60.5 0 1 1 0 -60.5 Z M0 -47.5 A47.5 47.5 0 1 0 0 47.5 A47.5 47.5 0 1 0 0 -47.5 Z"
          />
        </clipPath>

        <linearGradient id={`${id}-funda`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.2" stopColor="#38bdf8" />
          <stop offset="0.75" stopColor="#0369a1" />
        </linearGradient>

        <radialGradient id={`${id}-aura`}>
          <stop offset="0.68" stopColor="#38bdf8" stopOpacity="0" />
          <stop offset="0.76" stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="0.95" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle r="80" fill={`url(#${id}-aura)`} />
      <circle r="54" fill="none" stroke="#e0f2fe" strokeOpacity="0.1" strokeWidth="13" />

      <g clipPath={`url(#${id}-tubo)`}>
        <g className="moldura-mare__nivel">
          <g className="moldura-mare__balanco">
            <path
              d={ONDA_DE_TRAS.d}
              fill="#1d4ed8"
              className="moldura-mare__tras"
              style={{ "--periodo": `${ONDA_DE_TRAS.periodo}px` } as CSSProperties}
            />

            <g
              className="moldura-mare__frente"
              style={{ "--periodo": `${-ONDA_DA_FRENTE.periodo}px` } as CSSProperties}
            >
              <path d={ONDA_DA_FRENTE.d} fill={`url(#${id}-funda)`} />
              <path
                d={ESPUMA}
                fill="none"
                stroke="#f0f9ff"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>

        {BOLHAS.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y})`}>
            <circle
              r={b.r}
              fill="#e0f2fe"
              fillOpacity="0.3"
              stroke="#f0f9ff"
              strokeWidth="0.45"
              className="moldura-fx__particula moldura-mare__bolha"
              style={{ animationDuration: `${b.duracao}s`, animationDelay: `${b.atraso}s` }}
            />
          </g>
        ))}

        <g className="moldura-mare__nado">
          <g transform="translate(0 54)">
            <g className="moldura-mare__peixe">
              <path d="M-4.5 0 L-8 -2.8 L-7 0 L-8 2.8 Z" fill="#f97316" />
              <path d="M5 0 C3 -3.4 -3 -3.4 -4.8 0 C-3 3.4 3 3.4 5 0 Z" fill="#fb923c" />
              <path d="M1.2 -2.6 C0.4 -1 0.4 1 1.2 2.6" stroke="#fff7ed" strokeWidth="0.9" />
              <circle cx="3" cy="-0.6" r="0.55" fill="#0f172a" />
            </g>
          </g>
        </g>
      </g>

      <g fill="none" strokeWidth="0.8">
        <circle r="60.5" stroke="#bae6fd" strokeOpacity="0.75" />
        <circle r="47.5" stroke="#e0f2fe" strokeOpacity="0.6" />
      </g>

      <path
        d="M-44 -31 A54 54 0 0 1 -21 -50"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
