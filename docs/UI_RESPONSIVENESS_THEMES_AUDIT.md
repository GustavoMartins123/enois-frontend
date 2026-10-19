# Auditoria visual — todas as páginas, responsividade e temas

> **Status (2026-10-19):** auditoria ainda não iniciada. O agendamento precisa ser criado
> em uma **sessão nova** do flatt — esta sessão já pertence a uma tarefa agendada e o sistema
> recusa criar outra automação dentro dela. Este arquivo é a fonte de verdade do escopo e do
> progresso; a sessão nova deve lê-lo antes de começar e atualizá-lo a cada rodada.

## Objetivo

Testar no navegador **todas as rotas** do front em **todos os viewports**, com **todos os temas**
(claro e escuro), corrigir quebras de layout/responsividade/design e registrar achados, correções
e commits aqui. O super relatório para a Mel só sai quando a matriz estiver coberta e sem problema
corrigível em aberto — e **somente depois** de a automação ser apagada com `CronList` + `CronDelete`.

## Ambiente

- Front: `/home/mel/Documentos/connect-grow` (push em `main` = deploy automático).
- Backend: `/home/mel/Documentos/rede` (só se a correção exigir; seguir regras de migração).
- Produção: https://enois.ia.br.
- Playwright: `/tmp/pwtest` (rodar `cd /tmp/pwtest && node script.mjs`).
- Rotas: `src/routes/*.tsx` + `src/routeTree.gen.ts`; rotas dinâmicas usam IDs reais dos
  endpoints públicos.
- Sessão logada: método em `prod-session-from-firefox` — copiar o diretório `ls/` de
  `~/snap/firefox/common/.mozilla/firefox/v5zyf1j5.default-release-1/storage/default/https+++enois.ia.br/`,
  ler `session_token`/`refresh_token` do `data.sqlite` (se `compression_type == 1`,
  `zlib.decompress` antes do utf-8), validar com `GET /api/me` e renovar com
  `POST /api/auth/refresh`. **Nunca imprimir nem gravar tokens.**

## Matriz (em lotes)

- **Viewports:** 320×568, 360×800, 390×844, 414×896, 768×1024, 1024×768, 1280×800, 1440×900,
  1920×1080.
- **Temas:** todos os IDs de `src/constants/theme-collections.ts` +
  `theme-collections-extra.ts` (60), nos modos claro e escuro.
- **Lote A:** todas as rotas × todos os viewports, nos modos claro/escuro padrão.
- **Lote B:** todos os 60 temas × 2 modos × 390px em todas as rotas testáveis.
- **Lote C:** todos os 60 temas × 2 modos × 1280px nas páginas-chave: home, `/feed`,
  `/perfil/$username`, `/post/$postId`, `/carteira`, `/marketplace`, `/vagas`, `/empresa/$slug`,
  `/games`, `/developers`.

Injeção de tema: chaves standalone + `connect-grow-preferences.state.themeCollection` (receita do
auditor existente). Depois de aplicar, **confirmar** que as CSS vars (`--background`, `--primary`
etc.) mudaram de fato. Contraste calculado **dentro do `page.evaluate`** (WCAG; sinalizar <3:1).

## Checks por página

- overflow horizontal (`scrollWidth > clientWidth`);
- elementos cortados/sobrepostos, textos truncados, botões fora da tela;
- menus, popovers, dialogs, headers sticky, imagens, conteúdo longo;
- erros de console, `pageerror` e requisições falhas;
- tema realmente aplicado e contraste real.

**Em produção não executar ações de escrita/destrutivas** (criar post/conta, apagar, punir, votar
em denúncia). Admin/moderação: somente leitura visual.

## Correções e deploy

- Correção mínima e comprovada; **não tocar em workflows/GitOps manualmente**.
- `npx eslint` nos arquivos tocados; `npx tsc --noEmit` sem adicionar erros novos.
- Antes de stage, `git status` (outro agente pode estar na mesma árvore); stage só a correção.
- Commit → worktree de `origin/main` → cherry-pick → push em `main` (deploy automático) →
  verificar o chunk/página em produção após o rollout.
- Registrar SHA, verificação e evidências (screenshots em `/tmp/pwtest`) neste arquivo.

## Cobertura

| Lote | Rotas | Viewports | Temas | Status |
|---|---|---|---|---|
| A | — | — | claro/escuro padrão | pendente |
| B | — | 390px | 60 × 2 | pendente |
| C | 10 páginas-chave | 1280px | 60 × 2 | pendente |

## Achados e correções

_(preencher por rodada: data/hora, rota/viewport/tema, problema, correção, commit, verificação)_

## Limitações

_(rotas que não renderizarem logadas por hydration/sessão, com o motivo e o que foi validado no
lugar — SSR, chunk, API ou teste de integração. Não inventar verificação.)_

## Conclusão (só quando)

1. Lotes A, B e C cobertos; zero problemas abertos (corrigidos e verificados em produção) e
   limitações ambientais documentadas.
2. Consolidar o super relatório neste arquivo.
3. `CronList` para localizar a automação, `CronDelete` para apagá-la.
4. Só então enviar o relatório final para a Mel, confirmando a exclusão do agendamento.
