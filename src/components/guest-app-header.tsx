import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";
import { Button } from "@rede-enois/design-system/ui";
import { LogIn } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

import { AppBrand } from "./app-brand";
import { AppHeaderLayout } from "./app-header-layout";

export function GuestAppHeader() {
  return (
    <AppHeaderLayout>
      <AppBrand />

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <Button asChild className="rounded-full gap-1.5" size="sm">
          <Link to="/entrar" search={{ tab: "login" }}>
            <LogIn className="h-4 w-4" />

            <>{texts.common.enter}</>
          </Link>
        </Button>
      </div>
    </AppHeaderLayout>
  );
}
