import type { WalletEntry } from "./wallet-entry";

export type WalletExtract = {
  entries: WalletEntry[];
  page: number;
  size: number;
  hasNext: boolean;
};
