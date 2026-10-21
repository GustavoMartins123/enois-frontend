# Integração de jogos WebGL com o Énóis Games

O Énóis não hospeda jogos. O jogo continua no domínio do criador (por exemplo
`https://jogo.exemplo.com`) e a página `https://enois.ia.br/games/{criador}/{jogo}` o carrega num
`iframe` isolado. O jogo roda no navegador de quem joga; nada é transmitido como vídeo.

Qualquer jogo que abre numa URL `https` funciona: Unity WebGL, Godot HTML5, Three.js, Babylon.js,
WebAssembly ou HTML5 comum. A integração por `postMessage` descrita abaixo é **opcional** e não
exige SDK.

## 1. Hospedagem

- Sirva o jogo em **`https`**, num host público. O backend recusa `http`, IP privado, `localhost` e
  URL com usuário/senha.
- Use um endereço estável. Se a URL cadastrada redirecionar para outro domínio (por exemplo de
  `jogo.exemplo.com` para `www.jogo.exemplo.com`), o jogo ainda abre, mas as mensagens chegam de
  uma origem diferente da cadastrada e são ignoradas. Cadastre a URL final.
- Unity com compressão Brotli/Gzip: o servidor precisa enviar `Content-Encoding: br` (ou `gzip`) e
  `Content-Type: application/wasm` nos arquivos `.wasm.br`, como em qualquer hospedagem Unity.

## 2. Permitir a incorporação

O navegador só mostra o jogo dentro do Énóis se o **site do jogo** permitir. No documento HTML do
jogo (a página cadastrada):

```http
Content-Security-Policy: frame-ancestors 'self' https://enois.ia.br
```

e **não** envie `X-Frame-Options: DENY` nem `SAMEORIGIN`. O `X-Frame-Options` não aceita lista de
origens; `frame-ancestors` já cobre todos os navegadores atuais.

Exemplo: um jogo Unity WebGL que responde com

```http
content-security-policy: default-src 'self'; ...; frame-ancestors 'none'; ...
x-frame-options: DENY
```

Com esses cabeçalhos o jogo **não abre** dentro do Énóis; o player fica em "sem confirmação" e o
botão "Abrir no site do criador" continua funcionando. Para liberar, troque só estes dois pontos e
mantenha o resto da política:

```http
content-security-policy: default-src 'self'; ...; frame-ancestors 'self' https://enois.ia.br; ...
# remover: x-frame-options: DENY
```

O Énóis não contorna bloqueio de incorporação e não muda os próprios cabeçalhos de segurança para
acomodar um jogo.

## 3. Cadastro

No Énóis, em **Jogos → Enviar jogo**, informe o endereço `https` da página do jogo. O envio passa
pela moderação, que testa o jogo no mesmo player da página pública. Depois de publicado, a página
fica em `/games/{seu-usuario}/{slug}`.

## 4. Como o player funciona

Nada carrega sozinho: o quadro só é criado quando a pessoa aperta **Jogar**. O quadro usa:

```html
<iframe
  sandbox="allow-scripts allow-same-origin allow-pointer-lock"
  allow="fullscreen; gamepad; autoplay"
  referrerpolicy="no-referrer"
></iframe>
```

| Estado          | Quando                                                   | O que a pessoa vê                                              |
| --------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| Parado          | antes do clique                                          | botão Jogar                                                    |
| Carregando      | depois do clique, ou quando o jogo manda `enois:loading` | "Carregando o jogo…" e, se informado, a porcentagem            |
| Pronto          | o jogo mandou `enois:ready`                              | o jogo, com o foco do teclado nele                             |
| Sem confirmação | o quadro carregou e o jogo não falou o protocolo         | o jogo, com uma dica discreta sobre "Abrir no site do criador" |
| Erro            | o jogo mandou `enois:error`                              | a mensagem e o botão Tentar de novo                            |

O evento `load` do iframe não prova que o jogo iniciou (uma página que recusa quadro também dispara
`load`), e a falta de mensagens não é tratada como falha. Depois de 20 s carregando, a tela só avisa
que está demorando; **o quadro nunca é desmontado por tempo**. "Tentar de novo" recria o quadro.

A barra do player mantém **Tela cheia** (o pedido vai para o próprio quadro) e **Abrir no site do
criador**. Teclado, mouse, toque, gamepad e pointer lock chegam ao jogo; o player coloca o foco no
quadro quando ele carrega.

## 5. Mensagens do protocolo

