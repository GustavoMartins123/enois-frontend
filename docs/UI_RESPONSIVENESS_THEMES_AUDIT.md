# Auditoria visual — todas as páginas, responsividade e temas

> **Status (2026-10-19):** em andamento — rodadas 1 a 7 executadas. A matriz ainda tem lotes
> pendentes (rotas protegidas nos viewports novos, Lote B nas demais rotas e Lote C nas 8 páginas
> restantes em 1280px).

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
| A | 23 em 390/768/1280 (rodada 1) + 17 públicas e 10 dinâmicas nos outros 6 viewports (rodada 2) | 320, 360, 390, 414, 768, 1024, 1280, 1440, 1920 | claro/escuro padrão | parcial — rotas protegidas nos viewports novos bloqueadas pela sessão expirada |
| B | `/`, `/empresas`, `/perfil/aminadojava`, `/post/...`, `/developers`, `/vagas`, `/empresa/n-is`, `/blogs` (960 combinações) | 390px | 60 × 2 | 8 rotas concluídas; faltam as demais |
| C | `/` e `/perfil/aminadojava` (240 reexecutadas; 9 corrigidos) | 1280px | 60 × 2 | 2 páginas-chave concluídas; faltam 8 |

## Rodada 1 — 2026-10-19

- **Ambiente:** produção, sessão real de `aminadojava` injetada no Playwright, sem ações de escrita.
- **Cobertura:** 23 rotas × 3 viewports (390×844, 768×1024, 1280×800) = **102 verificações**.
- **Resultado:** 0 HTTP ≠ 200; **2 overflows reais**; 3 erros de rede 502 transitórios; nenhum erro
  de console de aplicação (hidratação pré-existente filtrada).
- **Achado:** `/rede` com overflow de **387px em 390px** e **21px em 768px**. Causa: o card da grade
  crescia pelo `min-content` de um nome longo sem quebra (`min-width:auto`), a mesma armadilha do
  card de membros.
- **Correção:** `min-w-0` no card/coluna e `break-words` nos links do nome — commit `0aa50f5`
  (cherry-pick de `4e8c408`). **Re-teste em produção: 0px de overflow em 390px e 768px** após o
  rollout.
- **Painel central (mesma data):** 9 abas renderizadas em 390 e 1280, zero overflow e zero erros;
  formulário de suporte com as 5 categorias em 390, zero overflow.
- **Ruído:** três `502` em recursos (developers, feed, mentoria) sem impacto de layout; erros de
  hidratação (`#418/#423`) são pré-existentes e foram filtrados.
- **Próximo lote:** repetir `/rede` nos viewports restantes; rotas dinâmicas (jogos, vagas,
  comunidades, grupos, blog); depois Lote B (60 temas × 2 modos a 390px).

## Rodada 2 — 2026-10-19

- **Sessão:** a cópia do Firefox expirou (401 no access e no refresh); as rotas protegidas ficaram
  bloqueadas nesta rodada e foram testadas como visitante apenas para redirect/layout.
- **Cobertura:** 17 rotas públicas × 6 viewports restantes (320, 360, 414, 1024, 1440, 1920) +
  10 rotas dinâmicas públicas × 390/768/1280 = **132 verificações**.
- **Resultado:** 0 HTTP ≠ 200; **1 overflow real**; 18 redirects esperados para `/entrar` (rotas
  protegidas sem sessão); 401/404 de recursos são ruído de visitante.
- **Achado:** a home tinha **16px de overflow em 320px** — os dois botões de autenticação não
  cabiam ao lado da marca.
- **Correção:** "Entrar" some abaixo de 360px (o caminho continua no fluxo de criar conta, que abre
  as duas abas) e os paddings dos botões encolhem — commit `1eeb0e5` (cherry-pick de `21c6d6c`).
  **Re-teste: `scrollWidth` = 320 em um viewport de 320px** após o rollout.
