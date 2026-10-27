import type { AvatarFrameFxProps } from "@/types/components/avatar-frames/avatar-frame-fx-props";

import { BuracoNegroFx } from "./buraco-negro";
import { GalaxiaFx } from "./galaxia";
import { GlacialFx } from "./glacial";
import { HologramaFx } from "./holograma";
import { InfernoFx } from "./inferno";
import { MareFx } from "./mare";
import { NebulosaFx } from "./nebulosa";
import { OrbitaFx } from "./orbita";
import { PortalFx } from "./portal";
import { SupernovaFx } from "./supernova";
import { TempestadeFx } from "./tempestade";
import { ToxicaFx } from "./toxica";
import { TrepadeiraFx } from "./trepadeira";
import { VagaLumesFx } from "./vaga-lumes";
import { VendavalFx } from "./vendaval";

/** As molduras com efeito; a lista de ids vive em FX_FRAMES (lib/avatar-frames). */
const EFEITOS: Record<string, () => React.JSX.Element> = {
  "moldura-tempestade": TempestadeFx,
  "moldura-inferno": InfernoFx,
  "moldura-buraco-negro": BuracoNegroFx,
  "moldura-orbita": OrbitaFx,
  "moldura-glacial": GlacialFx,
  "moldura-toxica": ToxicaFx,
  "moldura-nebulosa": NebulosaFx,
  "moldura-supernova": SupernovaFx,
  "moldura-galaxia": GalaxiaFx,
  "moldura-portal": PortalFx,
  "moldura-holograma": HologramaFx,
  "moldura-mare": MareFx,
  "moldura-trepadeira": TrepadeiraFx,
  "moldura-vendaval": VendavalFx,
  "moldura-vaga-lumes": VagaLumesFx,
};

/**
 * O desenho da moldura com efeito, por cima do avatar e vazando 30% para cada lado.
 * Só decoração: sem eventos de ponteiro e fora da árvore de acessibilidade.
 */
export function AvatarFrameFx({ frame }: AvatarFrameFxProps) {
  // Moldura que este front ainda não conhece: o avatar aparece normal, sem o efeito.
  if (!Object.hasOwn(EFEITOS, frame)) return null;
  const Efeito = EFEITOS[frame];
  return (
    <span aria-hidden className="moldura-fx">
      <Efeito />
    </span>
  );
}
