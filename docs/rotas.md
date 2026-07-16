# Rotas

A aplicação possui 12 rotas gerenciadas pelo TanStack Router com SSR.

## `/` - Landing Page (`src/routes/index.tsx`)

Página de marketing pública. Sem autenticação necessária.

**Componente:** `Landing()`

Seções:

- Header com navegação interna (Filosofia, Recursos, Comunidade)
- Hero com CTA para criar conta ou explorar
- Seção "Filosofia" com 4 valores (Autenticidade, Colaboração, Aprendizado, Segurança)
- Seção "Recursos" com 6 features (Discussões, Mentoria, Comunidades, Conexões, Recrutamento, Bem-estar digital)
- CTA final com criação de conta
- Footer

## `/feed` - Feed Principal (`src/routes/feed.tsx`)

**Auth:** Obrigatória (`requireAuth`)

**Componente:** `Home()`

Funcionalidades:

- **Compositor de posts** com textarea com @menção, seletor de tipo (INSIGHT, ARTICLE, QUESTION, PROJECT), upload de mídia (imagem/vídeo)
- **Abas de filtro:** Para você, Tudo, Seguindo, Discussões, Projetos
- **Feed infinito** de `PostCard` components
- **Sidebar direita:** Mini-perfil, sugestões de conexão, eventos

**Componentes auxiliares:**

- `ComposerAction()` - Botão de tipo de post no compositor
- `TabPill()` - Botão de aba de filtro

## `/entrar` - Login/Signup (`src/routes/entrar.tsx`)

Página pública de autenticação com duas abas.

**Parâmetros de busca:** `tab` = "login" | "signup" (default: "signup")

**Componente:** `Auth()`

- Sidebar com branding e depoimento
- Abas "Criar conta" / "Entrar"
- Botões SSO Google/Apple (placeholders não funcionais)
- Formulário de cadastro com validação Zod (name, email, password)
- Formulário de login com validação Zod (email, password)
- Salvamento de token no localStorage após sucesso

**Componentes auxiliares:**

- `TabBtn()` - Botão de alternância de aba
- `SocialButtons()` - Botões SSO
- `Divider()` - Divisor "ou com e-mail"
- `SignupForm()` - Formulário de cadastro
- `LoginForm()` - Formulário de login
- `Field()` - Wrapper de campo de formulário
- `GoogleIcon()` / `AppleIcon()` - Ícones SVG

## `/comunidades` - Lista de Comunidades (`src/routes/comunidades.tsx`)

**Auth:** Obrigatória

**Componente:** `Comunidades()`

- Filtro por tópico (Todas, TECNOLOGIA, ENGENHARIA, DESIGN, PRODUTO, LIDERANCA, CARREIRA, FREELANCE)
- Grid de cards de comunidades com cover, avatar, nome, descrição, membros
- Botão "Entrar"/"Participando" com mutation
- Load more com cursor
- Dialog de criação de comunidade (nome, descrição, tópico)

**Componentes auxiliares:**

- `CreateCommunityDialog()` - Dialog de criação

## `/comunidades/$communityId` - Detalhe da Comunidade (`src/routes/comunidades.$communityId.tsx`)

**Auth:** Obrigatória

**Loader:** Busca dados da comunidade, `notFound` se não existir

**Componente:** `CommunityDetail()`

- Cover, avatar, nome, descrição, tópico, membros
- Botão Entrar/Sair
- Admin pode editar (nome, descrição, cover, avatar com crop)
- Feed da comunidade com posts (membros podem postar)
- Lista de membros na sidebar

**Componentes auxiliares:**

- `EditCommunityForm()` - Formulário de edição da comunidade

## `/eventos` - Eventos (`src/routes/eventos.tsx`)

**Auth:** Obrigatória

**Componente:** `Eventos()`

- Grid de cards de eventos
- Card com data, formato (Online/Presencial/Híbrido), título, host, participantes
- Botão "Confirmar presença"
- Dialog de criação de evento (título, data, hora, realizador, formato)

**Componentes auxiliares:**

