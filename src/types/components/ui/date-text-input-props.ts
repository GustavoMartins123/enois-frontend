import type { ComponentProps } from "react";

export type DateTextInputProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "min" | "max"
> & {
  /** Valor controlado: o mesmo que `onValueChange` entrega (ISO, "" ou o texto parcial). */
  value?: string;
  defaultValue?: string;
  /**
   * Recebe o ISO (aaaa-mm-dd) quando a data está completa e existe, "" com o campo vazio e, no meio
   * da digitação, o texto parcial (ex.: "15/0") — assim uma validação por regex ISO do formulário
   * barra o envio em vez de tratar a data pela metade como "apagada".
   */
  onValueChange?: (iso: string) => void;
  min?: string;
  max?: string;
};
