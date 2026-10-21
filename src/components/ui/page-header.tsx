import type { PageHeaderProps } from "@/types/components/ui/page-header-props";

/**
 * Cabeçalho de página: título, descrição e ações num cartão só.
 *
 * Cada tela montava o seu — com cartão ou sem, título em `text-xl` ou `text-2xl`, e o botão de
 * criar herdando o `w-full` do tamanho padrão do Button, o que virava uma barra roxa da largura
 * da página. Aqui as ações ficam do tamanho do conteúdo (`[&>*]:w-auto`), à direita no desktop.
 */
export function PageHeader({ title, description, icon: Icon, actions, children }: PageHeaderProps) {
  return (
    <header className="surface-card p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-text-strong">
            {Icon && <Icon className="h-5 w-5 shrink-0 text-primary" />}

            <span className="min-w-0 break-words">{title}</span>
          </h1>

          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2 [&>*]:w-auto">{actions}</div>}
      </div>

      {children}
    </header>
  );
}
