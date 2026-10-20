import { useEffect, useState } from "react";

import { Copy, Heart } from "lucide-react";
import QRCode from "qrcode";

import { PIX_KEY, pixCopiaECola } from "@/lib/pix";

import { useToast } from "./ui/toast";

/**
 * O convite de doação no menu direito do feed (versão compacta do banner da home).
 *
 * O Énóis é gratuito e livre; quem quiser ajuda a manter assim com Pix. A chave é o CNPJ da
 * Apoie o Énóis — o payload é o mesmo BR Code do banner da home, gerado pelo mesmo algoritmo
 * (estático, sem vencimento).
 * Aparece para todo mundo, logado ou não: apoiar não exige conta.
 */
export function ApoieCard() {
  const { toast } = useToast();
  const [aberto, setAberto] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!aberto || qr) return;
    QRCode.toDataURL(pixCopiaECola(), {
      width: 220,
      margin: 1,
      color: { dark: "#0b0d12", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(null));
  }, [aberto, qr]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(pixCopiaECola());
      setCopiado(true);
      toast("Código Pix copiado — cola no app do banco!", "success");
      setTimeout(() => setCopiado(false), 4000);
    } catch {
      toast("Não deu para copiar — seleciona o código e copia à mão.", "error");
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface-card">
      <div className="h-10" style={{ background: "var(--gradient-primary)" }} />

      <div className="space-y-2 px-4 pb-4">
        <p className="-mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-surface-card px-2 py-1 text-xs font-semibold text-primary">
          <Heart className="h-3.5 w-3.5" />
          Apoie o Énóis
        </p>

        <p className="text-xs text-text-subtle">
          O Énóis é <span className="font-medium text-text-strong">sempre gratuito e livre</span>.
          Quem puder, ajude a manter assim.
        </p>

        <button
          type="button"
          className="w-full rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          onClick={() => setAberto((v) => !v)}
        >
          {aberto ? "Ocultar Pix" : "Apoiar com Pix"}
        </button>

        {aberto && (
          <div className="space-y-2 pt-1">
            <div className="mx-auto w-fit rounded-lg bg-white p-1.5">
              {qr ? (
                <img src={qr} alt="QR Code Pix do Apoie o Énóis" className="h-40 w-40" />
              ) : (
                <div className="h-40 w-40 animate-pulse rounded bg-muted" />
              )}
            </div>

            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border-soft px-3 py-1.5 text-xs font-medium transition hover:border-primary hover:text-primary"
              onClick={copiar}
            >
              <Copy className="h-3 w-3" />
              {copiado ? "Copiado!" : "Copiar código Pix"}
            </button>

            <p className="text-[11px] text-text-subtle">
              Chave (CNPJ): <span className="font-mono">{PIX_KEY}</span> · Apoie o Énóis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
