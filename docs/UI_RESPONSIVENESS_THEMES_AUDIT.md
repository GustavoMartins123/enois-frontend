# Auditoria visual — todas as páginas, responsividade e temas

> **Status (2026-10-19):** em andamento — rodadas 1 a 24 executadas. O Lote B público está
> completo; restam as rotas/páginas protegidas (Lote A nos viewports novos, Lote B em 390px e
> Lote C em 1280px), que dependem de uma sessão fresca do Firefox.

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
| B | 22 rotas públicas (2640 combinações) | 390px | 60 × 2 | público completo; faltam as rotas protegidas |
| — | Rotas protegidas (Lote A nos viewports novos, Lote B em 390, Lote C em 1280) | todos | 60 × 2 | bloqueado por sessão expirada |
| C | `/`, `/perfil`, `/post/...`, `/developers`, `/vagas`, `/empresa/n-is`, `/games` (840 combinações) | 1280px | 60 × 2 | 7 páginas-chave concluídas; faltam 3 protegidas |

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

## Rodada 8 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote C (1280px):** 60 temas × 2 modos × `/post/post_7a1d...` e `/developers` = **240
  combinações, todas limpas** (contraste e overflow). Nenhum achado, nenhuma correção.
- **Cobertura do Lote C:** 4 páginas-chave concluídas (`/`, `/perfil`, `/post`, `/developers`) —
  **480 combinações**.
- **Próximo lote:** Lote C em `/vagas`, `/empresa` e `/games` (públicas); `/feed`, `/carteira` e
  `/marketplace` quando a sessão estiver fresca; Lote B nas rotas públicas restantes.

## Rodada 9 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote C (1280px):** 60 temas × 2 modos × `/vagas` e `/empresa/n-is` = **240 combinações, todas
  limpas** (contraste e overflow). Nenhum achado, nenhuma correção.
- **Cobertura do Lote C:** 6 páginas-chave concluídas — **720 combinações**. Faltam `/games`
  (pública) e `/feed`, `/carteira` e `/marketplace` (protegidas).
- **Próximo lote:** Lote C em `/games`; as três protegidas quando a sessão estiver fresca; Lote B
  nas rotas públicas restantes.

## Rodada 10 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote C (1280px):** `/games` × 60 temas × 2 modos = **120 combinações, todas limpas**. Fecha o
  Lote C público: 7 páginas-chave, **840 combinações**. Faltam só `/feed`, `/carteira` e
  `/marketplace` (protegidas, dependem de sessão fresca).
- **Lote B (390px):** `/sobre` e `/temas` = **240 combinações, todas limpas**. Cobertura acumulada:
  10 rotas / **1200 combinações**.
- **Próximo lote:** Lote B nas rotas públicas restantes (`/contato`, `/termos`, `/privacidade`,
  `/diretrizes`, `/entrar`, `/eventos`, `/games/aminadojava`, `/blog/...`, `/auth/*`, etc.); Lote C
  nas três protegidas e rotas protegidas nos viewports restantes quando houver sessão fresca.

## Rodada 11 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote B (390px):** `/contato` e `/termos` = **240 combinações, todas limpas**. Cobertura
  acumulada: 12 rotas / **1440 combinações**.
- **Próximo lote:** Lote B em `/privacidade` e `/diretrizes`; depois `/entrar`, `/eventos`,
  `/games/aminadojava`, `/blog/...` e `/auth/*`.

## Rodada 12 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote B (390px):** `/privacidade` e `/diretrizes` = **240 combinações, 239 limpas e 1 falso
  positivo transitório**: `listras-amarelas light /privacidade` apareceu uma vez sem `--primary`;
  repetido 3×, sempre 200 com as vars e sem overflow — corrida de renderização, não tema.
- **Cobertura do Lote B:** 14 rotas / **1680 combinações**.
- **Próximo lote:** Lote B em `/entrar`, `/eventos`, `/games/aminadojava`, `/blog/...` e `/auth/*`;
  Lote C nas três protegidas quando a sessão estiver fresca.