- **Temas:** **240 combinações** (60 temas × 2 modos × `/` e `/empresas`) a 390px. **224 limpas +
  16 falsos positivos** de contraste: todos em temas com fundo em degradê (`vaporwave`, `synthwave`,
  `aero-glass`, `frutiger-aero`, `y2k`, `blahaj` dark). O auditor lia `backgroundColor` transparente
  e caía no branco; corrigindo a leitura para as paradas do `linear-gradient`, as 16 passam
  (**0 problemas reais**). A correção é do auditor (`/tmp/pwtest/theme-recheck.mjs`), não do app.
- **Próximo lote:** rotas protegidas nos viewports restantes com sessão fresca; Lote B nas demais
  rotas; Lote C em 1280px.

## Rodada 3 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas continuam bloqueadas nesta rodada.
- **Modo escuro real:** 10 rotas públicas × 390/1280 com `theme: "dark"` injetado = **20
  verificações, 0 problemas**. (O lote anterior com `colorScheme: dark` não muda o tema do app:
  o padrão é light; os 75 checks serviram só para confirmar layout, e os 401/404 de recursos são
  ruído de visitante.)
- **Lote B:** 60 temas × 2 modos × `/perfil/aminadojava` e `/post/...` a 390px = **240 combinações,
  239 limpas e 1 problema real**: em **blahaj light** a data do post (`#8ba4b5`) ficava em **2.5:1**
  sobre o fundo azul-claro. Trocada por `#6b8699` (**3.4:1** no pior ponto do degradê) — commit
  `a8c7d67` (cherry-pick de `3b92e05`). **Re-teste em produção: 3.66:1** sobre a superfície.
- **Transiente:** `/games/aminadojava` em 1280 apareceu uma vez sem CSS vars com um 502; repetido
  3× na sequência, sempre 200 e com as vars — ruído de rede, não bug.
- **Próximo lote:** Lote B nas rotas restantes; Lote C em 1280px; rotas protegidas quando a sessão
  do Firefox estiver fresca.

## Rodada 4 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote B:** 60 temas × 2 modos × `/developers` e `/vagas` a 390px = **240 combinações, 239
  limpas e 1 falso positivo transitório**: em `vaporwave light` a primeira leitura marcou três
  títulos em 1.0:1; a mesma página reavaliada com o tema já assentado mede `#f5e9ff` sobre
  `#2b1055` (**~12:1**) e não tem nenhum elemento abaixo de 3:1 — era corrida de renderização do
  auditor, não do app.
- **Próximo lote:** Lote B nas rotas públicas restantes; Lote C em 1280px; rotas protegidas com
  sessão fresca.

## Rodada 5 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote B:** 60 temas × 2 modos × `/empresa/n-is` e `/blogs` a 390px = **240 combinações, todas
  limpas** (contraste e overflow). Nenhum achado, nenhuma correção.
- **Cobertura acumulada do Lote B:** 8 rotas / **960 combinações**.
- **Próximo lote:** Lote B nas rotas públicas restantes; início do Lote C em 1280px; rotas
  protegidas com sessão fresca.

## Rodada 6 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote C (início, 1280px):** 60 temas × 2 modos × `/` e `/perfil/aminadojava` = **240
  combinações, 193 limpas e 47 problemas**:
  - **Selo "Momento" em 1.0–1.2:1** em ~20 temas/modos: o texto usava o `secondary-foreground`
    (cor do secundário CHEIO) sobre `bg-secondary/30` (um tom pálido). Trocado para
    `text-text-strong`, que contrasta nos dois modos (commit `b6528af`).
  - **Chips "Mentor disponível"/"Java"/"Spring Boot" em 2.8–3.0:1** em floresta, norte-frio,
    prompt-do-dos etc.: `bg-surface-2 + text-primary`; o `--primary-text` não era calculado contra
    a superfície-2. Agora ele entra na conta do `textSafeAccent` nos temas da galeria e nos
    personalizados (`palette()` + `buildAccentTokens`).
  - **1 exceção** em `estacao-preta light /perfil` (timeout de navegação); repetir na verificação.
