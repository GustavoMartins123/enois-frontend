import { useEffect, useState } from "react";

import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { nav } from "./navigation";

export function AppSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true",
  );

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <aside
      className={cn(
        "sticky top-20 hidden h-fit shrink-0 lg:block",
        sidebarCollapsed ? "w-16" : "w-60",
      )}
      style={{ transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      <nav className="flex flex-col gap-1">
        <button
          onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
          className="mb-1 grid h-8 w-8 place-items-center self-end rounded-lg text-text-subtle transition hover:bg-surface-2 hover:text-primary"
          aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                "group flex items-center rounded-xl border-l-2 py-3 text-[14px] font-light transition",
                sidebarCollapsed ? "justify-center px-0" : "gap-3 pl-3 pr-3",
                active
                  ? "border-primary bg-surface-2 text-primary"
                  : "border-transparent text-text-subtle hover:bg-surface-3 hover:text-text-strong",
              )}
              style={{ transition: "gap 0.3s ease" }}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-primary" : "",
                )}
              />
              {!sidebarCollapsed && (
                <span className="opacity-100 transition-opacity duration-300">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
