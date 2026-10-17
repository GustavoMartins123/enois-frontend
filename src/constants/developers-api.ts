/**
 * Catalogo da API publica do Énóis, usado pela pagina /developers.
 *
 * Conteudo tecnico de proposito fora do texts.ts (e referencia de engenharia, nao copy de
 * interface). Os exemplos de resposta sao REAIS, capturados da producao — nada ficticio.
 * Manter em sincronia com os controllers do backend: cada bloco novo de API entra aqui.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiEndpoint = {
  method: HttpMethod;
  path: string;
  /** public = nao pede sessao; auth = sessao do Énóis; admin = sessao de administrador. */
  access: "public" | "auth" | "admin";
  description: string;
  request?: string;
  response?: string;
};

export type ApiSection = {
  id: string;
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
};

export type ApiUseCase = {
  id: string;
  title: string;
  description: string;
  /** Passos em curl (ou nota curta) — a sequencia executa de ponta a ponta. */
  steps: { note: string; code?: string }[];
};

const P = "https://enois.ia.br/api";

export const API_BASE_URL = P;

export const apiSections: ApiSection[] = [
  {
    id: "auth",
    title: "Autenticação e conta",
    description:
      "A sessão do Énóis é o mesmo token que o app usa. Cadastro nasce pendente de confirmação de e-mail; login responde o token que autentica todas as outras rotas pelo header X-Session-Token. Contas com segundo fator respondem um desafio (202) em vez do token.",
    endpoints: [
      {
        method: "POST",
        path: "/auth/signup",
        access: "public",
        description:
          "Cria a conta (18+, termos aceitos). O cadastro não emite sessão: envia e-mail de confirmação.",
        request: `curl -X POST ${P}/auth/signup \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: signup-1" \\
  -d '{"name":"Ada","email":"ada@exemplo.com","password":"senha-forte-1","acceptedTerms":true}'`,
        response: `201 Created
{"id":"user_…","email":"ada@exemplo.com","emailVerified":false}`,
      },
      {
        method: "POST",
        path: "/auth/email/verify",
        access: "public",
        description: "Confirma o e-mail com o token do link recebido. Depois disso o login funciona.",
        request: `curl -X POST ${P}/auth/email/verify \\
  -H "Content-Type: application/json" \\
  -d '{"token":"<token-do-email>"}'`,
      },
      {
        method: "POST",
        path: "/auth/login",
        access: "public",
        description:
          "Autentica com e-mail e senha e devolve a sessão. Com 2FA ativo, devolve 202 + desafio (conclua em /auth/2fa/verify).",
        request: `curl -X POST ${P}/auth/login \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: login-1" \\
  -d '{"email":"ada@exemplo.com","password":"senha-forte-1"}'`,
        response: `200 OK
{"token":"sess_…","refreshToken":"…","user":{"id":"user_…","name":"Ada","username":"ada"}}`,
      },
      {
        method: "POST",
        path: "/auth/2fa/verify",
        access: "public",
        description: "Conclui o login com o código do segundo fator (app autenticador ou e-mail).",
        response: `200 OK
{"token":"sess_…","refreshToken":"…"} `,
      },
      { method: "POST", path: "/auth/logout", access: "auth", description: "Encerra a sessão atual." },
      {
        method: "GET",
        path: "/me",
        access: "auth",
        description: "Perfil próprio: dados completos, reputação, estado de verificação e preferências.",
      },
    ],
  },
  {
    id: "feed",
    title: "Feed e publicações",
    description:
      "Leitura de publicação e comentários é pública (links compartilhados abrem sem conta). Escrever exige sessão. Posts podem ter mídia (mediaIds) e página em HTML (type PAGE, pageHtml) — a página renderiza em quadro isolado, sem script.",
    endpoints: [
      {
        method: "GET",
        path: "/feed",
        access: "auth",
        description:
          "Feed pessoal por aba: FOR_YOU (comunidades que você participa + posts fora de comunidade), FOLLOWING, ALL, DISCUSSIONS, RECENT, PROJECTS. Pagina por cursor.",
        request: `curl "${P}/feed?tab=FOR_YOU&limit=20" \\
  -H "X-Session-Token: $TOKEN"`,
        response: `200 OK
{"items":[{"id":"post_…","type":"INSIGHT","content":"…","counters":{"reactions":26,"comments":23,"saves":3,"shares":4},"createdAt":"2026-10-15T02:16:48Z"}],"nextCursor":"2026-10-15T02:16:48Z"}`,
      },
      {
        method: "GET",
        path: "/feed/posts/{postId}",
        access: "public",
        description: "Publicação completa: autor, contadores, mídia, comunidade (quando houver).",
        request: `curl ${P}/feed/posts/post_396a12bc2bc54ad3966829c751acb021`,
        response: `200 OK
{"id":"post_396a12bc…","authorId":"user_…","authorUsername":"aminadojava",
 "type":"INSIGHT","content":"Pessoal. Post pra coletar ideias…","tags":[],"mediaIds":[],
 "createdAt":"2026-10-15T02:16:48Z",
 "counters":{"reactions":26,"comments":23,"saves":3,"shares":4},
 "currentUserReaction":null,"communityId":null,"community":null}`,
      },
      {
        method: "GET",
        path: "/users/{username}/posts",
        access: "public",
        description: "Publicações de uma pessoa (perfil público).",
        request: `curl "${P}/users/aminadojava/posts?limit=10"`,
      },
      {
        method: "POST",
        path: "/feed/posts",
        access: "auth",
        description:
          "Publica. type: INSIGHT | QUESTION | PROJECT | PAGE. Média vai por mediaIds (ver Mídia); PAGE leva pageHtml. Em comunidades, mande communityId.",
        request: `curl -X POST ${P}/feed/posts \\
  -H "X-Session-Token: $TOKEN" -H "Idempotency-Key: post-1" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"INSIGHT","content":"Texto do post","tags":["java"],"mediaIds":[],"mentionedUserIds":[]}'`,
        response: `201 Created
{"id":"post_…","content":"Texto do post","createdAt":"…"}`,
      },
      {
        method: "PATCH",
        path: "/feed/posts/{postId}",
        access: "auth",
        description: "Edita o próprio post (marca como editado).",
      },
      {
        method: "DELETE",
        path: "/feed/posts/{postId}",
        access: "auth",
        description:
          "Exclui o próprio post (soft delete). POST /feed/posts/{postId}/restore desfaz; bulk-delete para vários.",
      },
      {
        method: "POST",
        path: "/feed/posts/{postId}/comments",
        access: "auth",
        description:
          "Comenta. Para responder, mande parentCommentId. Aceita até 4 mídias (mediaIds) — comentário pode ser só de mídia.",
        request: `curl -X POST ${P}/feed/posts/$POST_ID/comments \\
  -H "X-Session-Token: $TOKEN" -H "Idempotency-Key: c-1" \\
  -H "Content-Type: application/json" \\
  -d '{"content":"Concordo!","parentCommentId":null,"mediaIds":[],"mentionedUserIds":[]}'`,
        response: `201 Created
{"id":"comment_…","postId":"post_…","content":"Concordo!","mediaIds":[],"createdAt":"…"}`,
      },
      {
        method: "GET",
        path: "/feed/posts/{postId}/comments",
        access: "public",
        description: "Comentários (mais recentes primeiro), com respostas aninhadas por parentCommentId.",
        request: `curl "${P}/feed/posts/$POST_ID/comments?limit=20"`,
        response: `200 OK
{"items":[{"id":"comment_…","authorUsername":"sergio-de-souza-tomas",
  "content":"Opa eu notei que agora dá pra editar…","mediaIds":[],"createdAt":"2026-10-15T22:03:52Z"}],
 "nextCursor":"2026-10-15T22:03:52Z"}`,
      },
      {
        method: "POST",
        path: "/feed/posts/{postId}/reactions",
        access: "auth",
        description:
          "Reage ao post. Tipos: LIKE, LOVE, LAUGH, ROFL, WOW, SAD, ANGRY, DISGUST, SKEPTICAL, CELEBRATE, SUPPORT, INSIGHTFUL. Reagir de novo troca o tipo; DELETE remove. Mesmos verbos em …/comments/{commentId}/reactions.",
        request: `curl -X POST ${P}/feed/posts/$POST_ID/reactions \\
  -H "X-Session-Token: $TOKEN" -H "Idempotency-Key: r-1" \\
  -H "Content-Type: application/json" -d '{"type":"INSIGHTFUL"}'`,
      },
      {
        method: "GET",
        path: "/feed/posts/{postId}/reactions",
        access: "public",
        description: "Totais por tipo de reação.",
      },
      {
        method: "POST",
        path: "/feed/posts/{postId}/saves",
        access: "auth",
        description: "Salva o post (DELETE remove). Lista em GET /feed/saved.",
      },
      {
        method: "POST",
        path: "/feed/posts/{postId}/shares",
        access: "auth",
        description: "Registra compartilhamento (contador).",
      },
    ],
  },
  {
    id: "busca",
    title: "Busca",
    description: "Busca unificada por pessoas, publicações, comunidades e vagas.",
    endpoints: [
      {
        method: "GET",
        path: "/search",
        access: "public",
        description:
          "Busca por termo livre. Cada item tem type (users, posts, communities, jobs) e pode ser filtrado/roteado pelo cliente.",
        request: `curl "${P}/search?q=java&limit=10"`,
        response: `200 OK
{"items":[{"id":"user_…","type":"users","title":"JavaScript-chan","subtitle":"…","image":"…"}],
 "nextCursor":null}`,
      },
    ],
  },
  {
    id: "perfis",
    title: "Perfis e ranking",
    description:
      "Perfis públicos com experiência, formação, certificações e emblema. O ranking é calculado pela plataforma (reputação/atividade) e é público.",
    endpoints: [
      {
        method: "GET",
        path: "/users/{username}",
        access: "public",
        description: "Perfil público: headline, empresa, skills, experiências, emblema, capa em HTML (bannerHtml).",
        request: `curl ${P}/users/aminadojava`,
        response: `200 OK
{"id":"user_…","username":"aminadojava","name":"melissa monfre dos santos",
 "headline":"…","company":"…","skills":[…],"bioHtml":null,"bannerHtml":null,"openToWork":false}`,
      },
      { method: "GET", path: "/users/by-id/{userId}", access: "public", description: "Perfil por id." },
      {
        method: "GET",
        path: "/profile/ranking",
        access: "public",
        description: "Ranking de perfis mais relevantes da rede.",
        request: `curl ${P}/profile/ranking`,
        response: `200 OK
[{"id":"user_…","username":"lucas-matheus-florentino","name":"Lucas Matheus Florentino","skills":[…]}]`,
      },
      {
        method: "PATCH",
        path: "/me/profile",
        access: "auth",
        description:
          "Edita o próprio perfil (nome, headline, skills, bio, bioHtml, bannerHtml, emblema…). Experiências, educação e certificações têm CRUD próprio em /me/experiences, /me/education, /me/certifications.",
      },
    ],
  },
  {
    id: "comunidades",
    title: "Comunidades",
    description:
      "Listagem, detalhe e feed de comunidade são públicos; entrar, publicar e administrar pedem sessão. A capa pode ser foto (cover) ou HTML/CSS (bannerHtml) — mesma tubulação da capa de perfil.",
    endpoints: [
      {
        method: "GET",
        path: "/communities",
        access: "public",
        description: "Lista comunidades (topic para filtrar, cursor para paginar). Com sessão, joined reflete participação.",
        request: `curl "${P}/communities?limit=10"`,
        response: `200 OK
{"items":[{"id":"community_…","name":"Muita IA pouco $","description":"…","members":1,
 "topic":"TECNOLOGIA","cover":null,"bannerHtml":null,"joined":false}],"nextCursor":null}`,
      },
      { method: "GET", path: "/communities/{communityId}", access: "public", description: "Detalhe da comunidade." },
      {
        method: "GET",
        path: "/communities/{communityId}/feed",
        access: "public",
        description: "Feed de publicações da comunidade (mesma forma do feed).",
      },
      { method: "GET", path: "/communities/{communityId}/members", access: "public", description: "Membros e papéis (ADMIN)." },
      {
        method: "POST",
        path: "/communities/{communityId}/members",
        access: "auth",
        description: "Entra na comunidade (DELETE sai). Publicar nela: POST /feed/posts com communityId.",
      },
      {
        method: "POST",
        path: "/communities",
        access: "auth",
        description:
          "Cria comunidade (o criador vira ADMIN). PATCH edita; /transfer passa a administração; /favorite + /favorites para favoritas.",
      },
    ],
  },
  {
    id: "vagas",
    title: "Vagas",
    description:
      "Vagas internas (criadas na plataforma) e externas convivem na mesma listagem. Externas têm id com prefixo ext_, selo de plataforma (sourcePlatform) e URL da origem (sourceUrl) — o redirecionamento é sempre para quem publicou a vaga. Busca booleana: AND, OR, NOT, \"frase exata\" e parênteses no parâmetro query.",
    endpoints: [
      {
        method: "GET",
        path: "/jobs",
        access: "public",
        description:
          "Lista vagas. query (busca booleana no título), type, level, location e skills filtram só as internas (estruturais); sem filtros estruturais, externas entram junto.",
        request: `curl "${P}/jobs?query=java%20AND%20remoto&limit=20"`,
        response: `200 OK
{"items":[{"id":"ext_Remotive_2091144","title":"Content Reviewer - United States","company":"TELUS Digital",
 "location":"USA","postedAt":"2026-10-17T04:00:49Z","sourcePlatform":"Remotive",
 "sourceUrl":"https://remotive.com/remote-jobs/…"}],"nextCursor":null}`,
      },
      { method: "GET", path: "/jobs/{jobId}", access: "public", description: "Detalhe da vaga (interna ou externa)." },
      {
        method: "POST",
        path: "/jobs",
        access: "auth",
        description:
          "Publica vaga (reputação >= 150). PATCH edita, /close encerra, DELETE exclui. Candidaturas: POST /jobs/{id}/applications; status em PATCH /jobs/{id}/applications/{applicationId}; minhas candidaturas em GET /jobs/applications.",
      },
      {
        method: "GET",
        path: "/jobs/applications",
        access: "auth",
        description: "Candidaturas do próprio usuário (e as recebidas em GET /jobs/{jobId}/applications, para quem publicou).",
      },
    ],
  },
  {
    id: "eventos",
    title: "Eventos",
    description: "Vitrine de eventos profissionais. Eventos passados saem da vitrine e recusam RSVP; presença vira número agregado após 24h.",
    endpoints: [
      { method: "GET", path: "/events", access: "public", description: "Lista eventos (vitrine).",
        response: `200 OK
{"items":[{"id":"event_…","title":"…","date":"2029-12-31","time":"23:59","format":"ONLINE","attendees":2}]}` },
      { method: "GET", path: "/events/{eventId}", access: "public", description: "Detalhe do evento." },
      { method: "POST", path: "/events", access: "auth", description: "Cria evento." },
      { method: "POST", path: "/events/{eventId}/attendees", access: "auth", description: "Confirma presença (DELETE cancela)." },
    ],
  },
  {
    id: "mentoria",
    title: "Mentoria",
    description: "Mentores publicam horários livres; quem quer aprender pede sessão em um slot.",
    endpoints: [
      { method: "GET", path: "/mentors", access: "public", description: "Mentores e expertises.",
        response: `200 OK
{"items":[{"id":"mentor_…","expertise":["Pentest","RedTeam","Certificações"]}]}` },
      { method: "GET", path: "/mentors/{mentorId}/slots", access: "public", description: "Horários livres do mentor." },
      { method: "POST", path: "/mentors", access: "auth", description: "Torna-se mentor; POST /mentors/{id}/slots publica horários; /sessions pede/agenda sessão." },
    ],
  },
  {
    id: "estatisticas",
    title: "Estatísticas",
    description: "Números públicos e agregados da rede — sem dado pessoal.",
    endpoints: [
      {
        method: "GET",
        path: "/stats/community",
        access: "public",
        description: "Usuários ativos (janela de 30 dias) e total da rede.",
        request: `curl ${P}/stats/community`,
        response: `200 OK
{"activeUsers":1031,"totalUsers":1370,"windowDays":30,"computedAt":"2026-10-17T14:20:39Z"}`,
      },
    ],
  },
  {
    id: "rede",
    title: "Rede (conexões e bloqueios)",
    description: "Conexões bidirecionais com aceite; bloqueio é permanente e esconde os dois lados do feed, comentários, busca e sugestões.",
    endpoints: [
      { method: "GET", path: "/network/summary", access: "auth", description: "Resumo da sua rede (conexões, pendentes)." },
      { method: "GET", path: "/network/suggestions", access: "auth", description: "Sugestões por afinidade (não por volume)." },
      { method: "GET", path: "/network/requests", access: "auth", description: "Pedidos de conexão recebidos." },
      { method: "POST", path: "/network/connections/{targetUserId}", access: "auth", description: "Pedir conexão (PUT …/accept aceita; GET …/status consulta; DELETE desfaz)." },
      { method: "POST", path: "/network/blocks/{targetUserId}", access: "auth", description: "Bloqueia (DELETE desbloqueia; GET /network/blocks lista)." },
    ],
  },
  {
    id: "mensagens",
    title: "Mensagens",
    description: "Conversas diretas e de comunidade. Tudo aqui pede sessão — nada de mensagens é público.",
    endpoints: [
      { method: "GET", path: "/conversations", access: "auth", description: "Suas conversas (GET /conversations/search busca dentro delas)." },
      { method: "GET", path: "/conversations/{id}/messages", access: "auth", description: "Mensagens da conversa." },
      { method: "POST", path: "/conversations/{id}/messages", access: "auth", description: "Envia mensagem (reações em …/messages/{messageId}/reactions)." },
      { method: "POST", path: "/conversations/direct", access: "auth", description: "Abre (ou recupera) a conversa direta com alguém." },
      { method: "POST", path: "/conversations/{id}/read", access: "auth", description: "Marca como lida; /hide apaga para você (o outro lado mantém)." },
    ],
  },
  {
    id: "notificacoes",
    title: "Notificações e push",
    description: "Notificações no app e no celular (Web Push). Cada notificação traz href de destino no formato /api/….",
    endpoints: [
      { method: "GET", path: "/notifications", access: "auth", description: "Notificações do usuário (cursor)." },
      { method: "GET", path: "/push/config", access: "public", description: "Chaves públicas para assinar Web Push." },
      { method: "POST", path: "/push/subscriptions", access: "auth", description: "Registra a assinatura push do navegador (DELETE remove)." },
    ],
  },
  {
    id: "midia",
    title: "Mídia",
    description:
      "Upload em três passos: (1) pede a assinatura; (2) sobe o arquivo no endereço que a resposta indicar (S3 = PUT direto na signedUrl com os headers dados; ImageKit = multipart); (3) usa o mediaId no post/comentário/perfil. Ninguém precisa de chave de terceiros — a plataforma assina.",
    endpoints: [
      {
        method: "POST",
        path: "/media/uploads",
        access: "auth",
        description:
          "Passo 1. purpose: POST_IMAGE | POST_VIDEO | AVATAR | BANNER | COVER. Teto de 50MB por arquivo.",
        request: `curl -X POST ${P}/media/uploads \\
  -H "X-Session-Token: $TOKEN" -H "Idempotency-Key: up-1" \\
  -H "Content-Type: application/json" \\
  -d '{"fileName":"media/abc/foto.png","mimeType":"image/png","size":10240,"purpose":"POST_IMAGE"}'`,
        response: `201 Created
{"id":"media_…","cdnUrl":"https://…","uploadUrl":"https://…(assinada)","provider":"S3","uploadHeaders":{…}}`,
      },
      { method: "GET", path: "/media/{mediaId}", access: "public", description: "Passo 3 (leitura): metadados + cdnUrl para renderizar." },
      { method: "DELETE", path: "/media/{mediaId}", access: "auth", description: "Remove a mídia do dono." },
    ],
  },
  {
    id: "moderacao",
    title: "Denúncias, moderação e recursos",
    description:
      "Qualquer pessoa autenticada pode denunciar conteúdo; cada denúncia avisa o suporte por e-mail. Um sistema automático pré-tri por IA e, só em violação grave e inequívoca, restringe o autor — que pode recorrer. A decisão final é sempre humana: recurso aceito remove a restrição; negado converte em banimento.",
    endpoints: [
      {
        method: "POST",
        path: "/reports",
        access: "auth",
        description:
          "Denuncia. targetType: POST | COMMENT | USER | JOB; reason: AI_GENERATED, FAKE_CONTENT, SCAM, DISCRIMINATION, PREJUDICE, HARASSMENT, SPAM, VIOLENCE, COPYRIGHT, OTHER.",
        request: `curl -X POST ${P}/reports \\
  -H "X-Session-Token: $TOKEN" -H "Idempotency-Key: rep-1" \\
  -H "Content-Type: application/json" \\
  -d '{"targetType":"POST","targetId":"post_…","reason":"SCAM","description":"Parece golpe de investimento"}'`,
        response: `201 Created
{"id":"report_…","targetType":"POST","reason":"SCAM","status":"PENDING","createdAt":"…"}`,
      },
      { method: "GET", path: "/reports/mine", access: "auth", description: "Denúncias que VOCÊ fez (acompanhamento; sem dados de terceiros)." },
      {
        method: "GET",
        path: "/me/sanctions",
        access: "auth",
        description: "Penalidades da sua conta e o estado dos seus recursos.",
        response: `200 OK
{"sanctions":[{"id":"sanc_…","type":"RESTRICTION","status":"ACTIVE","reason":"…","createdAt":"…"}],
 "appeals":[{"id":"appl_…","status":"PENDING","message":"…"}]}`,
      },
      {
        method: "POST",
        path: "/me/sanctions/appeals",
        access: "auth",
        description: "Recorre da restrição ativa (um recurso pendente por vez; humano decide).",
        request: `curl -X POST ${P}/me/sanctions/appeals \\
  -H "X-Session-Token: $TOKEN" -H "Content-Type: application/json" \\
  -d '{"message":"Foi discussão técnica, não discriminação."}'`,
      },
      { method: "GET", path: "/admin/reports", access: "admin", description: "Fila de denúncias (approve aplica penalidade e remove conteúdo; dismiss arquiva)." },
      { method: "GET", path: "/admin/appeals", access: "admin", description: "Fila de recursos. POST /admin/appeals/{id}/approve libera; /deny converte em banimento (sessões revogadas)." },
    ],
  },
  {
    id: "conta",
    title: "Suporte e conta",
    description: "Canal de suporte responde por e-mail e fica no painel admin; exclusão de conta anonimiza o conteúdo (nada de dado pessoal órfão).",
    endpoints: [
      { method: "GET", path: "/support/config", access: "public", description: "Se o canal de suporte está aberto (e o e-mail público, quando houver)." },
      { method: "POST", path: "/support/requests", access: "auth", description: "Abre pedido de suporte (vai por e-mail ao time + fila /admin/support)." },
      { method: "PUT", path: "/me/theme", access: "auth", description: "Preferências de tema que acompanham a conta entre dispositivos." },
    ],
  },
];

