import { texts } from "@/texts";
import type { AvatarFrameFxProps } from "@rede-enois/design-system/domain";

import { CircuitoFx } from "./circuito";
import { FliperamaFx } from "./fliperama";
import { MareFx } from "./mare";
import { NeonFx } from "./neon";
import { RadarFx } from "./radar";
import { TrepadeiraFx } from "./trepadeira";
import { VagaLumesFx } from "./vaga-lumes";
import { VendavalFx } from "./vendaval";

const EFEITOS: Record<string, () => React.JSX.Element> = {
  "moldura-mare": MareFx,
  "moldura-trepadeira": TrepadeiraFx,
  "moldura-vendaval": VendavalFx,
  "moldura-vaga-lumes": VagaLumesFx,
  "moldura-fliperama": FliperamaFx,
  "moldura-circuito": CircuitoFx,
  "moldura-neon": NeonFx,
  "moldura-radar": RadarFx,
};

export function AvatarFrameFx({ frame }: AvatarFrameFxProps) {
  if (!Object.hasOwn(EFEITOS, frame)) throw new Error(texts.frameShop.unknownFrame);
  const Efeito = EFEITOS[frame];
  return (
    <span aria-hidden className="moldura-fx">
      <Efeito />
    </span>
  );
}
