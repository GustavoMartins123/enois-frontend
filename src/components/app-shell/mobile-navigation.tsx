import { useEffect } from "react";

import { Link } from "@tanstack/react-router";

import { Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { NavigationLinks } from "./navigation-links";

type MobileNavigationProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border-soft bg-surface-card shadow-card transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border-soft px-3 sm:h-16">
          <Link to="/feed" onClick={onClose} className="flex items-center gap-2">
            <div
              className="grid h-8 w-8 place-items-center rounded-xl text-primary-foreground sm:h-9 sm:w-9"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              É<span className="gradient-text">nóis</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-text-subtle transition hover:bg-surface-2 hover:text-primary"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <NavigationLinks onNavigate={onClose} className="overflow-y-auto p-3" />
      </div>
    </div>
  );
}