## Rodada 13 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote B (390px):** `/entrar` e `/games/aminadojava` = **240 combinações, 239 limpas e 1 falso
  positivo transitório**: `vaporwave light /entrar` marcou os botões Google/LinkedIn em 1.0:1 na
  primeira leitura; repetido, o texto `#f5e9ff` está sobre `rgba(43,16,85,0.75)` (**~12:1**) e sem
  overflow — corrida de renderização, não app.
- **Cobertura do Lote B:** 16 rotas / **1920 combinações**.
- **Próximo lote:** `/blog/...`, `/auth/reset`, `/auth/verify`, `/vagas/$jobId`, `/games` e
  `/eventos` (testa o redirect quando sem sessão); protegidas quando houver sessão fresca.

## Rodada 14 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote B (390px):** `/vagas/ext_Jobicy_155744` e `/blog/andre-marcondes-teixeira` = **240
  combinações, todas limpas** (contraste e overflow). Nenhum achado, nenhuma correção.
- **Cobertura do Lote B:** 18 rotas / **2160 combinações**.
- **Próximo lote:** `/auth/reset`, `/auth/verify`, `/games`, `/eventos` (redirect) e as protegidas
  quando houver sessão fresca.

## Rodada 15 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote B (390px):** `/auth/reset` e `/auth/verify` = **240 combinações, 239 limpas e 1 falso
  positivo transitório**: `vagao-noturno dark /auth/reset` apareceu uma vez sem `--primary`;
  repetido 3×, sempre 200 com as vars e sem overflow — corrida de renderização, não tema.
- **Cobertura do Lote B:** 20 rotas públicas / **2400 combinações**.
- **Próximo lote:** `/games` e `/eventos` fecham o Lote B público; as protegidas dependem de
  sessão fresca.

## Rodada 16 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote B (390px):** `/games` e `/eventos` = **240 combinações, 239 limpas e 1 falso positivo
  transitório**: `listras-amarelas light /games` apareceu uma vez sem `--primary`; repetido 3×,
  sempre 200 com as vars. `/eventos` sem sessão redireciona para `/entrar` — o layout testado foi
  o da tela de login, sem problemas.
- **Lote B público: completo** — 22 rotas / **2640 combinações**.
- **Pendência única:** rotas/páginas protegidas (Lote A nos viewports novos, Lote B em 390px e
  Lote C em 1280px) — dependem de uma sessão fresca do Firefox. O agendamento segue tentando a
  cada rodada.

## Rodada 17 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Regressão pública (estabilidade):** 22 rotas públicas × claro/escuro × 390/1280 = **88
  verificações, 87 limpas e 1 502 transitório** em `/privacidade` dark 1280 (sem overflow, com
  `--primary`); repetido 3×, sempre 200 e sem erro — ruído de rede.
- **Nenhuma correção.** O Lote B público segue completo (22 rotas / 2640 combinações) e o Lote C
  público tem 7 páginas (840 combinações).
- **Pendência única:** o lote protegido, dependente de sessão fresca do Firefox.

## Rodada 18 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Estados interativos públicos (390/1280):**
  - `/entrar`: alternância criar conta ↔ entrar funciona; campos de nome/e-mail e senha presentes;
    **zero overflow** nos dois viewports.
  - `/auth/callback` sem parâmetros: cai no estado de erro “Não foi possível concluir o login
    social”, **zero overflow**.
  - `/#proposta`: o link da landing rola até a seção com topo em **80px**, acima do header sticky
    (57px) — sem conteúdo escondido.
  - `/temas`: estado vazio correto (“Nenhum tema publicado ainda.”), **zero overflow**.
- **Nenhuma correção.** Continua pendente apenas o lote protegido (sessão expirada).

## Rodada 19 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Busca/filtros públicos (390/1280):** digitar “java” em `/vagas`, `/empresas` e `/games` não
  gera overflow nem erro de console; `/blogs` não tem busca (lista direta). Os estados de filtro
  continuam legíveis nos dois viewports.
