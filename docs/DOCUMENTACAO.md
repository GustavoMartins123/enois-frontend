# Inventário de documentação

> **Este arquivo é o painel do esforço de documentação.** Cada rodada do agendamento (a cada 20
> minutos) marca o que foi documentado e registra o lote no log abaixo. Termina quando todos os
> itens estão ✅. Regras deste esforço: documentar o que **existe** (implementado e verificado, como
> manda o [`../AGENTS.md`](../AGENTS.md)); nada de segredo ou tática de defesa em texto público
> (descrever comportamento visível, nunca o mecanismo interno de proteção); commit por rodada.

## Como usar

- ⬜ pendente · 🔄 em andamento nesta rodada · ✅ documentado
- Nova página/feature que surgir entra nesta lista no mesmo commit do código.

## Documentos existentes

| Doc                              | Tema                          | Estado                                                  |
| -------------------------------- | ----------------------------- | ------------------------------------------------------- |
| `arquitetura.md`                 | Camadas, SSR, TanStack Router | ✅ (atualizar com painel de monitoramento)              |
| `rotas.md`                       | Todas as rotas                | 🔄 índice completo desta rodada; detalhes por página ⬜ |
| `api-modulos.md`                 | Módulos da API consumidos     | 🔄 revisar contra `src/lib/api/*`                       |
| `componentes.md`                 | Componentes principais        | 🔄 revisar contra `src/components/*`                    |
| `modelos-de-dados.md`            | Tipos e contratos             | 🔄 revisar contra `src/types/*`                         |
| `bibliotecas.md`                 | Dependências                  | ✅                                                      |
| `configuracao.md`                | Variáveis e ambiente          | ✅ (revisar PWA e push ⬜)                              |
| `jogos-integracao.md`            | Integração de jogos           | ✅                                                      |
| `temas.md` (novo)                | 60 coleções × 2 modos         | ✅                                                      |
| `push.md` (novo)                 | Web push e service worker     | ✅                                                      |
| `monitoramento-painel.md` (novo) | Abas, filtros, logs           | ✅                                                      |

## Log de rodadas

- **Rodada 1** (manual, 2026-10-24): inventário criado; índice completo de rotas (60+ páginas) no
  `rotas.md`; documentos novos: temas, push, monitoramento-painel.

## Como continuar

Este esforço continua por rodadas automáticas (20 em 20 minutos) enquanto houver itens pendentes.
Se uma rodada não estiver rodando: abra uma nova conversa e peça "retomar a documentação dos
módulos/páginas" — o agente lê este painel e segue daqui, marcando o log abaixo a cada rodada.
