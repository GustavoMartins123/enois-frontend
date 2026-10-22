import type { PreferencesStorageState } from "./preferences-storage-state";

export type PreferencesStorageValue = {
  state?: PreferencesStorageState;
  version?: number;
};
