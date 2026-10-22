import { round } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const RAIO = 60;
const VOLTA = 8;
const DEFASAGEM_GRAUS = 7.5;
const ONDA = 1.6;

/**
 * O corpo: cada escama é o mesmo dragão um pouco atrás no tempo (gira com atraso), então o
 * corpo segue a cabeça pela órbita; a onda radial corre da cabeça para a cauda.
 */
const CORPO = Array.from({ length: 22 }, (_, k) => {
  const escala = round(1 - (k / 21) * 0.62);
  return {
    k,
    escala,
    atraso: round(((k * DEFASAGEM_GRAUS) / 360) * VOLTA - VOLTA),
    atrasoOnda: round(-k * 0.12),
  };
}).reverse();

/** Cabeça olhando no sentido do giro (+x no topo da órbita), com chifres, olho e boca. */
const CABECA =
  "M-7 -4 C-3 -7.5 4 -7 8 -4.5 L13 -3.2 C14.6 -2.6 14.6 -0.8 13 -0.4 L9 0.6 L12.5 2.2 C11 3.8 7.5 4.2 4.5 3.4 C1 5 -4 5 -7 4 Z";
const CHIFRE = "M-3.5 -5.5 C-7 -10 -11 -11.5 -14 -11 C-10.5 -9.5 -8.5 -7.5 -6.5 -4.6 Z";

/**
 * Dragão: um dragão oriental vermelho e dourado dá a volta no avatar perseguindo uma pérola.
 * Tudo é transform (giro, onda, balanço dos bigodes) e opacidade: o compositor anima sem
 * repintar o SVG a cada quadro.
 */
export function DragaoFx() {
  const id = useFxId();
  // O transform estático é a posição no instante zero: sem animação (movimento reduzido) o
  // dragão fica parado inteiro em volta do avatar, em vez de todas as escamas num ponto só.
  const giro = (atraso: number) => ({
    className: "moldura-dragao__giro",
    transform: `rotate(${round(((-atraso % VOLTA) / VOLTA) * 360)})`,
    style: { animationDuration: `${VOLTA}s`, animationDelay: `${atraso}s` },
  });

  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <linearGradient id={`${id}-escama`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7f1d1d" />
          <stop offset="0.45" stopColor="#dc2626" />
          <stop offset="0.8" stopColor="#f97316" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>

        <radialGradient id={`${id}-perola`}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#bae6fd" />
          <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>

        <filter id={`${id}-sombra`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="0.8"
            stdDeviation="0.9"
            floodColor="#450a0a"
            floodOpacity="0.6"
          />
        </filter>
      </defs>

      {/* A pérola vai um pouco à frente da cabeça. */}
      <g {...giro(round((-18 / 360) * VOLTA - VOLTA))}>
        <g transform={`translate(0 ${-RAIO})`}>
          <circle r="7" fill={`url(#${id}-perola)`} className="moldura-dragao__perola" />
          <circle r="2.2" fill="#ffffff" />
        </g>
      </g>

      <g filter={`url(#${id}-sombra)`}>
        {CORPO.map(({ k, escala, atraso, atrasoOnda }) => (
          <g key={k} {...giro(atraso)}>
            <g transform={`translate(0 ${-RAIO})`}>
              <g
                className="moldura-dragao__onda"
                style={{ animationDuration: `${ONDA}s`, animationDelay: `${atrasoOnda}s` }}
              >
                {k === 0 ? (
                  <g>
                    <path d={CHIFRE} fill="#fbbf24" stroke="#92400e" strokeWidth="0.5" />
                    <path
                      d={CHIFRE}
                      transform="translate(1.5 9) scale(1 -1)"
                      fill="#f59e0b"
                      stroke="#92400e"
                      strokeWidth="0.5"
                    />
                    <path
                      d={CABECA}
                      fill={`url(#${id}-escama)`}
                      stroke="#450a0a"
                      strokeWidth="0.6"
                    />
                    <path d="M4 -1.8 L11 -1.2" stroke="#450a0a" strokeWidth="0.5" />
                    <circle cx="5.5" cy="-3.6" r="1.3" fill="#fde047" />
                    <circle cx="5.8" cy="-3.6" r="0.6" fill="#111827" />

                    <g className="moldura-dragao__bigode">
                      <path
                        d="M12.5 -1.5 C9 -6 3 -9 -6 -10.5"
                        fill="none"
                        stroke="#fde68a"
                        strokeWidth="0.7"
                        strokeLinecap="round"
                      />
                      <path
                        d="M11.5 1.5 C8 6 2 8.5 -7 9.5"
                        fill="none"
                        stroke="#fde68a"
                        strokeWidth="0.7"
                        strokeLinecap="round"
                      />
                    </g>
                  </g>
                ) : (
                  <g transform={`scale(${escala})`}>
                    <path
                      d="M-2.5 -4.6 L0 -8.6 L2.5 -4.6 Z"
                      fill="#f59e0b"
                      stroke="#92400e"
                      strokeWidth="0.4"
                    />
                    <ellipse
                      rx="4.4"
                      ry="5.2"
                      fill={`url(#${id}-escama)`}
                      stroke="#450a0a"
                      strokeWidth="0.5"
                    />
                    <path d="M-3 -1 Q0 1.6 3 -1" fill="none" stroke="#fca5a5" strokeWidth="0.5" />
                    <ellipse cy="3.2" rx="2.6" ry="1.4" fill="#fde68a" opacity="0.85" />
                  </g>
                )}
              </g>
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}
