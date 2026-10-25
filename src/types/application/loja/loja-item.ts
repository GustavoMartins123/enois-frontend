export type LojaItem = {
  id: string;
  name: string;
  description: string;
  priceMf: number;
  cssRing: string;
  releaseOrder: number;
  owned?: boolean;
  equipped?: boolean;
};
