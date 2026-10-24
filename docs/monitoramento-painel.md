# Painel de monitoramento

O painel de moderação (`/moderador`) tem uma aba de **monitoramento** para acompanhar a saúde da
plataforma em tempo real.

## O que mostra

- **KPIs da janela escolhida** (15 min, 1 h, 6 h, 24 h): requisições, taxa de erro (4xx/5xx),
  cadastros, logins, tentativas bloqueadas (rate limit, captcha, origem).
- **Séries temporais** por minuto dos mesmos indicadores.
- **Top listas**: rotas mais batidas, IPs e origens com mais recusas.
- **Filtros** por tipo de evento, para achar o padrão antes de escalar.

## De onde vêm os dados

- Backend expõe os agregados só para admin/moderador autenticado (mesma guarda do painel).
- O log estruturado do backend (JSON por linha, ver `LOGGING.md` do backend) alimenta os
  contadores — o painel não lê texto livre, lê campos tipados (`requestId`, `rota`, `status`, `ip`).
- Saúde do serviço: `/health` (resumo) e `/metrics` (séries) do backend.

## Quando escalar

- Taxa de erro acima do normal **com** pico de recusas de origem → provável varredura/ataque
  (ver `SECURITY.md` do backend antes de agir).
- Cadastros em pico com captcha passando em série → suspeita de fazenda de contas.
- Qualquer ação de contenção segue o runbook de segurança do backend — o painel observa, não
  contém.
