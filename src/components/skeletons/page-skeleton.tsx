import { texts } from "@/texts";
import { Skeleton } from "@rede-enois/design-system/ui";

import { AppContainer } from "@/components/app-container";

/**
 * Casca de página inteira: título, subtítulo e blocos de conteúdo no lugar da rota que ainda está
 * chegando (navegação com internet lenta, loader demorado).
 *
 * Renderiza dentro do `AppContainer` de propósito: sem isso, o cabeçalho e a barra lateral
 * sumiriam enquanto o loader roda e a tela "piscaria" quando a página chegada substituísse tudo.
 */
export function PageSkeleton() {
  return (
    <AppContainer>
      <div
        role="status"
        aria-label={texts.common.loading}
        className="mx-auto w-full max-w-3xl space-y-6"
      >
        <div className="space-y-3">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="surface-card space-y-3 p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />

                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </AppContainer>
  );
}
