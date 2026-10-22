import { describe, expect, it } from "vitest";

import { resumeErrorMessage } from "./resume-import";

describe("resumeErrorMessage", () => {
  it("orienta a exportar DOC/DOCX em PDF", () => {
    expect(resumeErrorMessage("UNSUPPORTED_FORMAT")).toContain("PDF");
  });

  it("explica o PDF escaneado ou com senha", () => {
    expect(resumeErrorMessage("UNREADABLE_RESUME")).toContain("texto legível");
  });

  it("informa os tetos de tamanho", () => {
    expect(resumeErrorMessage("FILE_TOO_LARGE")).toContain("10 MB");
  });

  it("pede o arquivo quando ele falta", () => {
    expect(resumeErrorMessage("FILE_REQUIRED")).toContain("Escolha o arquivo");
  });

  it("usa a mensagem do backend quando o código é desconhecido", () => {
    expect(resumeErrorMessage("OUTRO", "mensagem do servidor")).toBe("mensagem do servidor");
  });
});
