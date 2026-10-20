import type { ComponentProps } from "react";

export interface PasswordInputProps extends Omit<ComponentProps<"input">, "type"> {
  revealed: boolean;
  onToggle: () => void;
}
