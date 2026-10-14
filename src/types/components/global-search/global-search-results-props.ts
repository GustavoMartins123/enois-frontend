import type { SearchResult } from "@/types/application/search/search-result";

export type GlobalSearchResultsProps = {
  items: SearchResult[];
  query: string;
  isFetching: boolean;
  onSelect: (item: SearchResult) => void;
};
