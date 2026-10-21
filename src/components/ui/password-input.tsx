import { texts } from "@/texts";
import type { PasswordInputProps } from "@/types/components/ui/password-input-props";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

import { Input } from "./input";

export function PasswordInput({ revealed, onToggle, className, ...props }: PasswordInputProps) {
  const label = revealed ? texts.auth.password.hide : texts.auth.password.show;

  return (
    <div className="relative">
      <Input type={revealed ? "text" : "password"} className={cn("pr-10", className)} {...props} />

      {/* O Input desenha o contador abaixo da caixa. Centralizar no wrapper empurra o olho para fora. */}
      <button
        type="button"
        onClick={onToggle}
        title={label}
        aria-label={label}
        className={cn(
          "absolute right-2 top-0 flex h-9 items-center px-1.5 text-muted-foreground hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        )}
      >
        {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
