/**
 * Tema publicado na galeria da comunidade, como o motor de temas precisa dele.
 *
 * `packageJson` é o pacote de cores validado no publish; a partir dele o front monta uma
 * coleção de verdade (mesma expansão de tokens dos temas da casa).
 */
export type GalleryThemePackage = {
  id: string;
  name: string;
  description?: string | null;
  packageJson: string;
  modeDefault: string;
};
