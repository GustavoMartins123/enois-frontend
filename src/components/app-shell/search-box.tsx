import { useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { Loader2, Search } from "lucide-react";

import { searchApi } from "@/lib/api";

import { Input } from "@/components/ui/input";

import { UserAvatar } from "@/components/user-avatar";

import { navigateToHref } from "./utils";

export function SearchBox() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

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
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setMobileOpen(false);
              setOpen(false);
              setQuery("");
            }
          }}
        >
          <div ref={mobileRef} className="relative w-full max-w-md px-4">
            <Search className="pointer-events-none absolute left-7 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-subtle" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
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
                {items.length === 0 && !isFetching && (
                  <p className="px-4 py-6 text-center text-sm text-text-subtle">
                    Nenhum resultado para "{debounced}"
                  </p>
                )}
                <ul className="max-h-80 overflow-y-auto">
                  {items.map((item) => {
                    const close = () => {
                      setOpen(false);
                      setQuery("");
                      setMobileOpen(false);
                    };
                    return (
                      <li key={`${item.type}-${item.id}`}>
                        <button
                          onClick={() => {
                            close();
                            navigateToHref(item.href, navigate);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-3"
                        >
                          <UserAvatar src={item.image} alt={item.title} className="h-10 w-10" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-light text-text-strong">
                              {item.title}
                            </p>
                            <p className="truncate text-xs text-text-subtle">{item.subtitle}</p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      <div ref={desktopRef} className="relative ml-2 hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-subtle" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
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
            {items.length === 0 && !isFetching && (
              <p className="px-4 py-6 text-center text-sm text-text-subtle">
                Nenhum resultado para "{debounced}"
              </p>
            )}
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item) => {
                const close = () => {
                  setOpen(false);
                  setQuery("");
                };
                return (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      onClick={() => {
                        close();
                        navigateToHref(item.href, navigate);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-3"
                    >
                      <UserAvatar src={item.image} alt={item.title} className="h-10 w-10" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-light text-text-strong">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-text-subtle">{item.subtitle}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