- **Diálogo “Esqueci minha senha”:** abre pelo `/entrar?tab=login`, cabe inteiro na tela
  (358×288 em 390px; 448×288 em 1280px), **zero overflow** e dentro do viewport.
- **Nenhuma correção.** Continua pendente apenas o lote protegido.

## Rodada 20 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Stress de conteúdo longo (sintético, 390/768/1280):** injetei nomes/títulos sem espaço nos
  cards e no cabeçalho do perfil para achar a mesma classe de bug do `/rede`.
  - **Achado real:** o `h1` do nome no perfil era flex item com `min-width:auto`; a palavra longa
    não quebrava, o nome era clipado e o `h1` media 2072px. Corrigido com **`min-w-0`** no `h1`
    (commit `c554a00`).
  - **Verificado em produção:** `clientWidth=332`, `scrollWidth=332`, altura 196px (quebrou em
    várias linhas), sem overflow; classe final `min-w-0 break-words ...`.
  - `/empresas`, `/vagas` e `/blogs` não foram conclusivos no stress: os cards não usam os
    seletores testados (ou dependem de aba/dados carregados), então ficam para um teste dirigido,
    não como “limpos”.
- **Nenhuma outra correção.** Continua pendente apenas o lote protegido.

## Rodada 21 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Stress dirigido de conteúdo longo:**
  - **Achado real:** o `h1` do **detalhe da vaga** não quebrava palavra longa e estourava a página
    em **1815px** no mobile (`scrollWidth` 2116, `clientWidth` 272). Corrigido com
    `min-w-0 break-words` no `h1` (commit `87bf755`). **Verificado em produção:** 272px de largura,
    224px de altura (quebrou em várias linhas), **0 overflow**.
  - `/vagas` (lista): o título do card já usa `break-words`; o overflow do teste sintético vinha
    de rótulos estáticos (CTA/chip) que foram alongados artificialmente — **não é conteúdo de
    usuário**, então não é bug.
  - `/blogs`: 13 cards testados, zero overflow. `/empresas`: os cards externos não carregaram no
    teste (aba/dados) — inconclusivo, fica para um teste dirigido.
- **Nenhuma outra correção.** Continua pendente apenas o lote protegido.

## Rodada 22 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Stress dirigido em empresa, criador de jogos e blog:**
  - **Achado real:** o `h1` do **nome da empresa** (`/empresa/n-is`) era clipado (`clientWidth`
    2569, altura 32, sem quebra). Corrigido com `min-w-0 break-words` no `h1`; os `h1` de
    criador/jogo também ganharam a mesma proteção (commit `8766f7d`). **Verificado em produção:**
    332px de largura, 256px de altura (quebrou em várias linhas), **0 overflow**.
  - `/games/aminadojava` cai no catálogo (não há perfil de dev para esse username), então o
    overflow sintético ali era o título estático “Jogos”, não conteúdo de usuário.
  - `/blogs` (13 cards) e `/blog/andre...` sem overflow. `/empresas`: os cards externos não
    carregaram no teste; inconclusivo.
- **Nenhuma outra correção.** Continua pendente apenas o lote protegido.

## Rodada 23 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Regressão em celular deitado:** 22 rotas públicas × claro/escuro × **844×390** e **667×375**
  = **88 verificações, todas limpas** (overflow, console e HTTP). Nenhum achado.
- **Nenhuma correção.** Continua pendente apenas o lote protegido.

## Rodada 24 — 2026-10-19

- **Sessão:** ainda expirada; rotas protegidas seguem bloqueadas.
- **Lote B estendido a 320px:** 60 temas × 2 modos × `/` e `/perfil/aminadojava` em **320×568** =
  **240 combinações, todas limpas** (contraste e overflow). O tema padrão já tinha sido validado
  em 320 no Lote A; agora todos os temas também.
- **Nenhuma correção.** Continua pendente apenas o lote protegido.

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

## Rodada 25 — 2026-10-19 11:19

- **Sessão autenticada: FUNCIONOU.** O `data.sqlite` do Firefox foi atualizado às 10:58; o
  `session_token` respondeu `200` em `GET /api/me` (aminadojava). Pela primeira vez o lote
  protegido pôde ser executado de verdade em produção.
