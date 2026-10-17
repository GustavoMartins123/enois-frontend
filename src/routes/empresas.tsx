import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import { Building2, Search } from "lucide-react";
import { useState } from "react";

import { jobsApi } from "@/lib/api";
import { resolveCdnUrl } from "@/lib/api/media";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/empresas")({
  head: () => ({ meta: [{ title: texts.empresas.seoTitle }] }),
  component: Empresas,
});

function Empresas() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["companies", search],
    queryFn: () => jobsApi.companies(search || undefined, 120),
  });

  const companies = data ?? [];

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{texts.empresas.title}</h1>

          <p className="text-sm text-muted-foreground">{texts.empresas.subtitle}</p>
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={texts.empresas.searchPlaceholder}
            className="h-11 w-full rounded-full border border-border-soft bg-surface-card pl-9 pr-4 text-sm outline-none transition focus:border-primary"
          />
        </label>

        {isLoading ? (
          <LoadingState />
        ) : companies.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-surface-card">
            <EmptyState icon={Building2} title={texts.empresas.empty} />
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {companies.map((company) => (
              <li key={company.name}>
                <Link
                  to="/vagas"
                  search={{}}
                  className="surface-card flex items-center gap-3 p-4 transition hover:border-primary/40"
                  onClick={() => {
                    // A busca de vagas e estado interno: o nome da empresa viaja no
                    // sessionStorage e a pagina de vagas puxa ao montar.
                    sessionStorage.setItem("empresas:query", company.name);
                  }}
                >
                  {company.logo ? (
                    <img
                      src={resolveCdnUrl(company.logo)}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-xl border border-border-soft object-contain"
                    />
                  ) : (
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-lg font-bold text-primary">
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-text-strong">
                      {company.name}
                    </span>

                    <span className="block text-xs text-text-subtle">
                      {texts.empresas.jobsCount(company.openJobs)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppContainer>
  );
}
