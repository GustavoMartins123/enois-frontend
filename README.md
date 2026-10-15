# Connect Grow

Connect Grow e uma plataforma de networking profissional focada em conexoes humanas, mentoria, comunidades, vagas e eventos.

## Stack

- React 19
- TanStack Start e TanStack Router
- TanStack Query
- Tailwind CSS 4
- Vite 7
- Nitro para deploy SSR

## Requisitos

- Node.js 22.12 ou superior
- npm

## Como rodar localmente

Instale as dependencias:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite vai mostrar a URL local no terminal, normalmente `http://localhost:8080`.

## Scripts

- `npm run dev`: inicia o ambiente local
- `npm run build`: gera o build de producao
- `npm run preview`: serve o build para validacao local
- `npm run lint`: executa o ESLint
- `npm run format`: formata os arquivos com Prettier

## Deploy na Vercel

O projeto usa TanStack Start com Nitro. Para a Vercel, o build precisa gerar output com o preset `vercel`; isso esta configurado em `vite.config.ts` via `nitro: { preset: "vercel" }`.

Tambem existe um `vercel.json` com `framework: "tanstack-start"` para ajudar a Vercel a detectar o framework corretamente.

Se o deploy buildar mas abrir uma pagina 404 da propria Vercel, confira:

- A versao do Node na Vercel deve ser 22.x, pois as versoes atuais do TanStack Start exigem Node 22.12+.
- O framework preset do projeto na Vercel deve estar como TanStack Start.
- O build command deve ser `npm run build`.
- Nao configure output directory manualmente; deixe a Vercel detectar pelo Nitro.

## Deploy em producao (EKS via GitOps)

O front de `enois.ia.br` **nao** roda na Vercel; ele roda no EKS junto do backend. Fluxo:

1. Push em `main` deste repositorio.
2. GitHub Actions (`.github/workflows/build-and-push.yml`) builda a imagem Docker
   (`Dockerfile`, `NITRO_PRESET=node-server`), publica no ECR
   (`818928662779.dkr.ecr.us-east-1.amazonaws.com/enois/frontend:<sha>`) e atualiza o manifesto em
   `florestaencantada/integration_gitops` → `clusters/forest-dev/applications/enois-app.yaml`.
3. O Argo CD faz o rollout (namespace `forest-apps`, Deployment `socialcoiso-front`).

O backend e acessado pelo mesmo host: o front chama `https://enois.ia.br/api/...`, o gateway roteia
`/api/*` para o backend (removendo o prefixo `/api`) e todo o resto para este front.

## Variaveis de ambiente

`VITE_*` sao embutidas no bundle em tempo de build (portanto publicas). `IMAGEKIT_PRIVATE_KEY` e segredo
e deve chegar **em runtime** como variavel de ambiente do container (a server function `getImageKitAuth`
le `process.env.IMAGEKIT_PRIVATE_KEY`).

| Variavel | Quando | Onde |
|---|---|---|
| `VITE_API_BACKEND` | build | `.env` versionado (`https://enois.ia.br/api`) |
| `VITE_IMAGEKIT_PUBLIC_KEY` | build | `.env` versionado (publica) |
| `VITE_IMAGEKIT_UPLOAD_URL` | build | `.env` versionado |
| `VITE_IMAGEKIT_URL_ENDPOINT` | build | `.env` versionado |
| `IMAGEKIT_PRIVATE_KEY` | runtime | **Secret do container — nunca commitar** |

## Acoes manuais necessarias

1. **Rotacionar a `IMAGEKIT_PRIVATE_KEY`.** Ela estava commitada em `.env` e ja foi exposta no historico do
   Git. Gere uma nova no painel do ImageKit, revogue a antiga e configure a nova como variavel de ambiente
   do container (Secret no EKS). Ela foi removida do `.env` do HEAD, mas o historico continua com o valor.
2. **Conferir/atualizar `VITE_IMAGEKIT_PUBLIC_KEY` / `VITE_IMAGEKIT_URL_ENDPOINT`** em `.env`
   (`.env.example` traz o formato). `VITE_IMAGEKIT_URL_ENDPOINT` nao estava definida antes e caia no
   fallback hard-coded.
3. **Login social**: as credenciais (Google/Apple) ficam no **backend**; aqui nao ha nada a configurar
   alem do callback. O fluxo e: botao → `GET /api/auth/oauth/{provider}/start` → redirect para o provedor
   → volta em `${REDE_FRONTEND_URL}/auth/callback?token=...`, tratado por `src/routes/auth.callback.tsx`.
   Enquanto o backend nao tiver as credenciais, `start` responde 501 e a tela mostra o erro.
4. **Esqueci minha senha**: depende do SMTP configurado no backend; o link cai em `/auth/reset?token=...`
   (rota `src/routes/auth.reset.tsx`, ja existente).
5. **Conta**: a troca de e-mail ja tem UI (`change-email-dialog`, usa `POST /api/auth/email/change`).
   Troca de senha (`POST /api/auth/password/change`) e exclusao de conta
   (`POST /api/auth/account/delete`) existem no backend mas **ainda nao tem tela**.
