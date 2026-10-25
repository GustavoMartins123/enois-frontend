export const FRAME_COLLECTIONS = {
  elements: ["moldura-mare", "moldura-trepadeira", "moldura-vendaval", "moldura-vaga-lumes"],
  technology: ["moldura-fliperama", "moldura-circuito", "moldura-neon", "moldura-radar"],
} as const;

export const NEW_SHOP_FRAMES: readonly string[] = [
  ...FRAME_COLLECTIONS.technology,
  ...FRAME_COLLECTIONS.elements,
];

export const FRAME_SHOP_PAGE_SIZE = 12;
