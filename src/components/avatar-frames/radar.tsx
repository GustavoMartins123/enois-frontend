import { polar, round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(97);

const VARREDURA = 4;
const DENTRO = 47.5;
const FORA = 61;

/** Setor de anel entre `de` e `ate` graus (0° no topo, sentido horário), dentro da tela do radar. */
function setor(de: number, ate: number): string {
  const [x1, y1] = polar(FORA, de);
  const [x2, y2] = polar(FORA, ate);
  const [x3, y3] = polar(DENTRO, ate);
  const [x4, y4] = polar(DENTRO, de);
  return `M${x1} ${y1} A${FORA} ${FORA} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${DENTRO} ${DENTRO} 0 0 0 ${x4} ${y4} Z`;
}

/** Círculo como subcaminho de path, para montar a tela em anel. */
function circulo(r: number): string {
  return `M0 ${-r} A${r} ${r} 0 1 1 0 ${r} A${r} ${r} 0 1 1 0 ${-r} Z`;
}

// O rastro do feixe: fatias que vão apagando para trás da borda que lidera (no topo), já que o
// SVG não tem gradiente cônico.
const RASTRO = Array.from({ length: 9 }, (_, i) => ({
  d: setor(-(i + 1) * 6, -i * 6),
  opacidade: round(0.42 * (1 - i / 9) ** 1.6),
}));

const MARCAS = Array.from({ length: 36 }, (_, i) => {
  const angulo = i * 10;
  const longa = angulo % 30 === 0;
  const [x1, y1] = polar(FORA, angulo);
  const [x2, y2] = polar(FORA + (longa ? 3.5 : 2), angulo);
  return { x1, y1, x2, y2, longa };
});

/**
 * Contatos: cada um acende quando o feixe passa por cima dele (o atraso é o ângulo dele na
 * volta) e vai apagando devagar, como o fósforo da tela. Os de fora da tela são alvos distantes.
 */
const CONTATOS = Array.from({ length: 9 }, (_, i) => {
  const angulo = round(i * 40 + rand() * 30);
  const longe = i % 3 === 2;
  const [x, y] = polar(longe ? 66 + rand() * 6 : 50.5 + rand() * 8, angulo);
  return {
    x,
    y,
    r: round(longe ? 1.1 : 1.4 + rand() * 0.6),
    atraso: round((angulo / 360) * VARREDURA - VARREDURA),
  };
});

// Um alvo que se move: a cada volta do feixe ele aparece um pouco adiante, deixando a trilha.
// Cada ponto acende uma vez a cada cinco voltas (moldura-radar__trilha dura 5 × VARREDURA), na
// volta dele.
const TRILHA = Array.from({ length: 5 }, (_, i) => {
  const angulo = 228 + i * 5;
  const [x, y] = polar(54 - i * 0.6, angulo);
  return { x, y, atraso: round((angulo / 360) * VARREDURA - VARREDURA * (5 - i)), i };
});

/** Cantos da mira que trava no alvo, centrados na origem. */
const MIRA = "M-5 -2.4 V-5 H-2.4 M2.4 -5 H5 V-2.4 M5 2.4 V5 H2.4 M-2.4 5 H-5 V2.4";

/**
 * Radar: a tela verde de fósforo em volta do avatar. O feixe gira, os contatos acendem quando ele
 * passa e apagam devagar, um alvo avança deixando trilha (a mira trava nele a cada passada) e
 * um pulso sai da tela a cada volta.
 */
export function RadarFx() {
  const id = useFxId();
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <radialGradient id={`${id}-contato`}>
          <stop offset="0" stopColor="#f0fdf4" />
          <stop offset="0.3" stopColor="#4ade80" stopOpacity="0.9" />
          <stop offset="1" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path
        d={`${circulo(FORA)} ${circulo(DENTRO)}`}
        fillRule="evenodd"
        fill="#052e16"
        fillOpacity="0.92"
      />

      <g fill="none" stroke="#22c55e">
        <circle r="54.2" strokeOpacity="0.25" strokeWidth="0.5" strokeDasharray="1 2.5" />
        <circle r={FORA} strokeOpacity="0.8" strokeWidth="0.9" />
        <circle r={DENTRO} strokeOpacity="0.6" strokeWidth="0.7" />
        {MARCAS.map((m, i) => (
          <line
            key={i}
            x1={m.x1}
            y1={m.y1}
            x2={m.x2}
            y2={m.y2}
            strokeWidth={m.longa ? 1 : 0.6}
            strokeOpacity={m.longa ? 0.9 : 0.5}
          />
        ))}
      </g>

      <path d="M0 -66.5 L-2.4 -70.5 L2.4 -70.5 Z" fill="#86efac" />
      <circle
        r={FORA}
        fill="none"
        stroke="#4ade80"
        strokeWidth="0.8"
        className="moldura-fx__particula moldura-radar__pulso"
      />

      <g className="moldura-radar__feixe">
        {RASTRO.map((r, i) => (
          <path key={i} d={r.d} fill="#4ade80" fillOpacity={r.opacidade} />
        ))}
        <line x1="0" y1={-DENTRO} x2="0" y2={-FORA} stroke="#bbf7d0" strokeWidth="1.1" />
      </g>

      {CONTATOS.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r={c.r * 2.4}
          fill={`url(#${id}-contato)`}
          className="moldura-radar__contato"
          style={{ animationDelay: `${c.atraso}s` }}
        />
      ))}
      {TRILHA.map((t) => (
        <circle
          key={t.i}
          cx={t.x}
          cy={t.y}
          r="3.6"
          fill={`url(#${id}-contato)`}
          className="moldura-radar__trilha"
          style={{ animationDelay: `${t.atraso}s` }}
        />
      ))}
      {TRILHA.map((t) => (
        <g key={t.i} transform={`translate(${t.x} ${t.y})`}>
          <path
            d={MIRA}
            fill="none"
            stroke="#bbf7d0"
            strokeWidth="0.8"
            className="moldura-fx__particula moldura-radar__mira"
            style={{ animationDelay: `${t.atraso}s` }}
          />
        </g>
      ))}
    </svg>
  );
}
