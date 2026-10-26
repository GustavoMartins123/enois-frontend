import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { LegalLastUpdatedProps } from "@/types/components/legal/legal-last-updated-props";
import type { LegalSectionProps } from "@/types/components/legal/legal-section-props";
import type { WithRequiredChildren } from "@/types/components/with-required-children";

import { anoAtual } from "@/lib/date/format";

import { ThemeToggle } from "@/components/theme-toggle";

export function LegalLayout({ children }: WithRequiredChildren) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/brand/mark-primary.svg" alt="" className="h-9 w-9 shrink-0" />

            <span className="text-base font-semibold tracking-tight">
              <>{texts.brand.prefix}</>

              <span className="gradient-text">{texts.brand.accent}</span>
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
          <p>{texts.legal.footer.copyright(anoAtual())}</p>

          <nav className="flex items-center gap-4">
            <Link to="/sobre" className="transition-colors hover:text-foreground">
              {texts.legal.footer.about}
            </Link>

            <Link to="/termos" className="transition-colors hover:text-foreground">
              {texts.legal.footer.terms}
            </Link>

            <Link to="/privacidade" className="transition-colors hover:text-foreground">
              {texts.legal.footer.privacy}
            </Link>

            <Link to="/diretrizes" className="transition-colors hover:text-foreground">
              {texts.legal.footer.guidelines}
            </Link>
          </nav>
        </div>

        {/* Mesmo aviso do rodapé da landing: identidade do projeto, não promessa de marca. */}
        <p className="mx-auto mt-4 max-w-4xl px-4 text-xs leading-relaxed text-muted-foreground sm:px-6">
          {texts.about.disclaimer}
        </p>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground [&_p]:whitespace-pre-line">
        {children}
      </div>
    </section>
  );
}

export function LegalLastUpdated({ date }: LegalLastUpdatedProps) {
  return (
    <p className="text-xs text-muted-foreground">
      <>{texts.legal.footer.lastUpdated}</>

      <time dateTime={date}>{date}</time>
    </p>
  );
}
