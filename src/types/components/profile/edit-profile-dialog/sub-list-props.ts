import type { QueryKey } from "@tanstack/react-query";

import type { SubField } from "./sub-field";

export type SubListProps<
  T extends Record<"id", string>,
  TData extends Record<string, unknown> = Record<string, string>,
> = {
  items: T[];
  fields: SubField[];
  currentlyHereKey?: string;
  createApi: (data: TData) => Promise<T>;
  updateApi: (id: string, data: TData) => Promise<T>;
  deleteApi: (id: string) => Promise<void>;
  queryKey: QueryKey;
  emptyMessage: string;
  newItem: Record<string, string>;
};
