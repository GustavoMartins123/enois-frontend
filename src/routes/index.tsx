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

import { BaseLayout } from '../components/layouts';
import { Navbar } from '../components/Navbar';
import { Rodape } from '../components/Rodape';
import { Hero } from '../components/Hero';
import { ProblemSection } from '../components/Problema';
import { OpenLetterSection } from '../components/CartaAberta';
import { MidCTASection } from '../components/CTAIntermediario';
import { FAQSection } from '../components/FAQ';
import { FooterCTASection } from '../components/Rodape';

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
    <>
      <BaseLayout>
        <Hero />
        <ProblemSection />
        <OpenLetterSection />
        <MidCTASection />
        <FAQSection />
        <FooterCTASection />
      </BaseLayout>

    </>

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
