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
