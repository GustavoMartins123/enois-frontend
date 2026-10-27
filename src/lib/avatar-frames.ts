import {
  ANIMATED_FRAMES as DESIGN_SYSTEM_ANIMATED_FRAMES,
  FX_FRAMES as DESIGN_SYSTEM_FX_FRAMES,
} from "@rede-enois/design-system/domain";

export const NEW_FX_FRAMES = [
  "moldura-mare",
  "moldura-trepadeira",
  "moldura-vendaval",
  "moldura-vaga-lumes",
  "moldura-fliperama",
  "moldura-circuito",
  "moldura-neon",
  "moldura-radar",
] as const;

export const FX_FRAMES: readonly string[] = [...DESIGN_SYSTEM_FX_FRAMES, ...NEW_FX_FRAMES];

export const ANIMATED_FRAMES: readonly string[] = [
  ...DESIGN_SYSTEM_ANIMATED_FRAMES,
  ...NEW_FX_FRAMES,
];

const BASE_FRAMES = new Set([
  "moldura-ambar",
  "moldura-esmeralda",
  "moldura-violeta",
  "moldura-coral",
  ...DESIGN_SYSTEM_ANIMATED_FRAMES,
]);

export function isNewFxFrame(frame: string): boolean {
  return (NEW_FX_FRAMES as readonly string[]).includes(frame);
}

export function isDesignSystemFrame(frame: string): boolean {
  return BASE_FRAMES.has(frame);
}

/** Mesma semente no servidor e no cliente para preservar o desenho na hidratação. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function polar(radius: number, degrees: number): [number, number] {
  const rad = (degrees * Math.PI) / 180;
  return [round(radius * Math.sin(rad)), round(-radius * Math.cos(rad))];
}

export function round(n: number): number {
  return Math.round(n * 100) / 100;
}
