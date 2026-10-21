import { useId } from "react";

/** Id único por avatar para os filtros e gradientes do SVG (vários avatares na mesma tela). */
export function useFxId(): string {
  return `fx${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}
