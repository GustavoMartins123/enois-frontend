import { useEffect, useState } from "react";

import { Link, createFileRoute } from "@tanstack/react-router";

import {
  Check,
  Copy,
  Heart,
  MessageSquare,
  Server,
  Share2,
  ShieldCheck,
  Users,
} from "lucide-react";
import QRCode from "qrcode";

import { PIX_KEY, pixCopiaECola } from "@/lib/pix";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/apoiar")({
  head: () => ({
    meta: [
      { title: "Apoie o Énóis" },
      {
        name: "description",
        content:
          "O Énóis é gratuito e livre. Quem puder, ajuda a manter a rede de pé com uma doação via Pix — qualquer valor, sem assinatura e sem contrapartida.",
      },
    ],
  }),
  component: Apoiar,
});

const MOTIVOS = [
  {
    icon: ShieldCheck,
    titulo: "Sem anúncios e sem vender dados",
    texto:
      "O Énóis não tem patrocinador mandando no feed, não vende o seu perfil e não enche a tela de propaganda. A receita que sustenta a rede é a boa e velha comunidade.",
  },
  {
    icon: Server,
    titulo: "Tem conta para pagar todo mês",
    texto:
      "Servidores, banco de dados, armazenamento das fotos e envio de e-mail custam dinheiro todo mês — mesmo nos dias em que ninguém publica nada.",
  },
  {
    icon: Users,
    titulo: "Quem manda é quem está aqui",
    texto:
      "As regras, os temas e o roadmap são discutidos em público. Apoiar financeiramente não compra poder na rede: compra tempo para a rede continuar existindo.",
  },
  {
    icon: Heart,
    titulo: "Qualquer valor ajuda de verdade",
    texto:
      "Não é assinatura, não é mensalidade e não tem contrapartida obrigatória. Doou uma vez, doou — e o Énóis continua gratuito para todo mundo.",
  },
] as const;

function Apoiar() {
  const { toast } = useToast();
  const [qr, setQr] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(pixCopiaECola(), {
      width: 360,
      margin: 1,
      color: { dark: "#0b0d12", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(null));
  }, []);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(pixCopiaECola());
      setCopiado(true);
      toast("Código Pix copiado — cola no app do banco!", "success");
      setTimeout(() => setCopiado(false), 4000);
    } catch {
      toast("Não deu para copiar — toque e segure no código para copiar à mão.", "error");
    }
  };

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-2xl space-y-5">
        {/* Capa */}
        <section className="surface-card overflow-hidden">
          <div className="h-28 sm:h-36" style={{ background: "var(--gradient-primary)" }} />

          <div className="px-5 pb-6 sm:px-8">
            <p className="-mt-6 inline-flex items-center gap-2 rounded-full bg-surface-card px-3 py-1.5 text-sm font-semibold text-primary shadow-soft">
              <Heart className="h-4 w-4" />

              <>{textsApoie.badge}</>
            </p>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text-strong sm:text-3xl">
              {textsApoie.titulo}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-subtle">
              {textsApoie.subtitulo}
            </p>
          </div>
        </section>

        {/* Por que apoiar */}
        <section className="space-y-3">
          <h2 className="text-base font-medium text-text-strong">{textsApoie.porQue}</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MOTIVOS.map((motivo) => (
              <article key={motivo.titulo} className="surface-card p-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary">
                  <motivo.icon className="h-4 w-4" />
                </span>

                <h3 className="mt-2 text-sm font-medium text-text-strong">{motivo.titulo}</h3>

                <p className="mt-1 text-xs leading-relaxed text-text-subtle">{motivo.texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Pix */}
        <section id="pix" className="surface-card p-5 sm:p-6">
          <h2 className="text-base font-medium text-text-strong">{textsApoie.pixTitulo}</h2>

          <p className="mt-1 text-sm text-text-subtle">{textsApoie.pixDescricao}</p>

          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="rounded-xl bg-white p-2 shadow-soft">
              {qr ? (
                <img
                  src={qr}
                  alt="QR Code Pix do Apoie o Énóis"
                  className="h-40 w-40 sm:h-44 sm:w-44"
                />
              ) : (
                <div className="h-40 w-40 animate-pulse rounded bg-muted sm:h-44 sm:w-44" />
              )}
            </div>

            <div className="w-full min-w-0 space-y-3 sm:flex-1">
              <div className="rounded-lg bg-muted px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-text-subtle">
                  {textsApoie.chaveRotulo}
                </p>

                <p className="break-all font-mono text-sm text-text-strong">{PIX_KEY}</p>
              </div>

              <Button className="w-full gap-2 rounded-full sm:w-auto" onClick={copiar}>
                {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}

                <>{copiado ? textsApoie.copiado : textsApoie.copiar}</>
              </Button>

              <p className="text-xs text-text-subtle">{textsApoie.pixAviso}</p>
            </div>
          </div>
        </section>

        {/* Além do dinheiro */}
        <section className="surface-card p-5 sm:p-6">
          <h2 className="text-base font-medium text-text-strong">{textsApoie.alemTitulo}</h2>

          <p className="mt-1 text-sm text-text-subtle">{textsApoie.alemDescricao}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/suporte"
              className="inline-flex items-center gap-2 rounded-full border border-border-soft px-3 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              <MessageSquare className="h-4 w-4" />

              <>{textsApoie.suporte}</>
            </Link>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border-soft px-3 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${window.location.origin}/apoiar`);
                  toast(textsApoie.compartilharCopiado, "success");
                } catch {
                  toast(textsApoie.compartilharErro, "error");
                }
              }}
            >
              <Share2 className="h-4 w-4" />

              <>{textsApoie.compartilhar}</>
            </button>
          </div>
        </section>

        <p className="pb-2 text-center text-xs text-text-subtle">{textsApoie.rodape}</p>
      </div>
    </AppContainer>
  );
}

const textsApoie = {
  badge: "Apoie o Énóis",
  titulo: "O Énóis é gratuito e livre. Quem puder, ajuda a manter assim.",
  subtitulo:
    "Sem anúncio, sem venda de dados e sem cobrança para usar. A rede é sustentada por quem acha que ela vale a pena — inclusive por quem só quer que ela continue existindo.",
  porQue: "Por que apoiar?",
  pixTitulo: "Doar com Pix",
  pixDescricao: "Escaneie o QR ou copie o código e cole no app do seu banco. Qualquer valor.",
  chaveRotulo: "Chave Pix (CNPJ)",
  copiar: "Copiar código Pix",
  copiado: "Copiado!",
  pixAviso:
    "Código estático, sem vencimento e sem valor fixo: você escolhe quanto doar na hora. Não é assinatura e não há contrapartida.",
  alemTitulo: "Além do dinheiro, tem outras formas de ajudar",
  alemDescricao:
    "Traga gente boa, publique o que você sabe, abra um feedback ou responda quem está chegando. A rede fica melhor com você dentro dela.",
  suporte: "Deixar um feedback",
  compartilhar: "Compartilhar esta página",
  compartilharCopiado: "Link copiado — manda para quem curte a ideia.",
  compartilharErro: "Não deu para copiar o link agora.",
  rodape: "Obrigado por manter o Énóis de pé. ❤",
};