- `CreateEventForm()` - Formulário de criação de evento
- `Field()` - Wrapper de campo

## `/mensagens` - Mensagens (`src/routes/mensagens.tsx`)

Página pública (mostra layout mesmo sem auth, mas sem funcionalidade).

**Componente:** `Mensagens()`

- Layout de duas colunas: lista de conversas + chat
- Busca de contatos para iniciar conversa
- Criação de conversa com mutation
- Envio de mensagens com poll a cada 10s
- Scroll automático para últimas mensagens
- Marcação de lidas ao selecionar conversa

**Componentes auxiliares:**

- `ConversationItem()` - Item da lista de conversas
- `ConversationHeader()` - Cabeçalho do chat ativo
- `formatTime()` - Formata timestamp relativo

## `/mentoria` - Mentoria (`src/routes/mentoria.tsx`)

**Auth:** Obrigatória

**Componente:** `Mentoria()`

- Hero com explicação do programa de mentoria
- Grid de cards de mentores
- Card: avatar, nome, headline, especialidades, avaliação, sessões, preço, próximo horário
- Dono do perfil pode editar/excluir mentoria
- Dialog de cadastro como mentor (especialidades, preço)

**Componentes auxiliares:**

- `RegisterMentorForm()` - Formulário de cadastro de mentor
- `MentorCard()` - Card de mentor
- `EditMentorForm()` - Formulário de edição de mentor

## `/rede` - Rede de Conexões (`src/routes/rede.tsx`)

**Auth:** Obrigatória

**Componente:** `Rede()`

- Cards com estatísticas (conexões, seguindo, solicitações, sugestões)
- Solicitações pendentes (recebidas e enviadas) com aceitar/rejeitar/cancelar
- Grid de sugestões de conexão com avatar, nome, headline, interesses em comum
- Botão Conectar/Remover

**Componentes auxiliares:**

- `RequestCard()` - Card de solicitação de conexão
- `Stat()` - Card de estatística

## `/salvos` - Posts Salvos (`src/routes/salvos.tsx`)

**Auth:** Obrigatória

**Componente:** `SavedPosts()`

- Lista de posts salvos pelo usuário
- Empty state quando não há salvos
- Link de volta ao feed

## `/vagas` - Vagas (`src/routes/vagas.tsx`)

**Auth:** Obrigatória

**Componente:** `Vagas()`

- Filtros: query (texto), nível (Junior/Mid/Senior/Lead), local (Remoto/Híbrido/Presencial), tipo (CLT/PJ/Freelance/Intern), habilidades
- Grid de cards de vagas com título, empresa, logo, local, tipo, nível, salário, match score, skills
- Botão "Candidatar" com mutation
- Infinite scroll com IntersectionObserver

**Componentes auxiliares:**

- `formatPostedAt()` - Formata data de postagem
- `InfiniteScroll()` - Trigger de scroll infinito

## `/perfil/$username` - Perfil do Usuário (`src/routes/perfil.$username.tsx`)

Página pública (qualquer um pode ver). Loader busca dados ou `notFound`.

**Componente:** `Profile()`

- Banner editável com hover e crop
- Avatar editável com hover e crop
- Nome, headline, badges (openToWork, isMentor), empresa, local, conexões, reputação
- Seções: Sobre, Habilidades, Objetivos, Publicações
- Sidebar: Disponibilidade, Recomendar, Recomendações recebidas, Ranking, Links externos
- Dono do perfil: botão "Editar perfil" com dialog multi-aba
- Outros usuários: botões "Mensagem" e "Conectar"
- Recomendação com dialog

**Componentes auxiliares:**

- `Section()` - Wrapper de seção do perfil
- `RecommendationItem()` - Item de recomendação

## Tratamento de Erros por Rota

| Rota                        | NotFound                | ErrorComponent              |
| --------------------------- | ----------------------- | --------------------------- |
| `/comunidades/$communityId` | `notFound()` no loader  | -                           |
| `/perfil/$username`         | "Pessoa não encontrada" | "Não foi possível carregar" |
| `__root` (qualquer outra)   | 404 genérico            | Error boundary com reset    |
