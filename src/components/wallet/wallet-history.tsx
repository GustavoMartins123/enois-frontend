import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { WalletHistoryProps } from "@/types/components/wallet/wallet-history-props";
import { Button, Input, LoadingState } from "@rede-enois/design-system/ui";
import { ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";

import { walletApi } from "@/lib/api";
import { dataHora } from "@/lib/date/format";
import { formatFaisca } from "@/lib/faisca";

export function WalletHistory({ onContest }: WalletHistoryProps) {
  const [draft, setDraft] = useState({ from: "", to: "" });
  const [filter, setFilter] = useState({ from: "", to: "", page: 0 });
  const invalid = Boolean(draft.from && draft.to && draft.from > draft.to);
  const extract = useQuery({
    queryKey: ["carteira-extrato", filter.page, filter.from, filter.to],
    queryFn: () => walletApi.extract({ ...filter, size: 20 }),
    retry: false,
  });

  return (
    <section className="wallet-history wallet-panel" aria-labelledby="wallet-history-title">
      <div className="wallet-history-heading">
        <div>
          <h2 id="wallet-history-title">{texts.wallet.history}</h2>

          <p>{texts.wallet.historyDescription}</p>
        </div>

        {extract.isSuccess && (
          <span className="wallet-history-count">
            {texts.wallet.historyCount(extract.data.entries.length)}
          </span>
        )}
      </div>

      <form
        className="wallet-history-filters"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!invalid) setFilter({ ...draft, page: 0 });
        }}
      >
        <label>
          <span>{texts.wallet.historyFrom}</span>

          <Input
            type="date"
            value={draft.from}
            aria-invalid={invalid}
            aria-describedby={invalid ? "wallet-history-invalid" : undefined}
            onChange={(event) => setDraft({ ...draft, from: event.target.value })}
          />
        </label>

        <label>
          <span>{texts.wallet.historyTo}</span>

          <Input
            type="date"
            value={draft.to}
            aria-invalid={invalid}
            aria-describedby={invalid ? "wallet-history-invalid" : undefined}
            onChange={(event) => setDraft({ ...draft, to: event.target.value })}
          />
        </label>

        <Button type="submit" size="sm" disabled={invalid || extract.isFetching}>
          {texts.wallet.historyApply}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setDraft({ from: "", to: "" });
            setFilter({ from: "", to: "", page: 0 });
          }}
        >
          {texts.wallet.historyClear}
        </Button>
      </form>

      {invalid && (
        <p id="wallet-history-invalid" className="wallet-history-invalid" role="alert">
          {texts.wallet.historyInvalid}
        </p>
      )}

      {extract.isPending ? (
        <LoadingState />
      ) : extract.isError ? (
        <div className="wallet-history-empty" role="alert">
          <p>{texts.wallet.historyLoadError}</p>

          <Button size="sm" variant="outline" onClick={() => void extract.refetch()}>
            {texts.common.retry}
          </Button>
        </div>
      ) : (
        <>
          {extract.data.entries.length === 0 ? (
            <div className="wallet-history-empty">
              <ReceiptText className="h-5 w-5" aria-hidden="true" />

              <p>
                {filter.from || filter.to
                  ? texts.wallet.historyPeriodEmpty
                  : texts.wallet.historyEmpty}
              </p>
            </div>
          ) : (
            <ul className="wallet-history-list">
              {extract.data.entries.map((entry, index) => (
                <li key={`${entry.createdAt}:${entry.refId}:${entry.kind}:${index}`}>
                  <span
                    className={`wallet-history-amount ${entry.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
                  >
                    {entry.amount >= 0 ? "+" : ""}
                    {formatFaisca(entry.amount)}
                  </span>

                  <div className="wallet-history-description">
                    <span className="wallet-history-kind">{texts.wallet.kind[entry.kind]}</span>

                    {entry.message && entry.message !== texts.wallet.kind[entry.kind] && (
                      <p>{entry.message}</p>
                    )}

                    <time dateTime={entry.createdAt}>{dataHora(entry.createdAt)}</time>
                  </div>

                  {entry.kind === "TRANSFER_OUT" && entry.refId !== null && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="wallet-history-contest"
                      onClick={() => onContest(entry.refId!)}
                    >
                      {texts.wallet.contest}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <nav className="wallet-history-pagination" aria-label={texts.wallet.historyPagination}>
            <Button
              size="sm"
              variant="outline"
              disabled={filter.page === 0 || extract.isFetching}
              onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
            >
              <ChevronLeft size={14} aria-hidden="true" />
              {texts.wallet.historyPrevious}
            </Button>

            <span aria-live="polite">{texts.wallet.historyPage(filter.page + 1)}</span>

            <Button
              size="sm"
              variant="outline"
              disabled={!extract.data.hasNext || extract.isFetching}
              onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
            >
              {texts.wallet.historyNext}
              <ChevronRight size={14} aria-hidden="true" />
            </Button>
          </nav>
        </>
      )}
    </section>
  );
}
