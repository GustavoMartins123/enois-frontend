import { Link, createFileRoute } from "@tanstack/react-router";

import { LegalLastUpdated, LegalLayout, LegalSection } from "@/components/legal-layout";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso · Énóis" },
      {
        name: "description",
        content:
          "Termos de uso da rede profissional Énóis — regras de uso, conduta, conteúdo e responsabilidades.",
      },
    ],
  }),
  component: Termos,
});

function Termos() {
  return (
    <LegalLayout>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Termos de Uso</h1>
        <LegalLastUpdated date="15 de agosto de 2026" />
      </header>

      <LegalSection title="1. Aceitação dos termos">
        <p>
          Ao criar uma conta ou usar qualquer funcionalidade da plataforma Énóis ("plataforma"),
          você concorda com estes Termos de Uso. Se não concordar com qualquer parte deles, não
          utilize a plataforma.
        </p>
      </LegalSection>

      <LegalSection title="2. Definições">
        <p>
          "Usuário" é qualquer pessoa que crie uma conta na plataforma. "Conteúdo" é todo material
          publicado por usuários, incluindo posts, comentários, mensagens, fotos, vídeos, vagas e
          avaliações. "Plataforma" refere-se ao site e aplicativos do Énóis.
        </p>
      </LegalSection>

      <LegalSection title="3. Cadastro e conta">
        <p>
          Para usar a plataforma, você deve fornecer informações verdadeiras, completas e
          atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de
          acesso e por todas as atividades realizadas na sua conta.
        </p>
        <p>
          É proibido criar contas em nome de terceiros, criar múltiplas contas para burlar
          restrições ou fornecer informações falsas. Podemos suspender ou encerrar contas que violem
          estes termos.
        </p>
      </LegalSection>

      <LegalSection title="4. Conduta do usuário">
        <p>
          Você concorda em não usar a plataforma para: (a) publicar conteúdo ilegal, difamatório,
          discriminatório, assediador ou que incite violência; (b) violar direitos de propriedade
          intelectual de terceiros; (c) enviar spam, phishing ou conteúdo malicioso; (d) tentar
          acessar sistemas ou contas de outros usuários sem autorização; (e) coletar dados de
          usuários sem consentimento.
        </p>
        <p>
          Publicações que violem a conduta podem ser removidas e a conta do infrator suspensa ou
          encerrada, sem prejuízo de medidas legais cabíveis.
        </p>
      </LegalSection>

      <LegalSection title="5. Conteúdo publicado">
        <p>
          Você mantém a titularidade do conteúdo que publica, mas concede à plataforma uma licença
          mundial, não exclusiva e gratuita para armazenar, processar e exibir esse conteúdo para
          operar e melhorar o serviço.
        </p>
        <p>
          Ao publicar, você declara ter os direitos necessários sobre o conteúdo e que ele não viola
          direitos de terceiros. Conteúdo denunciado poderá ser analisado e removido pela equipe de
          moderação.
        </p>
      </LegalSection>

      <LegalSection title="6. Vagas e oportunidades">
        <p>
          As vagas e oportunidades publicadas na plataforma são de responsabilidade de quem as
          publica. O Énóis não garante a veracidade das ofertas nem realiza intermediação de
          contratação, atuando apenas como meio de divulgação.
        </p>
      </LegalSection>

      <LegalSection title="7. Serviços de terceiros">
        <p>
          A plataforma pode integrar serviços de terceiros, como provedores de mídia, hospedagem de
          arquivos e autenticação. Esses serviços possuem seus próprios termos e políticas, que
          devem ser consultados diretamente com os respectivos provedores.
        </p>
      </LegalSection>

      <LegalSection title="8. Disponibilidade e alterações">
        <p>
          Buscamos manter a plataforma disponível, mas não garantimos disponibilidade ininterrupta
          ou livre de erros. Podemos alterar, suspender ou descontinuar funcionalidades a qualquer
          momento, com ou sem aviso prévio.
        </p>
        <p>
          Estes Termos podem ser atualizados periodicamente. Alterações significativas serão
          comunicadas pela plataforma. O uso continuado após a publicação de alterações constitui
          aceitação dos novos termos.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitação de responsabilidade">
        <p>
          Na máxima extensão permitida por lei, o Énóis não se responsabiliza por danos indiretos,
          incidentais ou consequenciais decorrentes do uso da plataforma, incluindo perda de dados,
          lucros ou oportunidades profissionais. A plataforma não garante resultados profissionais
          específicos, como contratações ou conexões.
        </p>
      </LegalSection>

      <LegalSection title="10. Encerramento">
        <p>
          Você pode encerrar sua conta a qualquer momento. Podemos suspender ou encerrar sua conta
          se identificarmos violação destes Termos, conduta prejudicial à comunidade ou risco legal.
          Ao encerrar, seu perfil deixará de ser exibido, mas conteúdo publicado poderá permanecer
          conforme permitido por lei.
        </p>
      </LegalSection>

      <LegalSection title="11. Legislação aplicável">
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Eventuais disputas
          serão resolvidas no foro da comarca da sede da plataforma, com preferência por meios
          alternativos de resolução de conflitos.
        </p>
      </LegalSection>

      <LegalSection title="12. Contato">
        <p>
          Dúvidas sobre estes Termos podem ser enviadas pelo e-mail de suporte disponível na
          plataforma, ou via formulário de contato em nossas comunidades.
        </p>
      </LegalSection>

      <footer className="border-t border-border pt-6 text-sm">
        <p>
          Voltar para a{" "}
          <Link to="/" className="text-primary hover:underline">
            página inicial
          </Link>
        </p>
      </footer>
    </LegalLayout>
  );
}
