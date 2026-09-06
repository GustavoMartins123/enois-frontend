import type { ComponentPropsWithoutRef } from "react";

export type SubField = {
  key: string;
  label: string;
  required?: boolean;
  multiline?: boolean;
  type?: ComponentPropsWithoutRef<"input">["type"];
};
