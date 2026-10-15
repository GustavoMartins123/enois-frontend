import { createServerFn } from "@tanstack/react-start";

import type { ImageKitAuth } from "@/types/application/imagekit/image-kit-auth";
import crypto from "node:crypto";

/**
 * Origem da API para validar a sessao no servidor.
 *
 * Preferimos o valor absoluto embutido no build (VITE_API_BACKEND); em dev ele e "/api" (proxy),
 * que nao serve para fetch server-side, entao caimos no dominio publico.
 */
const API_BASE = (import.meta.env.VITE_API_BACKEND ?? "").startsWith("http")
  ? import.meta.env.VITE_API_BACKEND
  : "https://enois.ia.br/api";

/**
 * Assinatura do upload no ImageKit.
 *
 * Exige sessao valida: antes, qualquer visitante anonimo obtinha uma assinatura valida e podia
 * enviar arquivos arbitrarios para a conta do ImageKit.
 */
export const getImageKitAuth = createServerFn({ method: "POST" })
  .inputValidator((input: { sessionToken?: string | null }) => input ?? {})
  .handler(async ({ data }) => {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error("IMAGEKIT_PRIVATE_KEY não configurada no servidor");
    }

    const sessionToken = data?.sessionToken;
    if (!sessionToken) {
      throw new Error("É necessário estar logado para enviar mídia.");
    }

    const check = await fetch(`${API_BASE}/auth/me`, {
      headers: { "X-Session-Token": sessionToken },
    }).catch(() => null);

    if (!check || !check.ok) {
      throw new Error("Sessão inválida ou expirada.");
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 1800;
    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(token + expire)
      .digest("hex");

    return { signature, token, expire } satisfies ImageKitAuth;
  });
