import { Link, createFileRoute } from "@tanstack/react-router";

import { LegalLayout, LegalSection, LegalUpdated } from "@/components/legal-layout";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade · Énóis" },
      {
        name: "description",
        content:
          "Política de privacidade do Énóis — como coletamos, usamos e protegemos seus dados pessoais.",
      },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <LegalLayout>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Política de Privacidade</h1>
        <LegalUpdated date="15 de agosto de 2026" />
      </header>

      <LegalSection title="1. Quem somos">
        <p>
          Esta Política de Privacidade descreve como o Énóis ("nós", "nossa plataforma") coleta,
          usa, armazena e protege os dados pessoais de quem utiliza nossos serviços, em conformidade
          com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).
        </p>
      </LegalSection>

      <LegalSection title="2. Dados coletados">
        <p>Coletamos as seguintes categorias de dados:</p>
        <p>
          <strong>Dados fornecidos por você:</strong> nome, e-mail, senha (armazenada de forma
          criptografada), username, cargo, empresa, localização, biografia, habilidades, objetivos,
          links externos, foto e banner de perfil, experiências profissionais, formação acadêmica e
          certificações.
        </p>
        <p>
          <strong>Dados gerados pelo uso:</strong> posts, comentários, reações, mensagens, conexões,
          comunidades, candidaturas a vagas, sessões de mentoria, avaliações, notificações e
          preferências de tema.
        </p>
        <p>
          <strong>Dados técnicos:</strong> endereço IP, tipo de navegador e dispositivo, páginas
          acessadas e registros de atividade, utilizados para segurança e melhorias do serviço.
        </p>
      </LegalSection>

      <LegalSection title="3. Base legal e finalidades">
        <p>
          Tratamos seus dados com base no consentimento, na execução do contrato de uso, no legítimo
          interesse e no cumprimento de obrigações legais. Os dados são utilizados para:
        </p>
        <p>
          (a) criar e gerenciar sua conta; (b) exibir seu perfil e permitir interações entre
          usuários; (c) recomendar conexões, conteúdos e oportunidades; (d) permitir candidaturas a
          vagas e agendamento de mentorias; (e) enviar notificações e comunicados relevantes; (f)
          garantir segurança e prevenir fraudes; (g) cumprir obrigações legais.
        </p>
      </LegalSection>

      <LegalSection title="4. Compartilhamento de dados">
        <p>
          Não vendemos seus dados pessoais. Compartilhamos dados apenas: (a) com provedores de
          infraestrutura, hospedagem, armazenamento de mídia e envio de e-mails, que atuam como
          operadores em nosso nome; (b) com autoridades, quando exigido por lei ou ordem judicial;
          (c) entre outros usuários, conforme a visibilidade definida pelo próprio recurso (ex.:
          perfil público).
        </p>
      </LegalSection>

      <LegalSection title="5. Armazenamento e segurança">
        <p>
          Seus dados são armazenados em servidores protegidos, com criptografia em trânsito (TLS) e
          controles de acesso. Senhas são armazenadas com hash criptográfico. Apesar dos nossos
          esforços, nenhum sistema é 100% seguro; em caso de incidente, notificaremos as autoridades
          e os usuários afetados conforme exigido pela LGPD.
        </p>
      </LegalSection>

      <LegalSection title="6. Retenção">
        <p>
          Mantemos seus dados enquanto sua conta estiver ativa. Após solicitação de exclusão ou
          encerramento da conta, os dados serão removidos ou anonimizados, exceto quando a
          legislação exigir retenção por prazos específicos.
        </p>
      </LegalSection>

      <LegalSection title="7. Seus direitos">
        <p>
          Nos termos da LGPD, você pode solicitar: (a) confirmação da existência de tratamento; (b)
          acesso aos seus dados; (c) correção de dados incompletos ou desatualizados; (d)
          anonimização, bloqueio ou eliminação de dados desnecessários; (e) portabilidade dos dados;
          (f) revogação do consentimento; (g) informação sobre compartilhamento.
        </p>
        <p>
          Para exercer seus direitos, envie uma solicitação pelos canais de contato indicados na
          seção 10. Responderemos no prazo legal de até 15 dias.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies e tecnologias similares">
        <p>
          Utilizamos armazenamento local (localStorage) para manter sua sessão, preferências de tema
          e dados de autenticação. Não utilizamos cookies de publicidade de terceiros. Você pode
          limpar esses dados a qualquer momento pelas configurações do navegador, o que poderá
          encerrar sua sessão.
        </p>
      </LegalSection>

      <LegalSection title="9. Menores de idade">
        <p>
          A plataforma é destinada a maiores de 16 anos. Não coletamos intencionalmente dados de
          menores sem consentimento dos responsáveis. Se identificarmos esse caso, os dados serão
          removidos imediatamente.
        </p>
      </LegalSection>

      <LegalSection title="10. Contato e encarregado (DPO)">
        <p>
          Dúvidas sobre esta Política ou para exercer seus direitos, entre em contato pelo e-mail de
          suporte disponível na plataforma, indicando "LGPD" no assunto. Atenderemos sua solicitação
          no prazo legal.
        </p>
      </LegalSection>

      <LegalSection title="11. Alterações desta política">
        <p>
          Esta Política pode ser atualizada para refletir mudanças legais ou no serviço. A data de
          atualização estará sempre indicada no topo da página, e alterações relevantes serão
          comunicadas pela plataforma.
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
