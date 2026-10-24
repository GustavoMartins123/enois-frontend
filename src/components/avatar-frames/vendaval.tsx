import { polar, round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(59);

/**
 * Risco de vento a partir do topo: uma faixa em espiral (o raio cai `queda` ao longo do `arco`)
 * que afina nas duas pontas, como um traço feito a pincel.
 */
function risco(raio: number, queda: number, arco: number, espessura: number): string {
  const passos = 24;
  const fora: string[] = [];
  const dentro: string[] = [];
  for (let i = 0; i <= passos; i++) {
    const t = i / passos;
    const r = raio - queda * t;
    const meia = (espessura * Math.sin(Math.PI * t)) / 2 + 0.1;
    fora.push(polar(r + meia, arco * t).join(" "));
    dentro.unshift(polar(r - meia, arco * t).join(" "));
  }
  return `M${[...fora, ...dentro].join(" L")} Z`;
}

const RISCOS = Array.from({ length: 9 }, (_, i) => ({
  inicio: round(i * 40 + rand() * 20),
  d: risco(57 + rand() * 11, 5 + rand() * 5, 50 + rand() * 60, 1.4 + rand() * 1.6),
  cor: i % 2 === 0 ? "#f0f9ff" : "#bae6fd",
  giro: round(1.8 + rand() * 1.4),
  sopro: round(1.4 + rand() * 0.8),
  atraso: round(-rand() * 2.2),
}));

const FOLHAS = ["#f59e0b", "#84cc16", "#ea580c"].map((cor, i) => ({
  cor,
  raio: round(60 + rand() * 6),
  atraso: round(-i * 0.9 - rand() * 0.4),
}));

const POEIRA = Array.from({ length: 8 }, () => {
  const [x, y] = polar(58 + rand() * 12, rand() * 360);
  return { x, y, r: round(0.5 + rand() * 0.5) };
});

/** Vendaval: rajadas em espiral girando em volta do avatar, poeira e folhas levadas pelo vento. */
export function VendavalFx() {
  const id = useFxId();
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <radialGradient id={`${id}-ar`}>
          <stop offset="0.6" stopColor="#7dd3fc" stopOpacity="0" />
          <stop offset="0.68" stopColor="#7dd3fc" stopOpacity="0.3" />
          <stop offset="0.9" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle r="80" fill={`url(#${id}-ar)`} />
      <circle r="50" fill="none" stroke="#e0f2fe" strokeWidth="1.8" strokeOpacity="0.8" />

      {RISCOS.map((r, i) => (
        <g
          key={i}
          className="moldura-vendaval__giro"
          style={{ animationDuration: `${r.giro}s`, animationDelay: `${r.atraso}s` }}
        >
          <path
            d={r.d}
            transform={`rotate(${r.inicio})`}
            fill={r.cor}
            className="moldura-vendaval__risco"
            style={{ animationDuration: `${r.sopro}s`, animationDelay: `${r.atraso}s` }}
          />
        </g>
      ))}

      <g className="moldura-vendaval__poeira">
        {POEIRA.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill="#e0f2fe"
            className="moldura-fx__particula"
          />
        ))}
      </g>

      {FOLHAS.map((f) => (
        <g key={f.cor} className="moldura-vendaval__voo" style={{ animationDelay: `${f.atraso}s` }}>
          <g transform={`translate(0 ${-f.raio})`}>
            <path
              d="M0 -3.6 C2.4 -2.4 2.4 2 0 3.6 C-2.4 2 -2.4 -2.4 0 -3.6 Z"
              fill={f.cor}
              className="moldura-fx__particula moldura-vendaval__folha"
              style={{ animationDelay: `${f.atraso}s` }}
            />
          </g>
        </g>
      ))}
    </svg>
  );
}
