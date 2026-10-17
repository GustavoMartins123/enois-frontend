/** Amostra que alimenta a miniatura da galeria de temas. */
export type ThemeCollectionPreview = {
  background: string;
  surface: string;
  primary: string;
  onPrimary: string;
  border: string;
  effect: "bevel" | "glass" | "flat" | "glossy" | "terminal" | "neumorph" | "gradient";
};