- **Lote protegido (A, ampliado):** 27 rotas × 2 viewports (390×844 e 1280×800) × claro/escuro =
  **108 verificações**. Rotas: `/blog/:user`, `/blogs`, `/bloqueados`, `/carteira`, `/comunidades`,
  `/comunidades/:id`, `/denuncias`, `/eventos`, `/feed`, `/games/:user`, `/games/:user/:slug`,
  `/games/painel`, `/jogos-diarios`, `/mensagens`, `/mentoria`, `/moderacao`, `/moderador`,
  `/penalidades`, `/perfil/:user`, `/post/:id`, `/rede`, `/salvos`, `/seguranca`, `/suporte`,
  `/temas`, `/vagas` e `/vagas/minhas`. IDs reais colhidos da API pública; `/moderacao/:reportId` e
  `/vagas/:jobId/candidaturas` ficaram fora por não haver denúncia/interna vaga no momento.
- **Achados reais (2 causas, 4 ocorrências):**
  - selo **Pergunta** (`bg-secondary/30 text-secondary-foreground`) e ícones de **mensagem** nas
    notificações: o `foreground` do secundário contrasta com o secundário **sólido**, mas não com
    os 30% sobre o cartão. Em blahaj escuro dava **1,1:1** (`#4a1420` sobre `#122334`) no `/feed` e
    no `/salvos`. Trocado para `text-text-strong` (a mesma solução já usada pelo selo MOMENT).
  - avatar de **artigo** usava a classe `text-article-text`, que **não existe** no mapa de cores
    (`--color-article-text` não é declarado); a cor era herdada e no escuro dava **1,3:1**.
    Corrigido para `text-user-article-text` (`--article-text`), a classe usada pelo avatar de
    ARTICLE.
- **Correção:** commit `d176b8e` (push em `main` às 11:19).
- **Verificação em produção:** o bundle servido já contém as duas classes corrigidas
  (`bg-user-article text-user-article-text` e `bg-secondary/30 text-text-strong` no chunk
  `post-card-*.js`). A conferência visual do lote protegido ficou bloqueada porque, depois do
  push, o token da sessão do Firefox expirou/rotacionou (os tokens rotacionados dentro do contexto
  efêmero do Playwright não voltam para o `session.json`); um novo `/api/me` respondeu `401` e o
  `/feed` redirecionou para `/entrar`. Sem credenciais não há como refazer o lote protegido nesta
  rodada — a correção está no ar e o lote completo (108 verificações) foi executado antes da
  expiração.

## Rodada 26 — 2026-10-19 12:2x

- **Sessão:** expirada de novo (`/api/me` 401); lote protegido bloqueado, segue o público.
- **Lote C ampliado:** `/empresas` em **1280×800**, 60 temas × claro/escuro = **120 combinações**.
  Medido overflow horizontal, presença real de `--background`/`--primary` e contraste WCAG
  (composição de alpha; sem falsos positivos de gradiente).
  - **117 limpas.** 3 acusações iniciais foram **corrida de renderização**, não bug: `win2000`
    claro/escuro caíram com “execution context destroyed” (a página recarregou durante a medição)
    e `aero-glass` claro leu as vars vazias antes de o tema aplicar. Reexecutadas com espera maior:
    `--background`/`--primary` presentes nos três (ex.: win2000 claro `#d4d0c8`/`#3a6ea5`,
    aero claro gradiente `#cfe4f7→#9cc2e8`/`#1e6bb8`) e **`sw=cw=1280`, zero overflow**.
- **Nenhuma correção de app.**
- **Deploy verificado:** o chunk `moderador-C5XiF0Ez.js` já é servido com as chamadas novas
  (`/admin/moderators` e `/moderation/sanction-proposals`), confirmando o rollout do painel.
