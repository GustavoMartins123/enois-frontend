# Configuração

## `.env` - Variáveis de Ambiente

```env
VITE_API_BACKEND=https://rede.fly.dev/api
VITE_IMAGEKIT_PUBLIC_KEY=public_...
VITE_IMAGEKIT_UPLOAD_URL=https://upload.imagekit.io/api/v1/files/upload
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/socialcoisa
IMAGEKIT_PRIVATE_KEY=private_...   # server-only
```

**Variáveis VITE_** são públicas e enviadas ao cliente.
**IMAGEKIT_PRIVATE_KEY** é server-only (usada em `imagekit-auth.fn.ts`).

## `package.json`

| Campo | Valor |
|---|---|
| name | `connect-grow` |
| type | `module` |
| engines.node | `>=22.12.0` |
| Scripts | dev, build, build:dev, preview, lint, format |

### Dependências Principais

| Dependência | Versão | Uso |
|---|---|---|
| react | ^19.2.0 | UI |
| @tanstack/react-query | ^5.83.0 | Server state |
| @tanstack/react-router | ^1.168.25 | Roteamento |
| @tanstack/react-start | ^1.167.50 | SSR |
| tailwindcss | ^4.2.1 | Estilização |
| zod | ^3.24.2 | Validação |
| react-hook-form | ^7.71.2 | Formulários |
| react-easy-crop | ^5.5.7 | Crop de imagem |
| lucide-react | ^0.575.0 | Ícones |
| sonner | ^2.0.7 | Toasts |
| date-fns | ^4.1.0 | Datas |
| recharts | ^2.15.4 | Gráficos |
| vaul | ^1.1.2 | Drawer mobile |

### Dev Dependencies

| Dependência | Versão | Uso |
|---|---|---|
| typescript | ^5.8.3 | TypeScript |
| vite | ^7.3.1 | Bundler |
| eslint | ^9.32.0 | Lint |
| prettier | ^3.7.3 | Formatação |
| nitro | 3.0.260603-beta | SSR |
| @vitejs/plugin-react | ^5.0.4 | React Vite plugin |

## `tsconfig.json`

- **target:** ES2022
- **module:** ES2022
- **jsx:** react-jsx
- **moduleResolution:** bundler
- **Path alias:** `@/` → `./src/`

## `vite.config.ts`

- Plugin: TanStack Router + React + Tailwind CSS v4
- SSR: Nitro com preset `vercel`
- Proxy: `/api` → `http://localhost:8081` em dev

## `eslint.config.js`

- TypeScript ESLint
- React Hooks plugin
- Prettier plugin
- Regra customizada: `import/no-restricted-paths` para `.server.ts`

## `.prettierrc`

```json
{
  "printWidth": 100,
  "semicolons": true,
  "singleQuote": false,
  "trailingCommas": "all"
}
```

## `components.json` (shadcn/ui)

- Style: New York
- Tailwind CSS v4
- `@/components` alias
- Lucide icons

## Deploy

### `vercel.json`
- Framework: `tanstack-start`
- Build command: `npm run build`
- Node 22.x necessário

### `fly.toml`
- Porta interna: 3000
- CPU: 1-2 vCPUs
- RAM: 1-2GB
- Região: gru (Brazil)

### `Dockerfile`
- Base: `node:22-alpine`
- Multi-stage (instalação separada de build)
- Nitro preset: `node-server`

### `docker-compose.yml`
- Porta mapeada: 3000:3000
- Variáveis de ambiente via `env_file`
