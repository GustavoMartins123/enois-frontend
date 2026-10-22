import type { AvatarFrameFxProps } from "@/types/components/avatar-frames/avatar-frame-fx-props";

import { BuracoNegroFx } from "./buraco-negro";
import { DragaoFx } from "./dragao";
import { GlacialFx } from "./glacial";
import { HologramaFx } from "./holograma";
import { InfernoFx } from "./inferno";
import { MatrixFx } from "./matrix";
import { OrbitaFx } from "./orbita";
import { PortalFx } from "./portal";
import { TempestadeFx } from "./tempestade";
import { ToxicaFx } from "./toxica";

/** As molduras com efeito; a lista de ids vive em FX_FRAMES (lib/avatar-frames). */
const EFEITOS: Record<string, () => React.JSX.Element> = {
  "moldura-tempestade": TempestadeFx,
  "moldura-inferno": InfernoFx,
  "moldura-buraco-negro": BuracoNegroFx,
  "moldura-orbita": OrbitaFx,
  "moldura-glacial": GlacialFx,
  "moldura-toxica": ToxicaFx,
  "moldura-dragao": DragaoFx,
  "moldura-matrix": MatrixFx,
  "moldura-portal": PortalFx,
  "moldura-holograma": HologramaFx,
};

/**
 * O desenho da moldura com efeito, por cima do avatar e vazando 30% para cada lado.
 * Só decoração: sem eventos de ponteiro e fora da árvore de acessibilidade.
 */
export function AvatarFrameFx({ frame }: AvatarFrameFxProps) {
  const Efeito = EFEITOS[frame];
  // Moldura que este front ainda não conhece: o avatar aparece normal, sem o efeito.
  if (!Object.hasOwn(EFEITOS, frame)) return null;
  return (
    <span aria-hidden className="moldura-fx">
      <Efeito />
    </span>
  );
}
