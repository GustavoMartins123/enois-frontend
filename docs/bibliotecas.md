# Bibliotecas e Utilitários

## `src/lib/utils.ts` - Utilitário cn()

Função `cn()` que combina `clsx` (condicionais de classe) com `twMerge` (resolução de conflitos Tailwind).

```typescript
cn("px-4 py-2", isActive && "bg-primary", className);
```

## `src/lib/use-auth.ts` - Hook de Autenticação

**Funções:**
| Função | Descrição |
|---|---|
| `isAuthenticated()` | Verifica se session_token existe no localStorage |
| `useAuth()` | Hook que retorna `{ user, isLoading, isAuthenticated, requireAuth }` |

O hook usa React Query com chave `["me"]` para buscar o perfil atual. Desabilitado se não há token.

## `src/lib/require-auth.ts` - Guard de Autenticação

Função `requireAuth()` usada em `beforeLoad` das rotas. Redireciona para `/entrar?tab=login` se não há token.

## `src/lib/use-media-upload.ts` - Hook de Upload

Gerencia upload de mídia para ImageKit via backend.

**Estado:** `{ status: "idle" | "uploading" | "done" | "error", progress: number, error?: string }`

| Função                   | Descrição                                                         |
| ------------------------ | ----------------------------------------------------------------- |
| `upload(file, purpose?)` | Upload de arquivo único. Retorna `{ mediaId, cdnUrl }`            |
| `uploadAll(files[])`     | Upload sequencial de múltiplos arquivos. Retorna `UploadResult[]` |
| `reset()`                | Reseta estado para idle                                           |

**Funções auxiliares:**

- `sanitizeName(name)` - Remove caracteres especiais do nome
- `genFileName(file)` - Gera nome único com UUID

## `src/lib/config.server.ts` - Config Server-Side

Arquivo `.server.ts` que NÃO é bundlado no client.

| Função              | Descrição                                            |
| ------------------- | ---------------------------------------------------- |
| `getServerConfig()` | Retorna `{ nodeEnv }` lido de `process.env.NODE_ENV` |

## `src/lib/error-capture.ts` - Captura de Erros SSR

Captura erros não tratados (uncaught exception, unhandled rejection) para que o servidor SSR possa recuperá-los quando o h3 engole o erro original.

| Função                       | Descrição                       |
| ---------------------------- | ------------------------------- |
| `record(error)`              | Armazena erro com timestamp     |
| `consumeLastCapturedError()` | Recupera e limpa erro (TTL: 5s) |

## `src/lib/error-page.ts` - Página de Erro SSR

| Função              | Descrição                                                                             |
| ------------------- | ------------------------------------------------------------------------------------- |
| `renderErrorPage()` | Retorna string HTML de página de erro amigável com botão "Try again" e link "Go home" |

## `src/lib/lovable-error-reporting.ts` - Error Reporting

Integração opcional com Lovable para reportar erros do Error Boundary.

| Função                                | Descrição                                                  |
| ------------------------------------- | ---------------------------------------------------------- |
| `reportLovableError(error, context?)` | Reporta erro via `window.__lovableEvents.captureException` |

## `src/lib/mock-data.ts` - Dados Mock

885 linhas de dados realistas para desenvolvimento:

- 6 usuários
- 4 posts (INSIGHT, ARTICLE, QUESTION, PROJECT)
- 4 comentários
- 4 vagas
- 6 comunidades
- 3 eventos
- 3 mentores
- 5 conversas
- 6 notificações
- Ranking

Usado como fallback quando a API está offline (não funcional atualmente - todas as rotas consomem API real).

## `src/hooks/use-mobile.tsx` - Hook Mobile

Detecta breakpoint mobile (< 768px).

```typescript
const isMobile = useIsMobile(); // boolean
```