- **Painel de moderador verificado em produção (sessão restaurada):** `/moderador` em 390 e 1280,
  tema escuro, 9 abas, **zero overflow**. Aba Candidaturas mostra “Adicionar moderador”, a lista de
  moderadores e a fila (`GET /api/admin/moderators` 200); aba Usuários mostra a punição direta do
  admin e “Votações abertas” (`GET /api/moderation/sanction-proposals` 200). `moderatorCount=2` e
  `minModeratorsForSanction=10`, então a votação está corretamente bloqueada antes do mínimo.
  Único erro de rede: `429` de um crop do CDN de mídia (externo, não é a página).
- **Próximo lote:** `/blogs` e `/eventos` em 1280 com os 60 temas; depois repetir a tentativa da
  sessão protegida.

## Rodada 27 — 2026-10-19 12:5x

- **Sessão:** válida de novo (cópia viva do Firefox, mtime 12:29). Lote protegido executado.
- **Lote A protegido COMPLETO:** as mesmas 27 rotas da rodada 25 nos **6 viewports restantes**
  (320×568, 414×896, 768×1024, 1024×768, 1440×900, 1920×1080) × claro/escuro =
  **324 verificações, ZERO problemas** (overflow horizontal, console/pageerror, requisições
  falhas, bounce para `/entrar` e variáveis de tema vazias). Somado à rodada 25, o Lote A
  protegido agora cobre os **9 viewports**.
- **Nenhuma correção de app.**
- **Próximo lote:** Lote B protegido — 60 temas × 2 modos a 390px nas rotas protegidas, começando
  por `/feed`, `/carteira` e `/marketplace`; depois `/blogs` e `/eventos` a 1280 com os 60 temas.

## Rodada 28 — 2026-10-19 13:40

- **Lote B protegido (início):** `/feed`, `/carteira` e `/marketplace` a **390×844**, nos 60 temas
  × claro/escuro (360 combinações). A sessão foi re-copiada do Firefox (mtime 13:04) e validada
  (`/api/me` 200) antes do lote.
- **Resultado:** os **45 primeiros temas** (todos os 12 base + 33 extras, até `deserto-ao-entardecer`)
  fecharam **270 combinações limpas** — zero overflow, contraste OK e variáveis de tema aplicadas.
- **Limitação ambiental:** a sessão expirou no tema 46 (`oceano`). As 90 combinações seguintes
  (e parte das 294 “limpas”) viraram `AUTH-BOUNCE` para `/entrar` ou `NAVERR` de contexto destruído;
  **não são bugs de layout**. As duas leituras de `CSS-VARS-VAZIAS` (`lavanda`, `tinta`) caíram já
  dentro da janela sem sessão e ficam inconclusivas, não como achado real.
- **Nenhuma correção de app.**
- **Próximo lote:** re-copiar a sessão viva e repetir os **15 temas restantes** (`oceano` → fim) nas
  três rotas; depois seguir para as demais rotas protegidas a 390px e `/blogs`/`/eventos` a 1280.

## Rodada 29 — 2026-10-19 13:50

- **Conclusão do lote iniciado na rodada 28:** os **15 temas restantes** (`oceano` → fim) em
  `/feed`, `/carteira` e `/marketplace` a 390×844 × claro/escuro = **90 verificações** (sessão
  re-copiada do Firefox e validada antes). **89 limpas, 1 achado real.**
  Com isso, essas três rotas protegidas estão cobertas nos **60 temas × 2 modos** (360 combos).
- **Achado real:** selo **Divertido** no `/feed`, tema **grafite escuro**, dava **1,74:1**
  (`#f5f7fa` sobre `#b6bfc7`). Causa: no `palette()`, quando o tema não declara `onAccent`, o
  `--accent-foreground` herdava `text.strong` — que é quase branco no escuro. O accent do grafite
  é cinza-claro, então branco-sobre-claro. É a mesma classe do selo Pergunta, mas no token do
  preenchimento.
- **Correção estrutural:** `--accent-foreground` sem `onAccent` agora é derivado por
  `readableForeground(accentRgb, 0)` (preto ou branco escolhido pela luminância do accent). Vale
  para qualquer tema, não só grafite. Commit `3c8d0d3`; eslint e `tsc --noEmit` sem erros novos.
