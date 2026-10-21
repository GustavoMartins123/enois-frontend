import type { MarketplaceKind } from "@/types/application/marketplace/marketplace-kind";

/** Categorias do marketplace (o backend valida o mesmo conjunto em MarketplaceListing.ItemKind). */
export const MARKETPLACE_KINDS = [
  "THEME",
  "TEMPLATE",
  "BANNER",
  "PAGE",
  "POST",
  "BLOG",
  "SERVICE",
] as const;

export type { MarketplaceKind };

export const MARKETPLACE_KIND_LABELS: Record<MarketplaceKind, string> = {
  THEME: "Temas",
  TEMPLATE: "Templates",
  BANNER: "Banners",
  PAGE: "Páginas",
  POST: "Posts",
  BLOG: "Blogs",
  SERVICE: "Serviços",
};

/** Tipos que entregam conteúdo editável (HTML/texto) em "Minhas compras". */
export const CONTENT_KINDS: MarketplaceKind[] = [
  "TEMPLATE",
  "BANNER",
  "PAGE",
  "POST",
  "BLOG",
  "SERVICE",
];
