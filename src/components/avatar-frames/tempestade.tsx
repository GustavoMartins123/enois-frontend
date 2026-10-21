import { polar, round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(7);

/** Um arco elétrico que corre rente à borda, com galhos que escapam para fora. */
function raio(_: unknown, n: number): string {
  // Espalhados pela volta toda, em zigue-zague (alterna para dentro e para fora da borda).
  const inicio = n * 30 + rand() * 20;
  const abertura = 45 + rand() * 60;
  const passos = Math.round(abertura / 8);
  const pontos = Array.from({ length: passos + 1 }, (_, i) =>
    polar(50 + (i % 2) * 5 + rand() * 4, inicio + (abertura * i) / passos + (rand() - 0.5) * 4),
  );
  let d = `M${pontos.map((p) => p.join(" ")).join(" L")}`;
  const galhos = 1 + Math.floor(rand() * 2);
  for (let g = 0; g < galhos; g++) {
    const i = 1 + Math.floor(rand() * (passos - 1));
    let raioAtual = 54;
    let angulo = inicio + (abertura * i) / passos;
    d += ` M${pontos[i].join(" ")}`;
    for (let s = 0; s < 3; s++) {
      raioAtual += 4 + rand() * 4;
      angulo += (rand() - 0.5) * 14;
      d += ` L${polar(raioAtual, angulo).join(" ")}`;
    }
  }
  return d;
}

const RAIOS = Array.from({ length: 12 }, raio);
const DURACOES = RAIOS.map((_, i) => round(0.9 + (i % 3) * 0.27));
// Fases pela razão áurea: raios vizinhos quase nunca acendem juntos e o clarão corre a volta toda.
const ATRASOS = DURACOES.map((d, i) => round(-((i * 0.618) % 1) * d));

/** Tempestade: raios que estalam em volta do avatar, com relâmpago de tempos em tempos. */
export function TempestadeFx() {
  const id = useFxId();
  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <filter id={`${id}-brilho`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id={`${id}-aura`}>
          <stop offset="0.6" stopColor="#38bdf8" stopOpacity="0" />
          <stop offset="0.66" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="0.92" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle r="80" fill={`url(#${id}-aura)`} className="moldura-tempestade__aura" />
      <circle
        r="50.5"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="2"
        filter={`url(#${id}-brilho)`}
        className="moldura-tempestade__anel"
      />

      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${id}-brilho)`}
        className="moldura-tempestade__raios"
      >
        {RAIOS.map((d, i) => (
          <g
            key={i}
            className="moldura-tempestade__raio"
            style={{ animationDuration: `${DURACOES[i]}s`, animationDelay: `${ATRASOS[i]}s` }}
          >
            <path d={d} stroke="#38bdf8" strokeWidth="3.2" strokeOpacity="0.55" />
            <path d={d} stroke="#f0f9ff" strokeWidth="1.1" />
          </g>
        ))}
      </g>
    </svg>
  );
}