- **Verificação em produção:** token novo servido (`--accent-foreground: oklch(0.16 0.02 0)`) e
  contraste medido no DOM real do `/feed` em **10,44:1**; a leitura antiga de 1,74:1 só apareceu
  durante o rollout, em pods velhos.
- **Próximo lote:** Lote B protegido das demais rotas a 390px (começando por `/perfil/aminadojava`,
  `/post/:id`, `/vagas`, `/eventos`, `/mensagens`), depois `/blogs` e `/eventos` a 1280.

## Rodada 30 — 2026-10-19 14:2x

- **Lote B protegido continua:** `/perfil/aminadojava` e `/post/post_396…` a 390×844 nos **60
  temas × claro/escuro** = **240 verificações, ZERO problemas** (overflow, contraste, variáveis
  de tema, console e sessão). Sessão válida durante todo o lote.
- **Nenhuma correção de app.**
- **Próximo lote:** `/vagas`, `/eventos` e `/mensagens` a 390px com os 60 temas; depois
  `/blogs` e `/eventos` a 1280.

## Rodada 31 — 2026-10-19 17:3x

- **Lote B protegido continua:** `/vagas` e `/eventos` a 390×844 nos 60 temas × claro/escuro
  = 240 verificações planejadas. **228 limpas, 12 achados — todos ambientais** (`AUTH-BOUNCE`/
  `NAVERR`): a sessão expirou por volta do tema 36 (`listras-amarelas`), e `/eventos` passou a
  redirecionar para `/entrar`. Nenhum problema de overflow, contraste ou tema aplicado.
- Os 35 primeiros temas fecharam as duas rotas limpas; com as rodadas 28-30, `/feed`, `/carteira`,
  `/marketplace`, `/perfil`, `/post`, `/vagas` e `/eventos` já têm cobertura de temas no mobile.
- **Nenhuma correção de app.**
- **Próximo lote:** re-copiar a sessão e fechar `/eventos` (temas 36-60) e `/mensagens`; depois as
  demais rotas protegidas.

## Rodada 32 — 2026-10-19 17:5x

- **Sessão protegida bloqueada:** a cópia do Firefox segue com mtime 17:18 e o access token
  responde 401; sem credencial nova não há como continuar as rotas logadas nesta rodada. Segui
  com o lote público.
- **Lote C público:** `/empresa/n-is` (detalhe da empresa) em **1280×800**, 60 temas × claro/escuro
  = **120 combinações, ZERO problemas** — overflow, contraste WCAG, `--background`/`--primary`
  aplicados, console e HTTP.
- **Nenhuma correção de app.**
- **Próximo lote:** `/eventos` (temas 36–60) e `/mensagens` quando houver sessão nova; no público,
  `/games/{user}/{slug}` e `/marketplace` a 1280 com os 60 temas.

## Rodada 33 — 2026-10-19 18:1x

- **Sessão protegida ainda bloqueada** (cópia de 17:18, `/api/me` 401). Lote público.
- **Lote C público:** `/games/aminadojava/https-kawaii-survivor-vercel-app` em **1280×800**, 60
  temas × claro/escuro = **120 combinações**. **119 limpas, 1 achado real.**
- **Achado:** no tema **silver-jonny escuro**, o rótulo “Jogo externo” usava `text-text-subtle`
  sobre o botão `bg-primary-soft` (#5f5a03), dando **2,81:1**. O texto sutil é calculado contra o
  fundo da página, não contra o soft.
- **Correção mínima:** o rótulo passou a usar `text-primary-text`, que é derivado justamente contra
  `--primary-soft`. Commit `fix(jogos)` (push `f5156df`), eslint/tsc sem erros novos.
- **Verificação em produção:** no DOM real, silver-jonny escuro, o rótulo agora mede **6,63:1**
  (as leituras de 2,81:1 eram pods antigos durante o rollout).
- **Próximo lote:** `/marketplace` a 1280 com os 60 temas; quando houver sessão, `/eventos`
  (temas 36–60) e `/mensagens`.
