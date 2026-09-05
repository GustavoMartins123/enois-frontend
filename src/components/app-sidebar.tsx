import { useEffect, useState } from "react";

import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { texts } from "@/texts";

import { NavigationLinks } from "./navigation-links";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

export function AppSidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const nextCollapsed = !collapsed;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(nextCollapsed));
      return nextCollapsed;
    });
  };

  const toggleLabel = sidebarCollapsed
    ? texts.navigation.expandMenu
    : texts.navigation.collapseMenu;

  return (
    <aside
      className={cn(
        "sticky top-20 hidden h-fit shrink-0 lg:block",
        sidebarCollapsed ? "w-16" : "w-60",
      )}
      style={{ transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      <div className="flex flex-col gap-1">
        <button
          onClick={toggleSidebar}
          className="mb-1 grid h-8 w-8 place-items-center self-end rounded-lg text-text-subtle transition hover:bg-surface-2 hover:text-primary"
          aria-label={toggleLabel}
          title={toggleLabel}
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>

        <NavigationLinks collapsed={sidebarCollapsed} />
      </div>
    </aside>
  );
}
