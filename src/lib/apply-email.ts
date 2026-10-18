import type { ApplicationEmailInput } from "@/types/lib/application-email-input";
import type { ApplicationEmail } from "@/types/lib/apply-email";

import { resolveCdnUrl } from "@/lib/api/media";

/**
 * E-mail de candidatura escrito a partir do perfil.
 *
 * O texto é curto de propósito: quem lê é uma pessoa triando currículo, e o que ela precisa saber
 * está no anexo. O que sai daqui é o que a pessoa escreveria se tivesse tempo — nome, por que aquela
 * vaga, o que ela sabe fazer e o convite para conversar. Nada de "prezados, venho por meio desta".
 */
export function buildApplicationEmail(input: ApplicationEmailInput): ApplicationEmail {
  const firstName = input.name.split(" ")[0] || input.name;
  const skills = (input.skills ?? []).filter(Boolean).slice(0, 8);
  const company = input.company?.trim();
  const headline = input.headline?.trim();

  const subject = company
    ? `Candidatura — ${input.jobTitle} (${company})`
    : `Candidatura — ${input.jobTitle}`;

  const paragraphs: string[] = [
    `Olá!`,
    `Me chamo ${input.name} e tenho interesse na vaga de ${input.jobTitle}${company ? `, na ${company}` : ""}.${
      headline
        ? ` ${headline} — e acredito que posso contribuir com o time.`
        : " Acredito que posso contribuir com o time."
    }`,
  ];

  if (skills.length > 0) {
    paragraphs.push(
      input.hasResume
        ? `Além do currículo em anexo, deixo algumas das minhas habilidades: ${skills.join(", ")}.`
        : `Deixo algumas das minhas habilidades: ${skills.join(", ")}.`,
    );
  } else if (input.hasResume) {
    paragraphs.push("Segue meu currículo em anexo.");
  }

  paragraphs.push("Fico à disposição para conversar quando fizer sentido para vocês.");

  const signature = [`Abraço,`, input.name];
  if (input.portfolio?.trim()) signature.push(input.portfolio.trim());

  return { subject, body: [...paragraphs, signature.join("\n")].join("\n\n") };
}

/**
 * Primeiro e-mail de candidatura citado no texto da vaga.
 *
 * Mesma ideia do lado do servidor para as vagas externas (que trazem o endereço na descrição do
 * anúncio) — aqui serve para a vaga publicada no Énóis que diz "mande seu currículo para x@y.com".
 */
export function applyEmailFromText(text?: string | null): string | null {
  if (!text) return null;
  const matches = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
  for (const match of matches) {
    const candidate = match.toLowerCase();
    if (candidate.startsWith("noreply@") || candidate.startsWith("no-reply@")) continue;
    return candidate;
  }
  return null;
}

/**
 * Manda o currículo pelo compartilhamento do sistema.
 *
 * É o único caminho em que o anexo chega sozinho: o `mailto:` abre o app de e-mail com o texto, mas
 * não tem como carregar arquivo. Onde o navegador sabe compartilhar arquivo (celular, em geral), a
 * pessoa escolhe o app de e-mail e o PDF vai junto.
 */
export async function shareResume(
  url: string,
  fileName: string,
  title: string,
  text: string,
): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: "application/pdf" });
    if (!navigator.canShare({ files: [file] })) return false;

    await navigator.share({ files: [file], title, text });
    return true;
  } catch {
    // Cancelar o compartilhamento também cai aqui — nesse caso o e-mail ainda abre pelo mailto.
    return false;
  }
}

/** Baixa o currículo com o nome original (é o que a pessoa anexa depois, se preciso). */
export async function downloadResume(url: string, fileName?: string | null): Promise<void> {
  const resolved = resolveCdnUrl(url);
  if (!resolved) return;

  try {
    const response = await fetch(resolved);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName || "curriculo.pdf";
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(resolved, "_blank", "noopener,noreferrer");
  }
}
