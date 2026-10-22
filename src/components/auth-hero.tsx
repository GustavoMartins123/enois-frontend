import { useQuery } from "@tanstack/react-query";

import { texts } from "@/texts";

import { statsApi } from "@/lib/api/stats";

/**
 * Painel de marca das telas de entrada (login e reset de senha).
 *
 * Os numeros sao REAIS: vem de `/stats/community` (publico, agregado, cache de ~10 min no
 * servidor) — a mesma fonte que a landing usa. Antes eram fixos no texto ("120k+ profissionais")
 * numa rede que tem 2.275 contas: o painel afirmava um numero que o produto nao tem. Se a consulta
 * falhar, o painel fica sem numero em vez de voltar a inventar um.
 *
 * A frase e a tese do produto (a mesma da landing), nao um depoimento de uma pessoa que nao
 * existe com o nome de uma empresa real.
 */
export function AuthHero() {
  const { data: communityStats } = useQuery({
    queryKey: ["stats", "community"],
    queryFn: () => statsApi.community(),
    staleTime: 10 * 60_000,
    retry: 1,
  });

  return (
    <>
      <div className="relative max-w-md">
        <p className="text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
          {texts.auth.hero.eyebrow}
        </p>

        <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">
          {texts.auth.hero.quote}
        </h2>
      </div>

      {communityStats ? (
        <div className="relative grid grid-cols-2 gap-4 text-sm">
          {texts.auth.hero
            .stats(communityStats.activeUsers, communityStats.totalUsers, communityStats.windowDays)
            .map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>

                <p className="text-primary-foreground/75">{stat.label}</p>
              </div>
            ))}
        </div>
      ) : null}
    </>
  );
}