- **Correções subsequentes (mesma rodada):**
  - `97f5b91`: cores translúcidas (`soft`/`muted` com alpha, como no Aero Glass) passam a ser
    compostas sobre o fundo antes do cálculo; a data do Y2K claro também foi escurecida.
  - `ecbef92`: o cálculo do `--primary-text` passou a considerar **todas as paradas** do fundo em
    degradê (o chip caía na parada mais escura, não na primeira).
  - `575d72d`: data do Aero Glass claro escurecida (`#6b84a0` → `#4a647f`).
- **Verificação:** os 47 combos com problema foram reexecutados: 45 passaram na primeira
  reexecução; os 2 restantes (Aero Glass light e Y2K light no `/perfil`) passaram após os commits
  acima. Reexecução focada final: **0 problemas**. A reexecução completa do Lote C desta página
  (240) entra no próximo lote para checar regressão.
- **Próximo lote:** reexecutar o Lote C completo de `/` e `/perfil` (240), seguir nas 8 páginas-chave
  restantes, Lote B nas rotas públicas restantes e rotas protegidas com sessão fresca.

## Rodada 7 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote C — reexecução completa (1280px):** 60 temas × 2 modos × `/` e `/perfil/aminadojava` =
  **240 combinações, 231 limpas e 9 problemas**:
  - **Datas de post** em 2.0–2.9:1 em luna, aero-glass, frutiger-aero, metro e neumorfismo
    (claro/escuro). O token era medido contra o fundo da página, mas a data vive dentro do
    **card**; o card pode ser translúcido. Correção sistêmica: o `palette()` compõe a superfície
    real e passa superfície + fundo ao `textSafeAccent` (`297701d`).
  - **frutiger-aero** continuou em 2.95:1 na parada mais escura do degradê; token escurecido
    (`#7fa0a8` → `#66828a`, 3.2:1) no `f594992`.
  - **Venus**: 1 leitura sem `--primary` e 2 timeouts; repetido 3×, sempre 200 com as vars — ruído
    de rede, não tema.
- **Verificação:** reexecução focada — luna, aero-glass, metro e neumorfismo light/dark **0
  problemas**; frutiger-aero com data `#66828a` (3.2:1 na parada escura). As 231 combinações que
  já estavam limpas não foram afetadas pela correção (ela é monotônica: só aumenta o contraste).
- **Próximo lote:** Lote C nas 8 páginas-chave restantes; Lote B nas rotas públicas restantes;
  rotas protegidas com sessão fresca.

## Achados e correções

- **Rodada 1 — `/rede`:** overflow de 387px em 390px e 21px em 768px (nome longo sem quebra
  esticava o card da grade). Corrigido com `min-w-0` + `break-words` (`0aa50f5`), verificado 0px.
- **Rodada 2 — home em 320px:** overflow de 16px no header (dois botões de autenticação não
  cabiam). "Entrar" some abaixo de 360px e paddings encolhem (`1eeb0e5`), verificado `sw=320`.
- **Rodada 2 — falso positivo de tema:** 16 combinações de temas com degradê acusaram contraste
  por leitura errada do fundo no auditor; nenhuma correção de app necessária. Auditor ajustado
  para ler as paradas do gradiente.

## Limitações

- A heurística de "Entrar" no corpo não serve para detectar sessão: páginas logadas ainda exibem
  SSR de visitante em alguns casos (hidratação pré-existente). A sessão foi validada por
  `/api/me` e pelo painel do moderador renderizado com as 9 abas.
- O lote 1 usou o tema padrão; todos os 60 temas entram nos lotes B/C.

## Conclusão (só quando)

1. Lotes A, B e C cobertos; zero problemas abertos (corrigidos e verificados em produção) e
   limitações ambientais documentadas.
2. Consolidar o super relatório neste arquivo.
3. `CronList` para localizar a automação, `CronDelete` para apagá-la.
4. Só então enviar o relatório final para a Mel, confirmando a exclusão do agendamento.
