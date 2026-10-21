import type { CSSProperties } from "react";

import { polar, round, seededRandom } from "@/lib/avatar-frames";

import { useFxId } from "./use-fx-id";

const rand = seededRandom(43);
const INCLINACAO = -10;

/** Estrias de matéria (traços longos, falhas curtas): o tracejado correndo é o disco girando. */
function tracejado() {
  const partes = Array.from({ length: 6 }, (_, i) =>
    round(i % 2 ? 0.8 + rand() * 2.2 : 10 + rand() * 24),
  );
  const periodo = round(partes.reduce((a, b) => a + b, 0));
  return { dasharray: partes.join(" "), periodo };
}

/** O disco de acreção quase de lado: elipses achatadas, o de dentro gira mais rápido. */
const DISCO = Array.from({ length: 12 }, (_, i) => {
  const rx = 55 + i * 2.3;
  return {
    rx,
    ry: round(rx * 0.13),
    largura: round(1.5 - i * 0.06),
    duracao: round(1.1 + i * 0.32),
    ...tracejado(),
  };
});

/** A imagem do fundo do disco que a gravidade curva por cima do buraco (mais grossa no topo). */
const ARCO_DE_CIMA = [53, 55, 57, 59, 61].map((r) => ({
  d: `M${-r} 0 A${r} ${round(r + (r - 52) * 0.45)} 0 0 1 ${r} 0`,
  duracao: round(1.3 + (r - 53) * 0.25),
  ...tracejado(),
}));

/** E a imagem secundária, fina, por baixo. */
const ARCO_DE_BAIXO = [52, 53.6, 55.2].map((r) => ({
  d: `M${-r} 0 A${r} ${round(r * 0.96)} 0 0 0 ${r} 0`,
  duracao: round(1.6 + (r - 52) * 0.3),
  ...tracejado(),
}));

const ESTRELAS = Array.from({ length: 16 }, () => {
  const [x, y] = polar(60 + rand() * 20, rand() * 360);
  return { x, y, r: round(0.3 + rand() * 0.5), atraso: round(-rand() * 3) };
});

const VOLTA_DO_BRILHO = 2.4;

/** As faixas de corpo (preenchidas) por baixo das estrias. */
const CORPO_DO_DISCO =
  "M-82 0 A82 11 0 1 0 82 0 A82 11 0 1 0 -82 0 Z M-54 0 A54 6 0 1 0 54 0 A54 6 0 1 0 -54 0 Z";
const CORPO_DE_CIMA = "M-51.5 0 A51.5 51.5 0 0 1 51.5 0 L62 0 A62 68 0 0 0 -62 0 Z";
const CORPO_DE_BAIXO = "M-51.5 0 A51.5 51.5 0 0 0 51.5 0 L55 0 A55 54 0 0 1 -55 0 Z";

/**
 * Buraco negro (à la Gargantua): a sombra escura engole as bordas do retrato, cercada pelo
 * anel de fótons; o disco de acreção passa quase de lado na frente, e a parte de trás dele
 * aparece curvada por cima e por baixo (lente gravitacional). O lado direito do disco vem na
 * direção de quem olha e brilha mais (Doppler); dois pontos quentes dão a volta.
 */
