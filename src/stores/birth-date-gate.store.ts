import { create } from "zustand";

interface BirthDateGateState {
  open: boolean;
  show: () => void;
  hide: () => void;
}

export const useBirthDateGateStore = create<BirthDateGateState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
