import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import { ArrowLeft, Send, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

import { walletApi } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/carteira")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.wallet.seoTitle }] }),
  component: Carteira,
});

function Carteira() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [payOpen, setPayOpen] = useState(false);
  const [form, setForm] = useState({ toUsername: "", amount: "", message: "" });

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["carteira"],
    queryFn: () => walletApi.wallet(),
  });

  const transfer = useMutation({
    mutationFn: () => walletApi.transfer(form.toUsername.trim(), Number(form.amount), form.message.trim() || undefined),
    onSuccess: () => {
      setPayOpen(false);
      setForm({ toUsername: "", amount: "", message: "" });
      toast(texts.wallet.sent, "success");
      void queryClient.invalidateQueries({ queryKey: ["carteira"] });
    },
    onError: () => toast(texts.wallet.transferError, "error"),
  });

  const entries = wallet?.entries ?? [];

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          <>{texts.wallet.back}</>
        </Link>

        <div className="surface-card space-y-4 p-6">
          <div className="flex items-center gap-2 text-text-subtle">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest">{texts.wallet.title}</span>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : (
            <p className="text-4xl font-semibold tracking-tight text-text-strong">
              {wallet?.balance ?? 0} <span className="text-lg font-normal text-text-subtle">faíscas</span>
            </p>
          )}

          {wallet && (
            <p className="text-xs text-text-subtle">
              {texts.wallet.chaveLabel}: <span className="font-mono text-text-strong">{wallet.chave}</span>
            </p>
          )}

          <Button className="rounded-full gap-2" onClick={() => setPayOpen(true)}>
            <Send className="h-4 w-4" />
            {texts.wallet.pay}
          </Button>

          <p className="text-xs leading-relaxed text-text-subtle">{texts.wallet.notice}</p>
        </div>

        {payOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border-soft bg-surface-card p-5">
              <h3 className="text-base font-semibold">{texts.wallet.payTitle}</h3>

              <div className="mt-3 space-y-3 text-sm">
                <label className="block space-y-1">
                  <span className="text-xs text-text-subtle">{texts.wallet.toLabel}</span>

                  <Input
                    value={form.toUsername}
                    onChange={(event) => setForm({ ...form, toUsername: event.target.value })}
                    placeholder={texts.wallet.toPlaceholder}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs text-text-subtle">{texts.wallet.amountLabel}</span>

                  <Input
                    type="number"
                    min="1"
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                    placeholder="0"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs text-text-subtle">{texts.wallet.messageLabel}</span>

                  <Textarea
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    rows={2}
                    placeholder={texts.wallet.messagePlaceholder}
                  />
                </label>

                <p className="text-xs leading-relaxed text-text-subtle">{texts.wallet.irreversible}</p>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" className="rounded-full" onClick={() => setPayOpen(false)}>
                  {texts.common.cancel}
                </Button>

                <Button
                  className="rounded-full"
                  disabled={
                    transfer.isPending ||
                    !form.toUsername.trim() ||
                    !form.amount ||
                    Number(form.amount) <= 0 ||
                    Number.isNaN(Number(form.amount))
                  }
                  onClick={() => transfer.mutate()}
                >
                  {transfer.isPending ? texts.common.saving : texts.wallet.confirm}
                </Button>
              </div>
            </div>
          </div>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-subtle">
            {texts.wallet.history}
          </h2>

          {entries.length === 0 ? (
            <div className="rounded-2xl border border-border-soft bg-surface-card p-6 text-sm text-muted-foreground">
              <Zap className="mb-2 h-4 w-4 text-primary" />
              {texts.wallet.historyEmpty}
            </div>
          ) : (
            <ul className="divide-y divide-border-soft overflow-hidden rounded-2xl border border-border-soft bg-surface-card">
              {entries.map((entry, index) => (
                <li key={index} className="flex items-center gap-3 p-4">
                  <span
                    className={`text-sm font-semibold ${entry.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
                  >
                    {entry.amount >= 0 ? "+" : ""}
                    {entry.amount}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-text-strong">
                      {entry.message || (texts.wallet.kind[entry.kind] ?? entry.kind)}
                    </span>

                    <span className="block text-xs text-text-subtle">
                      {new Date(entry.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppContainer>
  );
}