export function BuracoNegroFx() {
  const id = useFxId();
  const faixa = (
    lista: { dasharray: string; periodo: number; duracao: number }[],
    sentido: 1 | -1,
    render: (i: number, props: object) => React.JSX.Element,
  ) =>
    lista.map((f, i) =>
      render(i, {
        stroke: `url(#${id}-doppler)`,
        strokeDasharray: f.dasharray,
        className: "moldura-buraco-negro__materia",
        style: {
          "--periodo": `${-sentido * f.periodo}px`,
          animationDuration: `${f.duracao}s`,
        } as CSSProperties,
      }),
    );

  return (
    <svg viewBox="-80 -80 160 160" className="moldura-fx__svg">
      <defs>
        <linearGradient
          id={`${id}-doppler`}
          gradientUnits="userSpaceOnUse"
          x1="-80"
          y1="0"
          x2="80"
          y2="0"
        >
          <stop offset="0" stopColor="#ff5a1f" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#ffb347" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff8e7" />
        </linearGradient>

        <radialGradient id={`${id}-sombra`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.3" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0.88" />
          <stop offset="0.9" stopColor="#000" />
        </radialGradient>

        <radialGradient id={`${id}-halo`}>
          <stop offset="0.62" stopColor="#ff9a3c" stopOpacity="0" />
          <stop offset="0.7" stopColor="#ff9a3c" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`${id}-lente`} gradientUnits="userSpaceOnUse" cx="0" cy="0" r="68">
          <stop offset="0.76" stopColor="#fff3d6" />
          <stop offset="0.86" stopColor="#ffb347" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
        </radialGradient>

        <filter id={`${id}-nevoa`} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={`${id}-brilho`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* A metade de trás do disco some atrás da sombra (só fora dela é que aparece). */}
        <mask
          id={`${id}-atras`}
          maskUnits="userSpaceOnUse"
          x="-90"
          y="-90"
          width="180"
          height="180"
        >
          <rect x="-90" y="-90" width="180" height="180" fill="#fff" />
          <path d="M-51 0 A51 51 0 0 1 51 0 Z" fill="#000" />
        </mask>
      </defs>

      <circle r="80" fill={`url(#${id}-halo)`} className="moldura-buraco-negro__halo" />

      <g className="moldura-buraco-negro__estrelas">
        {ESTRELAS.map((e, i) => (
          <circle
            key={i}
            cx={e.x}
            cy={e.y}
            r={e.r}
            fill="#fff"
            className="moldura-buraco-negro__estrela"
            style={{ animationDelay: `${e.atraso}s` }}
          />
        ))}
      </g>

      <circle r="50" fill={`url(#${id}-sombra)`} />
      <circle r="50.6" fill="none" stroke="#000" strokeWidth="1.6" />

      <g transform={`rotate(${INCLINACAO})`} fill="none" strokeLinecap="round">
        <g filter={`url(#${id}-nevoa)`}>
          <path d={CORPO_DE_CIMA} fill={`url(#${id}-lente)`} />
          <path d={CORPO_DE_BAIXO} fill={`url(#${id}-doppler)`} opacity="0.55" />
        </g>

        <g filter={`url(#${id}-brilho)`} strokeOpacity="0.8">
          {faixa(ARCO_DE_CIMA, 1, (i, props) => (
            <path key={i} d={ARCO_DE_CIMA[i].d} strokeWidth="1.5" {...props} />
          ))}
          <g opacity="0.55">
            {faixa(ARCO_DE_BAIXO, -1, (i, props) => (
              <path key={i} d={ARCO_DE_BAIXO[i].d} strokeWidth="0.9" {...props} />
            ))}
          </g>
        </g>

        <circle
          r="51.3"
          stroke="#fff1cf"
          strokeWidth="0.9"
          filter={`url(#${id}-brilho)`}
          className="moldura-buraco-negro__fotons"
        />

        <g mask={`url(#${id}-atras)`}>
          <path
            d={CORPO_DO_DISCO}
            fill={`url(#${id}-doppler)`}
            fillRule="evenodd"
            opacity="0.85"
            filter={`url(#${id}-nevoa)`}
          />
        </g>

        <g mask={`url(#${id}-atras)`} filter={`url(#${id}-brilho)`} strokeOpacity="0.85">
          {faixa(DISCO, 1, (i, props) => (
            <ellipse
              key={i}
              rx={DISCO[i].rx}
              ry={DISCO[i].ry}
              strokeWidth={DISCO[i].largura}
              {...props}
            />
          ))}
          {[0, 0.5].map((fase) => (
            <g
              key={fase}
              className="moldura-fx__particula moldura-buraco-negro__x"
              style={{
                animationDuration: `${VOLTA_DO_BRILHO / 2}s`,
                animationDelay: `${-VOLTA_DO_BRILHO * (1 + fase)}s`,
              }}
            >
              <ellipse
                rx="2.4"
                ry="1"
                fill="#fffaf0"
                className="moldura-buraco-negro__y"
                style={{
                  animationDuration: `${VOLTA_DO_BRILHO / 2}s`,
                  animationDelay: `${-VOLTA_DO_BRILHO * (1 + fase) - VOLTA_DO_BRILHO / 4}s`,
                }}
              />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
