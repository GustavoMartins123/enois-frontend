import { useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { Loader2, Search } from "lucide-react";

import { searchApi } from "@/lib/api";
import type { SearchResult } from "@/lib/api";

import { Input } from "@/components/ui/input";

import { SearchResults } from "./search-results";
import { navigateToHref } from "./utils/navigation";

export function SearchBox() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (desktopRef.current && !desktopRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: results, isFetching } = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => searchApi.search(debounced),
    enabled: debounced.length >= 2,
  });

  const items = results?.items ?? [];

  const closeSearch = () => {
    setOpen(false);
    setQuery("");
  };

  const handleSelect = (item: SearchResult, closeMobile = false) => {
    closeSearch();
    if (closeMobile) setMobileOpen(false);
    navigateToHref(item.href, navigate);
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="ml-auto grid h-9 w-9 place-items-center rounded-full text-text-subtle transition hover:bg-surface-2 hover:text-primary md:hidden"
        aria-label="Buscar"
      >
        <Search className="h-4 w-4" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 pt-4 backdrop-blur-sm md:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setMobileOpen(false);
              closeSearch();
            }
          }}
        >
          <div className="relative w-full max-w-md px-4">
            <Search className="pointer-events-none absolute left-7 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-subtle" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Buscar pessoas, comunidades, vagas..."
              className="h-12 rounded-full border-border-soft bg-surface-card pl-10 pr-4 focus-visible:border-primary"
              autoFocus
            />
            {isFetching && (
              <Loader2 className="absolute right-7 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-subtle" />
            )}
            {open && debounced.length >= 2 && (
              <div className="absolute left-4 right-4 top-full mt-2 overflow-hidden rounded-2xl border border-border-soft bg-surface-card shadow-card">
                <SearchResults
                  items={items}
                  query={debounced}
                  isFetching={isFetching}
                  onSelect={(item) => handleSelect(item, true)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div ref={desktopRef} className="relative ml-2 hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-subtle" />
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar pessoas, comunidades, vagas..."
          className="h-10 rounded-full border-border-soft bg-surface-1 pl-9 focus-visible:border-primary"
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-subtle" />
        )}
        {open && debounced.length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-border-soft bg-surface-card shadow-card">
            <SearchResults
              items={items}
              query={debounced}
              isFetching={isFetching}
              onSelect={handleSelect}
            />
          </div>
        )}
      </div>
    </>
  );
}
