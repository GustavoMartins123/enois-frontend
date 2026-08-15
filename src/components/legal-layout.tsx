import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

import { Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              É<span className="gradient-text">nóis</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="surface-card space-y-8 p-6 sm:p-10">{children}</div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:px-6">
          <p>© {new Date().getFullYear()} Énóis · Rede profissional gratuita e humana</p>
          <nav className="flex items-center gap-4">
            <Link to="/termos" className="transition-colors hover:text-foreground">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="transition-colors hover:text-foreground">
              Política de Privacidade
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="space-y-2 text-[14px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function LegalUpdated({ date }: { date: string }) {
  return (
    <p className="text-xs text-muted-foreground">
      Última atualização: <time dateTime={date}>{date}</time>
    </p>
  );
}
