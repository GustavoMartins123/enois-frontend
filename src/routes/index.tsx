import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  Users,
  GraduationCap,
  MessageCircle,
  ArrowRight,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Conexão · Rede profissional gratuita e humana" },
      {
        name: "description",
        content:
          "Uma rede profissional diferente. Sem paywalls, sem métricas de vaidade. Apenas conexões reais, mentoria e conhecimento compartilhado, gratuito para sempre.",
      },
      { property: "og:title", content: "Conexão · Rede profissional gratuita e humana" },
      {
        property: "og:description",
        content: "Sua carreira merece um lugar seguro e gratuito para crescer.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              Conex<span className="gradient-text">ão</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#filosofia" className="transition-colors hover:text-foreground">
              Filosofia
            </a>
            <a href="#recursos" className="transition-colors hover:text-foreground">
              Recursos
            </a>
            <a href="#comunidade" className="transition-colors hover:text-foreground">
              Comunidade
            </a>
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link to="/entrar" search={{ tab: "login" }}>
              <Button variant="ghost" className="h-8 rounded-full px-3 text-sm">
                Entrar
              </Button>
            </Link>
            <Link to="/entrar" search={{ tab: "signup" }}>
              <Button className="h-8 rounded-full px-4 text-sm">
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "var(--gradient-soft)" }} />
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="mx-auto max-w-4xl px-4 pb-24 pt-20 text-center sm:pb-32 sm:pt-28">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card/70 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <Sparkles className="h-3 w-3" /> Uma rede profissional feita para pessoas
          </div>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Cresça na sua carreira
            <br />
            <span className="gradient-text">em um lugar seguro e gratuito</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground">
            Conexão conecta profissionais por conhecimento, mentoria e propósito, não por métricas
            de popularidade.
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">100% gratuito. Sem anúncios. Sem planos pagos.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/entrar" search={{ tab: "signup" }}>
              <Button size="lg" className="gap-2 rounded-full px-6">
                Entrar na comunidade <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/feed">
              <Button size="lg" variant="outline" className="rounded-full px-6">
                Explorar a plataforma
              </Button>
            </Link>
          </div>
          <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-primary/60" /> Sem métricas de vaidade
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary/60" /> Ambiente moderado e seguro
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary/60" /> Para sempre gratuito
            </span>
          </div>
        </div>
      </section>

      <section id="filosofia" className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Nossa filosofia</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Profissionalismo com <span className="gradient-text">coração</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Acreditamos que o crescimento profissional acontece quando pessoas se conectam de forma
              autêntica, sem barreiras, sem ruído, sem custo.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="surface-card p-6 text-center">
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" /> Sempre gratuito para todos os profissionais
            </p>
          </div>
        </div>
      </section>

      <section id="recursos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Na prática</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            O que você encontra aqui
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tudo o que você precisa para crescer profissionalmente, sem os excessos das redes tradicionais.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mx-auto max-w-xl">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Heart className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Sua carreira merece um espaço melhor
            </h2>
            <p className="mt-4 text-muted-foreground">
              Entre para uma comunidade que valoriza autenticidade, colaboração e aprendizado, sem
              pagar nada por isso. Sem planos, sem anúncios, sem surpresas.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/entrar" search={{ tab: "signup" }}>
                <Button size="lg" className="gap-2 rounded-full px-6">
                  Criar conta gratuita <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/entrar" search={{ tab: "login" }}>
                <Button size="lg" variant="outline" className="rounded-full px-6">
                  Já tenho conta
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground/60">
              Sem cartão de crédito · Sem anúncios · Sem plano premium · <strong>Para sempre grátis</strong>
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <p>© {new Date().getFullYear()} Conexão · Feito com cuidado para profissionais como você.</p>
          <div className="flex gap-5">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacidade
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Termos
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const values = [
  {
    icon: Heart,
    title: "Autenticidade",
    desc: "Perfis baseados em competências reais, não em palavras-chave ou conexões vazias.",
  },
  {
    icon: Users,
    title: "Colaboração",
    desc: "Um ambiente onde o sucesso é construído em conjunto, não às custas de outros.",
  },
  {
    icon: GraduationCap,
    title: "Aprendizado",
    desc: "Conhecimento compartilhado é a verdadeira moeda da plataforma.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança",
    desc: "Espaço moderado, livre de assédio, spam e autopromoção.",
  },
];

const features = [
  {
    icon: MessageCircle,
    title: "Discussões com profundidade",
    desc: "Conteúdo relevante e conversas significativas, sem algoritmo de engajamento vazio.",
  },
  {
    icon: GraduationCap,
    title: "Mentoria nativa",
    desc: "Encontre mentores verificados, agende sessões e acompanhe sua trilha de aprendizado.",
  },
  {
    icon: Heart,
    title: "Comunidades fortes",
    desc: "Grupos profissionais e fóruns temáticos para troca contínua entre pares.",
  },
  {
    icon: Users,
    title: "Conexões por afinidade",
    desc: "Sugestões baseadas em habilidades, objetivos e interesses, não em volume.",
  },
  {
    icon: ShieldCheck,
    title: "Recrutamento honesto",
    desc: "Match entre empresas e candidatos com transparência sobre faixa salarial e cultura.",
  },
  {
    icon: Sparkles,
    title: "Bem-estar digital",
    desc: "Notificações respeitosas e um ambiente que valoriza o seu tempo e atenção.",
  },
];
