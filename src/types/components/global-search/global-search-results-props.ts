import type { SearchResult } from "@/lib/api";

export type GlobalSearchResultsProps = {
  items: SearchResult[];
  query: string;
  isFetching: boolean;
  onSelect: (item: SearchResult) => void;
};
