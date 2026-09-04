import { Link } from "@tanstack/react-router";

import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

import { AppBrand } from "./app-brand";
import { HeaderLayout } from "./header-layout";

export function GuestHeader() {
  return (
    <HeaderLayout>
      <AppBrand />

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Button asChild className="rounded-full gap-1.5" size="sm">
          <Link to="/entrar" search={{ tab: "login" }}>
            <LogIn className="h-4 w-4" /> Entrar
          </Link>
        </Button>
      </div>
    </HeaderLayout>
  );
}
