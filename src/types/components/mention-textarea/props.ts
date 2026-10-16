import type { ComponentPropsWithoutRef } from "react";

export type Props = Pick<
  ComponentPropsWithoutRef<"textarea">,
  "placeholder" | "className" | "maxLength" | "rows"
> & {
  value: string;
  onChange: (value: string, mentionedUserIds: string[]) => void;
  /** Mostra a barra de formatacao (negrito, lista, citacao...) acima do campo. */
  toolbar?: boolean;
};
