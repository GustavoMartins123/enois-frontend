import type { GameBridgeMessage } from "@/types/application/games/game-bridge-message";

/**
 * `version` é opcional porque `identity`, `share` e `spend` nasceram sem ela. Versão maior é lida
 * pelos campos conhecidos: campo novo não pode quebrar quem joga numa página antiga.
 */
export const GAME_PROTOCOL_VERSION = 1;

export const SHARE_TEXT_MAX = 600;
export const SPEND_REASON_MAX = 200;
export const SPEND_REQUEST_ID_MAX = 120;
export const ERROR_MESSAGE_MAX = 200;

export const SHARE_IMAGE_MAX_CHARS = Math.ceil((2 * 1024 * 1024 * 4) / 3) + 32;

/** SVG fica de fora: a imagem sobe para a mídia do Énóis, e SVG carrega script. */
const SHARE_IMAGE = /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/;

const SANDBOX = "allow-scripts allow-same-origin allow-pointer-lock";
const SANDBOX_SAME_HOST = "allow-scripts allow-pointer-lock";

export function gameOrigin(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  // A CSP do Énóis só deixa abrir quadro https (frame-src https:).
  return parsed.protocol === "https:" ? parsed.origin : null;
}

/**
 * `allow-scripts` + `allow-same-origin` na mesma origem do Énóis deixaria o quadro tirar o próprio
 * sandbox e ler a sessão; nesse caso o jogo roda com origem opaca.
 */
export function frameSandbox(origin: string, hostOrigin: string): string {
  return origin === hostOrigin ? SANDBOX_SAME_HOST : SANDBOX;
}

export function isFromGameFrame(
  event: Pick<MessageEvent, "origin" | "source">,
  origin: string,
  frameWindow: Window | null | undefined,
): boolean {
  return frameWindow != null && event.source === frameWindow && event.origin === origin;
}

export function parseGameMessage(data: unknown): GameBridgeMessage | null {
  if (!isRecord(data) || !validVersion(data.version)) return null;

  switch (data.type) {
    case "enois:identity":
      return { type: "enois:identity" };

    case "enois:ready":
      return { type: "enois:ready" };

    case "enois:loading": {
      if (data.progress === undefined || data.progress === null) {
        return { type: "enois:loading", progress: null };
      }
      const progress = data.progress;
      if (typeof progress !== "number" || !Number.isFinite(progress)) return null;
      if (progress < 0 || progress > 100) return null;
      return { type: "enois:loading", progress: Math.round(progress) };
    }

    case "enois:error": {
      if (data.message === undefined || data.message === null) {
        return { type: "enois:error", message: null };
      }
      if (typeof data.message !== "string") return null;
      const message = data.message.trim().slice(0, ERROR_MESSAGE_MAX);
      return { type: "enois:error", message: message || null };
    }

    case "enois:share": {
      if (typeof data.texto !== "string" || data.texto.trim() === "") return null;
      const imagem =
        typeof data.imagem === "string" &&
        data.imagem.length <= SHARE_IMAGE_MAX_CHARS &&
        SHARE_IMAGE.test(data.imagem)
          ? data.imagem
          : null;
      return { type: "enois:share", texto: data.texto.slice(0, SHARE_TEXT_MAX), imagem };
    }

    case "enois:spend": {
      const { amount, requestId, motivo } = data;
      if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0) return null;
      if (typeof requestId !== "string" || requestId.trim() === "") return null;
      return {
        type: "enois:spend",
        amount,
        motivo: typeof motivo === "string" ? motivo.slice(0, SPEND_REASON_MAX) : "",
        requestId: requestId.slice(0, SPEND_REQUEST_ID_MAX),
      };
    }

    default:
      return null;
  }
}

export function identityReply(token: string) {
  return { type: "enois:identity", token };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validVersion(value: unknown): boolean {
  return value === undefined || (Number.isSafeInteger(value) && (value as number) >= 1);
}
