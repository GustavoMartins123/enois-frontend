import { round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(57);
const SIMBOLOS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ012345789";
const COLUNAS = Array.from({ length: 19 }, (_, i) => {
  const comprimento = 14 + Math.floor(rand() * 5);
  return {
    esquerda: round(2.5 + i * 5.28),
    codigo: Array.from(
      { length: comprimento - 1 },
      () => SIMBOLOS[Math.floor(rand() * SIMBOLOS.length)],
    ).join("\n"),
    cabeca: SIMBOLOS[Math.floor(rand() * SIMBOLOS.length)],
    duracao: round(3.6 + rand() * 3.2),
    atraso: round(-rand() * 7),
  };
});

/** Duas cópias de cada fita de código mantêm a chuva contínua, sem saltos ou pausas. */
export function MatrixFx() {
  const id = useFxId();
  return (
    <>
      <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
        <defs>
          <radialGradient id={`${id}-tela`}>
            <stop offset="0.65" stopColor="#001c0d" stopOpacity="0" />
            <stop offset="1" stopColor="#003e20" stopOpacity="0.65" />
          </radialGradient>

          <clipPath id={`${id}-rosto`}>
            <circle r="49.5" />
          </clipPath>

          <pattern id={`${id}-linhas`} width="4" height="3" patternUnits="userSpaceOnUse">
            <path d="M0 0 H4" stroke="#6bff9b" strokeWidth="0.6" />
          </pattern>

          <linearGradient id={`${id}-scan`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#4dff8b" stopOpacity="0" />
            <stop offset="0.9" stopColor="#4dff8b" stopOpacity="0.16" />
            <stop offset="1" stopColor="#d1ffe0" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        <circle r="50" fill={`url(#${id}-tela)`} />

        <g clipPath={`url(#${id}-rosto)`}>
          <circle r="50" fill={`url(#${id}-linhas)`} opacity="0.12" />
          <rect
            x="-50"
            y="-70"
            width="100"
            height="20"
            fill={`url(#${id}-scan)`}
            className="moldura-matrix__scan"
          />
        </g>
      </svg>

      <span className="moldura-matrix__chuva">
        {COLUNAS.map((c, i) => (
          <span
            key={i}
            className="moldura-matrix__coluna"
            style={{
              left: `${c.esquerda}%`,
              animationDuration: `${c.duracao}s`,
              animationDelay: `${c.atraso}s`,
            }}
          >
            {[0, 1].map((copia) => (
              <span key={copia} className="moldura-matrix__fita">
                <span className="moldura-matrix__codigo">{c.codigo}</span>

                <span className="moldura-matrix__cabeca">{c.cabeca}</span>
              </span>
            ))}
          </span>
        ))}
      </span>

      <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
        <defs>
          <filter id={`${id}-brilho`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g fill="none" filter={`url(#${id}-brilho)`}>
          <circle r="50.5" stroke="#30e879" strokeWidth="1.4" />
          <circle
            r="51.3"
            stroke="#d2ffe1"
            strokeWidth="0.65"
            strokeDasharray="26 40 8 86"
            className="moldura-matrix__anel"
          />
        </g>
      </svg>
    </>
  );
}
