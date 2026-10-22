import { describe, expect, it } from "vitest";

import { applyEmailFromText, buildApplicationEmail } from "./apply-email";

describe("buildApplicationEmail", () => {
  it("monta assunto e corpo com o que a pessoa tem no perfil", () => {
    const { subject, body } = buildApplicationEmail({
      jobTitle: "Pessoa Desenvolvedora Back-end",
      company: "Floresta Encantada",
      name: "Ana Souza",
      headline: "Back-end em Java",
      skills: ["Java", "Spring", "PostgreSQL"],
      portfolio: "https://ana.dev",
      hasResume: true,
    });

    expect(subject).toBe("Candidatura — Pessoa Desenvolvedora Back-end (Floresta Encantada)");
    expect(body).toContain(
      "Me chamo Ana Souza e tenho interesse na vaga de Pessoa Desenvolvedora Back-end, na Floresta Encantada.",
    );
    expect(body).toContain("Back-end em Java — e acredito que posso contribuir com o time.");
    expect(body).toContain(
      "Além do currículo em anexo, deixo algumas das minhas habilidades: Java, Spring, PostgreSQL.",
    );
    expect(body).toContain("Abraço,\nAna Souza\nhttps://ana.dev");
  });

  it("não promete anexo quando não há currículo", () => {
    const { body } = buildApplicationEmail({
      jobTitle: "Designer",
      name: "Bia Lima",
      skills: ["Figma"],
      hasResume: false,
    });

    expect(body).not.toContain("anexo");
    expect(body).toContain("Deixo algumas das minhas habilidades: Figma.");
  });

  it("aguenta perfil vazio sem virar texto quebrado", () => {
    const { subject, body } = buildApplicationEmail({
      jobTitle: "Estágio",
      name: "Caio",
      hasResume: true,
    });

    expect(subject).toBe("Candidatura — Estágio");
    expect(body).toContain("Me chamo Caio e tenho interesse na vaga de Estágio.");
    expect(body).toContain("Segue meu currículo em anexo.");
    expect(body).not.toContain("undefined");
    expect(body).not.toContain("null");
  });
});

describe("applyEmailFromText", () => {
  it("acha o endereço citado na descrição da vaga", () => {
    expect(applyEmailFromText("Envie seu currículo para Vagas@Empresa.com até sexta.")).toBe(
      "vagas@empresa.com",
    );
  });

  it("ignora disparo automático e texto sem endereço", () => {
    expect(applyEmailFromText("noreply@empresa.com")).toBeNull();
    expect(applyEmailFromText("Candidate-se pelo site")).toBeNull();
    expect(applyEmailFromText(null)).toBeNull();
  });
});
