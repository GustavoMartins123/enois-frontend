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

const CARTA = [
  {
    titulo: "Um papo reto com a comunidade",
    paragrafos: [
      "Cara, vamo lá. Precisamos conversar. Sobre o Énóis, sobre o que estamos construindo e sobre o tipo de internet que a gente quer ter de volta.",
    ],
  },
  {
    titulo: "Vamos falar da realidade",
    paragrafos: [
      "O Énóis é um projeto comunitário. Nosso servidor foi uma doação que recebemos, e sou muito grata por isso. Somos meia dúzia de pessoas tentando construir alguma coisa sem objetivo de lucro, trabalhando de graça e colocando dinheiro do próprio bolso quando dá.",
      "Não tem uma empresa bilionária bancando a operação. Não tem uma sala cheia de executivos decidindo como extrair mais alguns centavos de cada usuário. Tem gente trabalhando porque acredita que a internet pode ser diferente.",
      "E sim, nosso orçamento é o de uma coxinha. Às vezes nem sei se com refrigerante. Mas a gente está aqui. Fazendo o que consegue, melhorando o que dá e tentando construir algo que tenha um propósito além de gerar dinheiro.",
    ],
  },
  {
    titulo: "A internet que prometeram pra gente",
    paragrafos: [
      "Vocês já perceberam quantos temas gráficos do Énóis remetem aos sistemas antigos? Aquela estética não está ali só porque a gente gosta de computador velho. Embora eu goste mesmo. É saudade de uma internet que parecia nossa: em que as pessoas criavam sites, montavam comunidades, compartilhavam conhecimento e faziam coisas simplesmente porque tinham vontade. Sem precisar transformar tudo em marca pessoal, funil de vendas ou oportunidade de engajamento.",
      "A gente cresceu ouvindo que o futuro seria incrível, que a tecnologia aproximaria as pessoas e que a internet daria espaço pra todo mundo. Olha só onde fomos parar: algoritmos disputando nossa atenção, plataformas tratando usuários como números e pessoas precisando performar uma versão profissional de si mesmas até pra falar que o café esfriou.",
      "Eu não quero passar o resto da vida reclamando da internet que perdemos. Quero ajudar a construir a internet que gostaria de ter. Foi por isso que decidimos colocar a mão na massa. Não porque achamos que somos melhores que todo mundo, nem porque temos a fórmula mágica pra resolver os problemas da internet. Mas porque alguém precisa tentar.",
    ],
  },
  {
    titulo: "Sem vocês, isso aqui é só um site caro",
    paragrafos: [
      "Pode ter código bom, interface bonita, infraestrutura funcionando e um monte de funcionalidade. Sem pessoas, não existe comunidade. Existe só um site rodando num servidor consumindo dinheiro.",
      "Por isso, peço um pouco de compreensão. Estamos fazendo isso com os recursos que temos. Vai ter coisa que quebra, funcionalidade que demora e decisão que a gente vai precisar rever. Não vou fingir que está tudo perfeito. O que posso prometer é que estamos trabalhando pra melhorar e que queremos ouvir quem está aqui. A gente não precisa concordar em tudo, mas precisa conseguir conversar.",
    ],
  },
  {
    titulo: "Liberdade não é licença pra estragar o espaço dos outros",
    paragrafos: [
      "Quero uma rede livre. Não quero um ambiente engessado, onde qualquer opinião diferente vira motivo pra punição. Crítica faz parte. Discordar faz parte. Apontar nossos erros faz parte, e eu espero que vocês façam isso.",
      "Mas liberdade não é passe livre pra assediar pessoas, fazer spam, tentar derrubar a plataforma ou prejudicar a experiência de quem está aqui. Se vocês virem algo assim, denunciem. Nossa moderação leva essas situações a sério e precisa da ajuda de vocês pra identificar o que acontece na comunidade.",
      "Isso não significa que a responsabilidade da equipe seja de vocês. Significa que a comunidade pode ajudar a impedir que meia dúzia de pessoas estrague algo que centenas estão tentando construir. Não vamos tratar abuso como se fosse apenas mais uma opinião. E não vamos tratar toda discordância como abuso também. Existe uma diferença enorme entre as duas coisas.",
    ],
  },
  {
    titulo: "Eu não quero que ninguém aqui seja descartável",
    paragrafos: [
      "Quando minha conta do LinkedIn foi hackeada, o sujeito mudou a identidade do perfil pra identidade dele. E a resposta que recebi do suporte foi basicamente: “Que pena, crie outra conta”.",
      "Pensa nisso por um instante. Uma conta pode carregar anos de trabalho, contatos, conversas, oportunidades e uma parte enorme da história profissional de alguém. E a solução oferecida foi começar tudo de novo.",
      "É exatamente esse tipo de coisa que eu não quero reproduzir aqui. Não quero que alguém relate um problema e sinta que está falando com uma parede. Não quero que uma pessoa seja reduzida a um número de protocolo porque não vale o custo de atendimento de uma plataforma gigante.",
      "Talvez a gente não consiga resolver todos os problemas. Temos limitações reais. Mas podemos ouvir, investigar, dar retorno e tratar as pessoas com respeito. Cada usuário merece atenção. Cada desenvolvedor que compartilha seu trabalho merece reconhecimento. Cada pessoa merece ter espaço pra se expressar sem ser tratada como descartável.",
    ],
  },
  {
    titulo: "E ainda tem muita coisa vindo por aí",
    paragrafos: [
      "Estamos trabalhando em mais opções de personalização, inclusive na aba de Uso saudável. A ideia é permitir que vocês tenham mais controle sobre o que aparece na própria experiência. Quer escolher os assuntos que quer ver? Beleza. Quer evitar determinados conteúdos? Também. Quer desativar recursos que não fazem sentido pra você? É esse tipo de controle que queremos oferecer.",
      "Não acho que todo mundo precise usar a rede do mesmo jeito. Uma pessoa pode amar comunidades enquanto outra só quer conversar com os amigos. Alguém pode querer acompanhar vagas e eventos, enquanto outra pessoa quer publicar textos e trocar ideia sobre tecnologia. A plataforma deve dar espaço pra essas diferenças, não obrigar todo mundo a consumir a mesma coisa.",
    ],
  },
  {
    titulo: "Então, o que eu peço a vocês?",
    paragrafos: [
      "Participem. Falem o que está ruim. Sugiram melhorias. Denunciem problemas. Compartilhem o projeto. Se souberem programar, contribuam com o código. Se não souberem, participem mesmo assim.",
      "Não quero que vocês estejam aqui só pra consumir o que meia dúzia de pessoas publica. Quero que sintam que também podem ajudar a decidir os rumos desse espaço.",
      "Não temos o dinheiro das big techs, nem a estrutura delas. Temos um orçamento de coxinha e uma quantidade limitada de horas no dia. Mas temos a oportunidade de construir algo sem precisar colocar o lucro acima das pessoas. E, sinceramente, acho que vale a pena tentar.",
    ],
  },
  {
    titulo: "Vamo nessa",
    paragrafos: [
      "Não queremos mais uma big tech. Queremos humanidade. A internet não precisa ser só aquilo que fizeram dela. Ainda dá pra criar, colaborar, conversar e construir alguma coisa que seja nossa.",
      "A gente começou o trabalho. Agora, quero ver o que conseguimos fazer juntos. Vamo nessa. Énóis.",
    ],
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

        {/* Carta para a comunidade — conteúdo do post /post/post_3d0d9619913f42cbb5b8c0030ccd8805 */}
        <section className="surface-card space-y-4 p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {textsApoie.cartaEyebrow}
          </p>

          <h2 className="text-xl font-semibold tracking-tight text-text-strong">
            {textsApoie.cartaTitulo}
          </h2>

          {CARTA.map((bloco) => (
            <div
              key={bloco.titulo}
              className="space-y-2 border-t border-border-soft pt-4 first:border-0 first:pt-0"
            >
              <h3 className="text-sm font-semibold text-text-strong">{bloco.titulo}</h3>

              {bloco.paragrafos.map((paragrafo) => (
                <p key={paragrafo} className="text-sm leading-relaxed text-text-subtle">
                  {paragrafo}
                </p>
              ))}
            </div>
          ))}

          <a
            href="https://github.com/Rede-ENois"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-border-soft bg-surface-1 px-4 py-3 text-sm font-medium text-text-strong transition hover:border-primary hover:text-primary"
          >
            <span>
              <span className="block text-xs font-normal text-text-subtle">
                O código é de todo mundo
              </span>
              github.com/Rede-ENois
            </span>

            <span aria-hidden className="text-lg text-primary">
              ↗
            </span>
          </a>
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
  cartaEyebrow: "Carta para a comunidade",
  cartaTitulo: "Um papo reto sobre o Énóis",
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
  rodape: "Feito por pessoas, para pessoas. Obrigado por manter o Énóis de pé. ❤",
};
