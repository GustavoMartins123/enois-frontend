import { polar, round } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

/** Duração de um ciclo inteiro: as folhas brotam de baixo para cima, a flor abre e tudo murcha. */
const CICLO = 9;

/** A vinha ondula em volta do avatar. Sem simetria: os dois lados não saem espelhados. */
function raioDaVinha(angulo: number): number {
  return 52 + 2.2 * Math.sin((angulo * 7 * Math.PI) / 180);
}

function caule(de: number, ate: number): string {
  const passos = Math.ceil(Math.abs(ate - de) / 3);
  const pontos = Array.from({ length: passos + 1 }, (_, i) => {
    const angulo = de + ((ate - de) * i) / passos;
    return polar(raioDaVinha(angulo), angulo).join(" ");
  });
  return `M${pontos.join(" L")}`;
}

/** Folha com a base na origem e a ponta para cima. */
function folha(comprimento: number): string {
  const l = comprimento;
  const w = round(l * 0.42);
  return `M0 0 C${w} ${round(-l * 0.3)} ${w} ${round(-l * 0.75)} 0 ${-l} C${-w} ${round(-l * 0.75)} ${-w} ${round(-l * 0.3)} 0 0 Z`;
}

/** Atraso negativo que faz o elemento começar o ciclo quando o crescimento chega em `fase`. */
function atraso(fase: number): number {
  return round(fase * CICLO - CICLO);
}

// As duas vinhas saem da base (180°) e sobem, uma por cada lado, até a flor no topo.
const VINHAS = [
  { de: 180, ate: 352, sentido: 1 },
  { de: 180, ate: 8, sentido: -1 },
];

const FOLHAS = VINHAS.flatMap(({ de, ate, sentido }) =>
  Array.from({ length: 10 }, (_, i) => {
    const angulo = de + sentido * (12 + i * 16);
    const [x, y] = polar(raioDaVinha(angulo), angulo);
    const paraFora = i % 2 === 0;
    const comprimento = paraFora ? 10 + (i % 3) : 6.5;
    return {
      x,
      y,
      // Para fora, a folha deita no sentido em que a vinha cresce; para dentro, fica menor
      // para não cobrir o rosto.
      giro: round(angulo + sentido * (paraFora ? 40 : 140)),
      d: folha(comprimento),
      nervura: round(-comprimento * 0.85),
      atraso: atraso(i * 0.034),
    };
  }),
);

const GAVINHAS = [140, 220, 300, 60].map((angulo) => {
  const [x, y] = polar(raioDaVinha(angulo) + 1, angulo);
  return { x, y, angulo };
});

const PETALAS = [0, 72, 144, 216, 288];

/** Trepadeira: duas vinhas sobem pelos lados, as folhas brotam em sequência e a flor abre no topo. */
export function TrepadeiraFx() {
  const id = useFxId();
  const [florX, florY] = polar(raioDaVinha(0), 0);
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <linearGradient id={`${id}-folha`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#15803d" />
          <stop offset="1" stopColor="#86efac" />
        </linearGradient>

        <radialGradient id={`${id}-petala`} cx="0.5" cy="1" r="1">
          <stop offset="0" stopColor="#be185d" />
          <stop offset="1" stopColor="#f9a8d4" />
        </radialGradient>
      </defs>

      <circle r="49.5" fill="none" stroke="#14532d" strokeWidth="1.4" strokeOpacity="0.8" />

      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {VINHAS.map((v) => (
          <g key={v.ate}>
            <path d={caule(v.de, v.ate)} stroke="#166534" strokeWidth="2.6" />
            <path d={caule(v.de, v.ate)} stroke="#4ade80" strokeWidth="0.8" strokeOpacity="0.55" />
          </g>
        ))}
        {GAVINHAS.map((g) => (
          <path
            key={g.angulo}
            d="M0 0 c2 -3 6 -3 6 0 c0 2.4 -3 2.6 -3.4 0.8"
            transform={`translate(${g.x} ${g.y}) rotate(${g.angulo})`}
            stroke="#22c55e"
            strokeWidth="0.8"
          />
        ))}
      </g>

      {FOLHAS.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.giro})`}>
          <g className="moldura-trepadeira__folha" style={{ animationDelay: `${f.atraso}s` }}>
            <path d={f.d} fill={`url(#${id}-folha)`} />
            <path d={`M0 0 L0 ${f.nervura}`} stroke="#14532d" strokeWidth="0.5" />
          </g>
        </g>
      ))}

      <g transform={`translate(${florX} ${florY})`}>
        <g className="moldura-trepadeira__flor" style={{ animationDelay: `${atraso(0.38)}s` }}>
          {PETALAS.map((giro) => (
            <ellipse
              key={giro}
              cy="-4.4"
              rx="3.3"
              ry="4.8"
              transform={`rotate(${giro})`}
              fill={`url(#${id}-petala)`}
            />
          ))}
          <circle r="2.4" fill="#facc15" />
        </g>
      </g>
    </svg>
  );
}