export const apiUseCases: ApiUseCase[] = [
  {
    id: "widget",
    title: "Mostrar uma publicação do Énóis em outro site",
    description:
      "Um post público serve qualquer widget: leitura sem credencial, contadores e comentários inclusos. Roteiro de três chamadas, sem autenticação.",
    steps: [
      {
        note: "1. Busque o post (autor, contadores, mídia):",
        code: `curl ${P}/feed/posts/post_396a12bc2bc54ad3966829c751acb021`,
      },
      {
        note: "2. Busque a primeira página de comentários:",
        code: `curl "${P}/feed/posts/post_396a12bc2bc54ad3966829c751acb021/comments?limit=20"`,
      },
      {
        note: "3. Pagina enquanto houver nextCursor (mande o valor de volta em ?cursor=):",
        code: `curl "${P}/feed/posts/post_396a12bc2bc54ad3966829c751acb021/comments?cursor=<nextCursor>&limit=20"`,
      },
      {
        note: "Imagens de perfil e mídia vêm com caminho relativo — prefixe com https://enois.ia.br para renderizar.",
      },
    ],
  },
  {
    id: "vagas",
    title: "Mural de vagas com link para a origem",
    description:
      "A listagem junta vagas internas e agregadores públicos (Remotive, Jobicy, RemoteOK, Himalayas). Vagas externas têm id com prefixo ext_ e sempre uma sourceUrl — o clique vai para quem publicou a vaga.",
    steps: [
      { note: "1. Liste com busca booleana no título:", code: `curl "${P}/jobs?query=java%20AND%20(remoto%20OR%20h%C3%ADbrido)&limit=20"` },
      {
        note: "2. Separe as externas pelo prefixo do id e use a origem:",
        code: `# externa: id "ext_Remotive_2091144" -> sourcePlatform "Remotive" + sourceUrl para redirecionar
# interna: id "job_…"      -> aplicação pela própria API (requer sessão)`,
      },
      { note: "3. Pagine com nextCursor; filtros estruturais (type/level/location/skills) limitam a vagas internas." },
    ],
  },
  {
    id: "comunidade",
    title: "Feed de uma comunidade",
    description: "Conteúdo de uma comunidade específica, sem credencial — útil para site do evento ou da turma.",
    steps: [
      { note: "1. Encontre a comunidade:", code: `curl "${P}/communities?limit=20"` },
      { note: "2. Puxe o feed dela:", code: `curl "${P}/communities/$COMMUNITY_ID/feed?limit=20"` },
      { note: "3. Detalhe de cada post e comentários: mesmos endpoints do caso do widget." },
    ],
  },
  {
    id: "publicar",
    title: "Publicar com imagem (com sessão)",
    description: "Upload em três passos e depois a publicação. Funciona igual para comentário (mediaIds) e avatar.",
    steps: [
      { note: "1. Autentique-se e guarde o token:", code: `curl -X POST ${P}/auth/login -H "Content-Type: application/json" \\\n  -d '{"email":"ada@exemplo.com","password":"senha-forte-1"}'` },
      { note: "2. Peça a assinatura do upload:", code: `curl -X POST ${P}/media/uploads -H "X-Session-Token: $TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"fileName":"media/abc/foto.png","mimeType":"image/png","size":10240,"purpose":"POST_IMAGE"}'` },
      { note: "3. Suba o arquivo no uploadUrl que veio na resposta (PUT direto na S3 assinada, ou multipart no ImageKit)." },
      { note: "4. Publique com o mediaId:", code: `curl -X POST ${P}/feed/posts -H "X-Session-Token: $TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"type":"INSIGHT","content":"Olha isso","mediaIds":["media_…"]}'` },
    ],
  },
  {
    id: "dashboard",
    title: "Painel de saúde da rede",
    description: "Números públicos, agregados, sem dado pessoal — prontos para dashboard ou relatório.",
    steps: [
      { note: "1. Atividade da rede:", code: `curl ${P}/stats/community` },
      { note: "2. Ranking de perfis:", code: `curl ${P}/profile/ranking` },
      { note: "3. Pulso por tema:", code: `curl "${P}/search?q=ia&limit=50"` },
    ],
  },
  {
    id: "moderacao",
    title: "Integração de moderação (admins)",
    description:
      "Para ferramentas do próprio time: a fila de denúncias e de recursos é acessível por sessão de administrador (REDE_ADMIN_EMAILS). O banimento só acontece por recurso negado — decisão sempre humana.",
    steps: [
      { note: "1. Veja a fila de denúncias (já com a pré-triagem da IA no campo ai_triage):", code: `curl "${P}/admin/reports?limit=30" -H "X-Session-Token: $ADMIN_TOKEN"` },
      { note: "2. Decida uma denúncia:", code: `curl -X POST ${P}/admin/reports/$REPORT_ID/approve -H "X-Session-Token: $ADMIN_TOKEN" \\\n  -H "Content-Type: application/json" -d '{"note":"confirmado"}'` },
      { note: "3. Julgue recursos (aprovar libera; negar ban):", code: `curl -X POST ${P}/admin/appeals/$APPEAL_ID/approve -H "X-Session-Token: $ADMIN_TOKEN"` },
    ],
  },
];
