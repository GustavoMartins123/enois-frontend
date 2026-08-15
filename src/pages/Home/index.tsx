import { MidCTASection } from "../../components/CTAIntermediario";
import { OpenLetterSection } from "../../components/CartaAberta";
import { FAQSection } from "../../components/FAQ";
import { Hero } from "../../components/Hero";
import { ProblemSection } from "../../components/Problema";
import { FooterCTASection } from "../../components/Rodape";

export const Home = () => {
  return (
    <>
      <Hero />
      <ProblemSection />
      <OpenLetterSection />
      <MidCTASection />
      <FAQSection />
      <FooterCTASection />
    </>
  );
};
