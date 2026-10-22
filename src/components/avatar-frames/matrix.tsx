import { round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(57);
const SIMBOLOS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789Z";

/**
 * Colunas de código caindo: os caracteres são fixos e a coluna inteira desce, com a cabeça
 * acesa embaixo e o rastro apagando para cima. A coluna nasce toda acima do efeito e some toda
 * abaixo dele, então o laço não tem emenda.
 */
const COLUNAS = Array.from({ length: 13 }, (_, i) => ({
  // Posição em % da largura do efeito (o viewBox vai de -80 a 80).
  esquerda: round(((-78 + i * 13 + rand() * 3 + 80) / 160) * 100),
  caracteres: Array.from({ length: 12 }, () => SIMBOLOS[Math.floor(rand() * SIMBOLOS.length)]),
  duracao: round(2.2 + rand() * 1.8),
  atraso: round(-rand() * 4),
}));

/**
 * Matrix: chuva de código num anel em volta do avatar. A chuva é HTML, não SVG: texto se
 * mexendo dentro do SVG obriga a redesenhar os glifos todo quadro (benchmark: ~500 ms/s com
 * 25 avatares), e em HTML cada coluna é uma camada que o compositor só desloca.
 */
export function MatrixFx() {
  const id = useFxId();
  return (
    <>
      <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
        <defs>
          <radialGradient id={`${id}-anel`}>
            <stop offset="0.64" stopColor="#000" />
            <stop offset="0.68" stopColor="#fff" />
            <stop offset="0.88" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>

          <mask
            id={`${id}-mascara`}
            maskUnits="userSpaceOnUse"
            x="-80"
            y="-80"
            width="160"
            height="160"
          >
            <circle r="80" fill={`url(#${id}-anel)`} />
          </mask>

          <radialGradient id={`${id}-tela`}>
            <stop offset="0.78" stopColor="#052e16" stopOpacity="0" />
            <stop offset="1" stopColor="#052e16" stopOpacity="0.6" />
          </radialGradient>
        </defs>

        <circle r="80" fill="#022c22" opacity="0.22" mask={`url(#${id}-mascara)`} />
        <circle r="50" fill={`url(#${id}-tela)`} />
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
            {c.caracteres.map((ch, j) => (
              <span
                key={j}
                className={j === c.caracteres.length - 1 ? "moldura-matrix__cabeca" : undefined}
                style={{ opacity: round(0.15 + (0.85 * (j + 1)) / c.caracteres.length) }}
              >
                {ch}
              </span>
            ))}
          </span>
        ))}
      </span>

      <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
        <defs>
          <filter id={`${id}-brilho`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.1" result="blur" />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          r="50.6"
          fill="none"
          stroke="#4ade80"
          strokeWidth="1.4"
          filter={`url(#${id}-brilho)`}
          className="moldura-matrix__anel"
        />
      </svg>
    </>
  );
}
