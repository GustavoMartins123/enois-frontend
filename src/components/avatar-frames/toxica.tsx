import { polar, round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(31);

const CAROCOS = Array.from({ length: 12 }, (_, i) => ({
  angulo: round(i * 30 + (rand() - 0.5) * 12),
  r: round(3.2 + rand() * 1.8),
  duracao: round(1.6 + rand()),
  atraso: round(-rand() * 2.6),
}));

const GOTAS = [
  { angulo: 152, duracao: 2.4 },
  { angulo: 183, duracao: 3.1 },
  { angulo: 213, duracao: 2.7 },
].map((g) => ({ ...g, posicao: polar(51, g.angulo), atraso: round(-rand() * g.duracao) }));

const BOLHAS = Array.from({ length: 7 }, () => {
  const [x, y] = polar(53 + rand() * 6, (rand() - 0.5) * 200);
  return {
    x,
    y,
    r: round(1.2 + rand() * 1.4),
    duracao: round(1.6 + rand() * 1.2),
    atraso: round(-rand() * 2.8),
  };
});

/**
 * Tóxica: gosma radioativa. Os caroços e as gotas passam por um filtro "goo" (desfoque +
 * corte do alfa), então se fundem como líquido: a gota estica, faz pescoço e se solta.
 */
export function ToxicaFx() {
  const id = useFxId();
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <filter id={`${id}-gosma`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
            result="gosma"
          />
          <feGaussianBlur in="gosma" stdDeviation="2.5" result="brilho" />

          <feMerge>
            <feMergeNode in="brilho" />
            <feMergeNode in="gosma" />
          </feMerge>
        </filter>

        <radialGradient id={`${id}-aura`}>
          <stop offset="0.6" stopColor="#84cc16" stopOpacity="0" />
          <stop offset="0.68" stopColor="#84cc16" stopOpacity="0.45" />
          <stop offset="0.95" stopColor="#84cc16" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${id}-vinheta`}>
          <stop offset="0.8" stopColor="#4d7c0f" stopOpacity="0" />
          <stop offset="1" stopColor="#4d7c0f" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      <circle r="80" fill={`url(#${id}-aura)`} className="moldura-toxica__aura" />
      <circle r="50" fill={`url(#${id}-vinheta)`} />

      <g filter={`url(#${id}-gosma)`} fill="#84cc16">
        <circle r="50.5" fill="none" stroke="#84cc16" strokeWidth="4.5" />

        <g className="moldura-toxica__carocos">
          {CAROCOS.map((c, i) => (
            <g key={i} transform={`rotate(${c.angulo}) translate(0 -50.5)`}>
              <circle
                r={c.r}
                className="moldura-toxica__caroco"
                style={{ animationDuration: `${c.duracao}s`, animationDelay: `${c.atraso}s` }}
              />
            </g>
          ))}
        </g>
        {GOTAS.map((g) => (
          <g key={g.angulo} transform={`translate(${g.posicao[0]} ${g.posicao[1]})`}>
            <circle
              r="3.2"
              className="moldura-fx__particula moldura-toxica__gota"
              style={{ animationDuration: `${g.duracao}s`, animationDelay: `${g.atraso}s` }}
            />
          </g>
        ))}
      </g>

      <circle r="49" fill="none" stroke="#ecfccb" strokeWidth="0.7" strokeOpacity="0.7" />
      {BOLHAS.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y})`}>
          <circle
            r={b.r}
            fill="#bef264"
            fillOpacity="0.25"
            stroke="#d9f99d"
            strokeWidth="0.6"
            className="moldura-fx__particula moldura-toxica__bolha"
            style={{ animationDuration: `${b.duracao}s`, animationDelay: `${b.atraso}s` }}
          />
        </g>
      ))}
    </svg>
  );
}