Toda mensagem é um objeto com `type`. `version` é opcional (a atual é `1`); campos desconhecidos
são ignorados, então versões futuras podem acrescentar campos sem quebrar.

| Do jogo para o Énóis | Campos                                                                                                 | Efeito                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `enois:loading`      | `progress` opcional, número de 0 a 100                                                                 | estado "carregando", com a porcentagem               |
| `enois:ready`        | —                                                                                                      | estado "pronto"                                      |
| `enois:error`        | `message` opcional, texto (até 200 caracteres)                                                         | estado "erro" com a mensagem                         |
| `enois:identity`     | —                                                                                                      | pede o token de identidade do jogador                |
| `enois:share`        | `texto` (até 600), `imagem` opcional (`data:image/png\|jpeg\|webp\|gif;base64,…`, até ~2 MB)           | abre a prévia; publica só com o clique da pessoa     |
| `enois:spend`        | `amount` em milésimos de faísca (inteiro > 0; 1 faísca = 1000), `requestId` (texto), `motivo` opcional | abre a confirmação; debita só com o clique da pessoa |

| Do Énóis para o jogo | Campos                                     |
| -------------------- | ------------------------------------------ |
| `enois:identity`     | `token`: opaco, uso único, vale 15 minutos |

Mensagem com tipo, campo ou limite inválido é descartada sem efeito: `progress: 150`, `"50"` em vez
de `50`, `version: "1"`, `amount: -10`, imagem SVG. Enquanto um pedido de gasto ou de
compartilhamento está aberto, novos pedidos são ignorados — o jogo não consegue trocar o valor
debaixo do clique.

O Énóis só aceita a mensagem quando ela vem **da origem exata cadastrada** e **da janela do quadro
ativo**. Outras abas, outros quadros e o quadro antigo depois de "Tentar de novo" são ignorados.

## 6. Exemplos

### Enviar mensagens com origem explícita

Nunca use `"*"`: a mensagem iria para qualquer página que embutisse o seu jogo.

```js
const ENOIS_ORIGINS = new Set(["https://enois.ia.br"]);

function toEnois(message) {
  if (window.parent === window) return;
  for (const origin of ENOIS_ORIGINS) {
    window.parent.postMessage({ version: 1, ...message }, origin);
  }
}
```

O navegador descarta a mensagem cuja `targetOrigin` não é a da página pai, então mandar para cada
origem da lista entrega só para a certa.

### Progresso, pronto e erro (Unity WebGL)

No `index.html` (ou no script de bootstrap) do template:

```js
toEnois({ type: "enois:loading", progress: 0 });

createUnityInstance(canvas, config, (progress) => {
  toEnois({ type: "enois:loading", progress: Math.round(progress * 100) });
})
  .then((instance) => {
    toEnois({ type: "enois:ready" });
  })
  .catch((error) => {
    toEnois({ type: "enois:error", message: String(error).slice(0, 200) });
  });
```

O callback do Unity entrega de 0 a 1; o protocolo espera de 0 a 100.

### Godot 4 (HTML5)

```gdscript
func _ready() -> void:
    if OS.has_feature("web"):
        JavaScriptBridge.eval("""
            window.parent !== window && window.parent.postMessage(
                { type: 'enois:ready', version: 1 }, 'https://enois.ia.br')
        """)
```

### Three.js, Babylon.js ou HTML5

Mande `enois:ready` depois que os assets principais carregarem e o primeiro quadro for desenhado.

### Identidade do jogador

```js
window.addEventListener("message", (event) => {
  if (event.source !== window.parent || !ENOIS_ORIGINS.has(event.origin)) return;
  if (event.data?.type === "enois:identity" && typeof event.data.token === "string") {
    fetch("/minha-api/entrar-com-enois", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: event.data.token }),
    });
  }
});

toEnois({ type: "enois:identity" });
```

O **servidor do jogo** troca o token por um pseudônimo estável:

```http
POST https://enois.ia.br/api/games/tokens/validate
Content-Type: application/json

{ "token": "…" }
```

Resposta: `{ "gameId": "…", "playerRef": "plr_…" }`. O token vale uma vez e expira em 15 minutos;
quem joga sem estar logado não recebe token. O jogo nunca recebe a sessão do Énóis.

### Compartilhar e gastar

```js
toEnois({
  type: "enois:share",
  texto: "Cheguei no nível 10!",
  imagem: canvas.toDataURL("image/png"),
});
toEnois({ type: "enois:spend", amount: 5000, motivo: "Poção", requestId: crypto.randomUUID() });
```

