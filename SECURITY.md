# Segurança do Énóis (frontend)

## Reporte responsável de vulnerabilidades

Encontrou uma falha? **Não abra issue pública.** Envie para **seguranca@enois.ia.br** com:

- descrição do problema e o impacto potencial;
- passos para reproduzir (navegador, tela, sequência de cliques ou requisição mínima);
- se possível, uma prova de conceito que **não** acesse dados de terceiros nem cause indisponibilidade.

**Não** inclua em reportes, issues, prints ou PRs: dados pessoais de usuários, credenciais, tokens,
segredos de sessão ou detalhes exploráveis em público.

Retorno em até **5 dias úteis**. Pedimos um prazo de correção proporcional ao risco antes de qualquer
divulgação, e damos crédito a quem reportar, se quiser.

## Escopo

Em escopo: a aplicação em `enois.ia.br` (interface, sessão, renderização no servidor, quadro isolado
de HTML/CSS de terceiros, service worker, integrações oficiais no navegador).

Fora de escopo: engenharia social, phishing contra pessoas do time, DDoS/ataques de volume, e testes
contra infraestrutura de terceiros. Testes automatizados agressivos só com autorização prévia por
escrito.

## Como este projeto se protege (para quem for reportar)

Vale saber antes de reportar, para não confundir escolha com falha:

- **A sessão fica em `localStorage`, não em cookie** — não há CSRF de formulário; toda escrita manda
  o token em cabeçalho, e quem valida é o backend.
- **HTML/CSS colado por usuário roda em quadro isolado** (`sandbox` sem `allow-scripts` no modo
  embutido, CSP própria dentro do documento, sem rede). `allow-same-origin` existe só para o nosso
  código medir a altura do quadro — quem executa script é `allow-scripts`, que continua fora.
- **Nada crítico é decidido na tela.** Limite de caracteres, permissão, propriedade e regra de
  negócio são conferidos no backend; a interface só evita o erro antes dele acontecer.
- **A base da API vem do ambiente** (`VITE_API_BACKEND`), nunca de um endereço fixo no código.

O detalhamento do backend (contratos, autorização por recurso, integridade financeira) está no
`SECURITY.md` do repositório `enois-backend`.
