import type { CSSProperties } from "react";

import { polar, round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(73);

// Trilhas que saem do anel: um trecho reto para fora e uma dobra de 45° até o terminal. O pulso
// corre pelo trecho reto e acende o terminal quando chega. Nenhuma sai do topo, onde fica o chip.
const TRILHAS = Array.from({ length: 10 }, (_, i) => {
  const reto = round(5 + rand() * 6);
  const dobra = rand() > 0.5 ? 1 : -1;
  const diagonal = round(4 + rand() * 4);
  // Em algumas trilhas, um componente SMD no meio da dobra, deitado na direção dela.
  const componente =
    i % 3 === 2
      ? null
      : {
          x: round((dobra * diagonal) / 2),
          y: round(-53 - reto - diagonal / 2),
          giro: dobra === 1 ? -45 : -135,
          corpo: i % 3 === 0 ? "#1c1917" : "#a16207",
        };
  return {
    componente,
    angulo: round(18 + i * 36 + (rand() - 0.5) * 10),
    d: `M0 -53 L0 ${-53 - reto} L${dobra * diagonal} ${round(-53 - reto - diagonal)}`,
    reto,
    pad: [dobra * diagonal, round(-53 - reto - diagonal)] as const,
    duracao: round(1.8 + rand() * 1.2),
    atraso: round(-rand() * 3),
  };
});

const PINOS = [-3.2, 0, 3.2];

/** Arco de raio `r` entre `de` e `ate` graus (0° no topo, sentido horário). */
function arco(r: number, de: number, ate: number): string {
  const [x1, y1] = polar(r, de);
  const [x2, y2] = polar(r, ate);
  return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`;
}

// O soquete: pinos curtos em volta da foto, como se o avatar fosse um chip encaixado na placa.
// Fixos, então vão todos num path só.
const SOQUETE = Array.from({ length: 60 }, (_, i) => {
  const [x1, y1] = polar(48.6, i * 6 + 3);
  const [x2, y2] = polar(50.4, i * 6 + 3);
  return `M${x1} ${y1} L${x2} ${y2}`;
}).join("");

const VIAS = Array.from({ length: 12 }, () => {
  const [x, y] = polar(60 + rand() * 12, rand() * 360);
  return `M${round(x - 0.9)} ${y} a0.9 0.9 0 1 0 1.8 0 a0.9 0.9 0 1 0 -1.8 0`;
}).join("");

const PACOTES = [0, 120, 240].map((angulo) => arco(57.5, angulo, angulo + 4)).join("");

/**
 * Circuito: o anel vira uma placa e o avatar, um chip encaixado no soquete. A energia corre pelo
 * anel, pulsos de luz descem as trilhas (com resistores e capacitores) e acendem os terminais,
 * pacotes de dados correm no anel de fora e o chip no topo pisca o LED.
 */
export function CircuitoFx() {
  const id = useFxId();
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <radialGradient id={`${id}-brilho`}>
          <stop offset="0" stopColor="#ccfbf1" />
          <stop offset="0.35" stopColor="#5eead4" stopOpacity="0.8" />
          <stop offset="1" stopColor="#14b8a6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d={VIAS} fill="none" stroke="#14b8a6" strokeOpacity="0.7" strokeWidth="0.5" />
      <circle r="52" fill="none" stroke="#134e4a" strokeWidth="3.6" />
      <circle r="52" fill="none" stroke="#2dd4bf" strokeWidth="0.8" />
      <path d={SOQUETE} stroke="#5eead4" strokeOpacity="0.75" strokeWidth="0.7" />

      <g className="moldura-circuito__energia" fill="none" strokeLinecap="round">
        <path d={arco(52, 0, 42)} stroke="#5eead4" strokeOpacity="0.25" strokeWidth="3.4" />
        <path d={arco(52, 12, 42)} stroke="#ccfbf1" strokeWidth="1.3" />
      </g>

      <circle
        r="57.5"
        fill="none"
        stroke="#5eead4"
        strokeOpacity="0.55"
        strokeWidth="1"
        strokeDasharray="1.5 4 6 4"
        className="moldura-circuito__dados"
      />
      <path
        d={PACOTES}
        fill="none"
        stroke="#ccfbf1"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="moldura-circuito__pacotes"
      />

      {TRILHAS.map((t, i) => (
        <g key={i} transform={`rotate(${t.angulo})`}>
          <path d={t.d} fill="none" stroke="#14b8a6" strokeWidth="1" strokeLinejoin="round" />
          {t.componente && (
            <g
              transform={`translate(${t.componente.x} ${t.componente.y}) rotate(${t.componente.giro})`}
            >
              <rect x="-2" y="-0.9" width="4" height="1.8" rx="0.2" fill={t.componente.corpo} />
              <rect x="-2.2" y="-0.9" width="0.9" height="1.8" fill="#cbd5e1" />
              <rect x="1.3" y="-0.9" width="0.9" height="1.8" fill="#cbd5e1" />
            </g>
          )}
          <circle
            cx={t.pad[0]}
            cy={t.pad[1]}
            r="1.7"
            fill="#042f2e"
            stroke="#5eead4"
            strokeWidth="0.7"
          />
          <circle
            cx={t.pad[0]}
            cy={t.pad[1]}
            r="4"
            fill={`url(#${id}-brilho)`}
            className="moldura-circuito__terminal"
            style={{ animationDuration: `${t.duracao}s`, animationDelay: `${t.atraso}s` }}
          />

          <g transform="translate(0 -53)">
            <circle
              r="2.4"
              fill={`url(#${id}-brilho)`}
              className="moldura-circuito__pulso"
              style={
                {
                  "--percurso": `${-t.reto}px`,
                  animationDuration: `${t.duracao}s`,
                  animationDelay: `${t.atraso}s`,
                } as CSSProperties
              }
            />
          </g>
        </g>
      ))}

      <g transform="translate(0 -66)">
        <g stroke="#14b8a6" strokeWidth="0.8">
          {PINOS.map((y) => (
            <g key={y}>
              <line x1="-9.5" x2="-7" y1={y} y2={y} />
              <line x1="7" x2="9.5" y1={y} y2={y} />
            </g>
          ))}
          <line x1="-3" x2="-3" y1="5" y2="13" />
          <line x1="3" x2="3" y1="5" y2="13" />
        </g>

        <rect
          x="-7"
          y="-5"
          width="14"
          height="10"
          rx="1"
          fill="#042f2e"
          stroke="#2dd4bf"
          strokeWidth="0.7"
        />
        <rect x="-4.5" y="-2.2" width="5" height="1" fill="#2dd4bf" fillOpacity="0.6" />
        <rect x="-4.5" y="0.4" width="3" height="1" fill="#2dd4bf" fillOpacity="0.6" />
        <circle cx="4" r="3" fill={`url(#${id}-brilho)`} className="moldura-circuito__led" />
        <circle cx="4" r="0.9" fill="#ccfbf1" />
      </g>
    </svg>
  );
}