Os dois só acontecem depois do clique da pessoa no diálogo do Énóis. `requestId` torna o débito
idempotente: repita o mesmo id se reenviar o mesmo pedido. `amount: 5000` aparece para a pessoa
como "5 faíscas".

## 7. Jogo sem integração

Nada muda para quem não implementa o protocolo: o jogo abre no quadro como antes, o player fica em
"sem confirmação" e a pessoa joga normalmente. A integração só acrescenta o estado real de
carregamento e a mensagem de erro.

## 8. Página de teste

[`docs/jogos/jogo-de-teste.html`](jogos/jogo-de-teste.html) simula um jogo: carregamento rápido e
lento, `ready`, `error`, identidade, compartilhamento, gasto e um lote de mensagens inválidas. Para
usar, publique o arquivo em qualquer host `https` e cadastre a URL como jogo (ou peça para a
moderação testar pelo quadro). Para testar contra um front local, acrescente
`?parent=http://localhost:8080` à URL — fora disso a página só fala com `https://enois.ia.br`.

Mesmo no teste local o jogo precisa estar em `https`: a CSP do Énóis só permite quadro `https`
(`frame-src https:`), e um `http://localhost` aparece como "conteúdo bloqueado". Um servidor local
com certificado autoassinado serve (aceite o certificado abrindo a URL do jogo uma vez):

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 7 -subj "/CN=localhost" \
  -keyout /tmp/jogo.key -out /tmp/jogo.crt
npx http-server docs/jogos -S -C /tmp/jogo.crt -K /tmp/jogo.key -p 4443
```

## 9. Limitações conhecidas

- **`frame-ancestors` / `X-Frame-Options`**: são decididos pelo site do jogo. Se recusarem o
  quadro, o navegador não avisa a página pai; o player fica em "sem confirmação" e oferece abrir na
  origem.
- **COOP**: vale só para janelas de topo e é ignorado dentro do quadro. Não atrapalha, mas também
  não isola nada no jogo embutido.
- **COEP e `SharedArrayBuffer`**: o jogo embutido só fica _cross-origin isolated_ se a página do
  Énóis também ficar, e o Énóis não envia `Cross-Origin-Embedder-Policy` (exigiria que todo
  conteúdo de terceiros da plataforma se adaptasse). Sem isolamento não há `SharedArrayBuffer`:
  builds com threads (Unity com _multithreading_, Godot 4 com threads) não rodam no quadro. Exporte
  sem threads (Godot 4.3+ tem a opção) ou abra na origem.
- **CORP** (`Cross-Origin-Resource-Policy: same-origin`) no documento do jogo não bloqueia o quadro,
  porque o Énóis não usa COEP.
- **Sandbox**: sem `allow-popups`, `allow-forms`, `allow-modals`, `allow-downloads` e
  `allow-top-navigation`. `window.open`, `alert`/`confirm`/`prompt`, envio de `<form>` e download
  não funcionam dentro do quadro. Use `fetch` em vez de formulário e mensagens na própria tela em
  vez de `alert`.
- **Permissões**: o quadro recebe só `fullscreen`, `gamepad` e `autoplay`. Microfone, câmera e
  geolocalização não são concedidos (um jogo com chat de voz precisa ser aberto na origem).
- **Armazenamento**: navegadores atuais particionam `localStorage`, IndexedDB e cookies de quadros
  de terceiros. O save e o cache do Unity dentro do Énóis são separados dos do jogo aberto na
  origem, e o Safari pode bloquear cookies no quadro — login por cookie dentro do jogo embutido pode
  falhar. Prefira a identidade do Énóis ou token no `localStorage`.
- **Tela cheia no iPhone**: o Safari do iPhone não coloca elementos em tela cheia (só vídeo). O
  player avisa e sugere girar o aparelho ou abrir na origem. Travar orientação
  (`screen.orientation.lock`) também depende de tela cheia.
- **Jogo na mesma origem do Énóis**: roda sem `allow-same-origin` (com origem opaca), porque com
  `allow-scripts` ele conseguiria remover o próprio sandbox. Nesse caso o protocolo não funciona.
- **Métricas**: "partida iniciada" conta o clique em Jogar no servidor; não prova que o jogo
  carregou. Mensagens do jogo (`enois:ready` inclusive) não entram em métricas nem em antifraude,
  porque vêm de código de terceiros.
