import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Users,
  GraduationCap,
  Compass,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  Heart,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Conexão · Networking profissional humano" },
      {
        name: "description",
        content:
          "Plataforma de networking profissional com foco em conexões genuínas, mentoria e desenvolvimento de carreira.",
      },
      { property: "og:title", content: "Conexão · Networking profissional humano" },
      {
        property: "og:description",
        content: "Construa relacionamentos profissionais reais — não apenas conexões.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Conex<span className="gradient-text">ão</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#valores" className="hover:text-foreground">
              Valores
            </a>
            <a href="#recursos" className="hover:text-foreground">
              Recursos
            </a>
            <a href="#comunidade" className="hover:text-foreground">
              Comunidade
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/entrar" search={{ tab: "login" }} className="hidden sm:inline">
              <Button variant="ghost" className="rounded-full">
                Entrar
              </Button>
            </Link>
            <Link to="/entrar" search={{ tab: "signup" }}>
              <Button className="rounded-full">Criar conta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-soft)" }}
        />
        <div
          aria-hidden
          className="absolute -top-32 left-1/2 -z-10 h-[480px] w-[680px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Networking profissional, com humanidade
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Construa <span className="gradient-text">relacionamentos reais</span>,
            <br className="hidden sm:block" />
            não apenas conexões.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Conexão é onde profissionais trocam conhecimento, encontram mentoria e crescem juntos —
            sem performance, sem ruído.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/entrar" search={{ tab: "signup" }}>
              <Button size="lg" className="rounded-full gap-2 px-6">
                Comece grátis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/feed">
              <Button size="lg" variant="outline" className="rounded-full px-6">
                Explorar plataforma
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Sem cartão de crédito · Cancele quando quiser
          </p>

          {/* Hero card preview */}
          <div className="mx-auto mt-14 max-w-3xl">
            <div className="surface-card mx-auto p-2 shadow-[var(--shadow-card)]">
              <div className="rounded-xl bg-muted/50 p-5 text-left">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/15" />
                  <div className="flex-1">
                    <div className="h-3 w-32 rounded bg-foreground/15" />
                    <div className="mt-2 h-2.5 w-48 rounded bg-foreground/10" />
                  </div>
                  <span className="rounded-full bg-primary-soft px-2 py-1 text-[10px] font-medium text-primary">
                    Insight
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2.5 w-full rounded bg-foreground/10" />
                  <div className="h-2.5 w-11/12 rounded bg-foreground/10" />
                  <div className="h-2.5 w-3/4 rounded bg-foreground/10" />
                </div>
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3 w-3" /> 184
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> 32
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3" /> 96
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section id="recursos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Diferenciais</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tudo o que falta nas redes profissionais tradicionais.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Menos vaidade. Mais conhecimento, colaboração e relações de longo prazo.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="surface-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Valores */}
      <section id="valores" className="border-y border-border bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              Como pensamos
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Reputação é construída por{" "}
              <span className="gradient-text">conhecimento compartilhado</span>.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Nada de métricas de popularidade. Aqui você é reconhecido pela qualidade das suas
              contribuições, mentorias e participação em discussões.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Mentor Confiável",
                "Especialista Reconhecido",
                "Colaborador Ativo",
                "Líder de Comunidade",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-card border border-border px-3 py-1.5 text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <ul className="space-y-4">
            {values.map((v) => (
              <li key={v.title} className="surface-card flex items-start gap-4 p-5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-growth/15 text-growth">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{v.title}</p>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section id="comunidade" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div
          className="surface-card relative overflow-hidden p-10 text-center sm:p-16"
          style={{ background: "var(--gradient-primary)" }}
        >
          <h2 className="text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Sua próxima oportunidade começa numa boa conversa.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
            Junte-se a milhares de profissionais construindo carreira com propósito.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/entrar" search={{ tab: "signup" }}>
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full bg-card text-foreground hover:bg-card/90"
              >
                Criar conta gratuita
              </Button>
            </Link>
            <Link to="/entrar" search={{ tab: "login" }}>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full text-primary-foreground hover:bg-primary-foreground/10"
              >
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
          <p>© {new Date().getFullYear()} Conexão · Feito com cuidado.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">
              Privacidade
            </a>
            <a href="#" className="hover:text-foreground">
              Termos
            </a>
            <a href="#" className="hover:text-foreground">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: MessageCircle,
    title: "Discussões com profundidade",
    desc: "Algoritmo que favorece conteúdo relevante e conversas significativas, não engajamento vazio.",
  },
  {
    icon: GraduationCap,
    title: "Mentoria nativa",
    desc: "Encontre mentores verificados, agende sessões e acompanhe sua trilha de aprendizado.",
  },
  {
    icon: Compass,
    title: "Comunidades fortes",
    desc: "Grupos profissionais e fóruns temáticos para troca contínua entre pares.",
  },
  {
    icon: Users,
    title: "Conexões por afinidade",
    desc: "Sugestões baseadas em habilidades, objetivos e interesses — não em volume.",
  },
  {
    icon: ShieldCheck,
    title: "Recrutamento honesto",
    desc: "Match entre empresas e candidatos com transparência sobre faixa salarial e cultura.",
  },
  {
    icon: Sparkles,
    title: "Bem-estar digital",
    desc: "Notificações respeitosas e um ambiente que valoriza o seu tempo.",
  },
];

const values = [
  { title: "Autenticidade", desc: "Perfis baseados em competências reais, não em palavras-chave." },
  { title: "Colaboração", desc: "Ambiente menos competitivo, mais construído em conjunto." },
  { title: "Aprendizado contínuo", desc: "Conhecimento compartilhado é a moeda da plataforma." },
  { title: "Respeito profissional", desc: "Moderação ativa contra spam, autopromoção e ruído." },
];
