import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * O limite de um campo de texto tem de ser o MESMO nos três lugares: a coluna do banco, a
 * checagem da API e o campo do app.
 *
 * Sem ele no app, a pessoa podia digitar mais do que a coluna aguenta: o banco recusava com
 * "Data too long" e a API devolvia **409 CONFLICT** ("Operação conflita com o estado atual dos
 * dados") — que não diz qual campo passou do limite. Agora a API recusa com 400 dizendo o campo e
 * o teto, e o campo do app mostra o mesmo número.
 *
 * Este teste trava o lado do app: os limites do formulário são os das colunas.
 */
const COLUNAS = {
  companies: { name: 160, sector: 80, size: 40, location: 160, website: 300, description: 4000 },
  events: { title: 255 },
} as const;

describe("limite dos campos de texto", () => {
  it("o formulário da empresa usa o mesmo teto da coluna", () => {
    const fonte = readFileSync(
      join(process.cwd(), "src/components/company-edit-dialog.tsx"),
      "utf8",
    );
    for (const [campo, teto] of Object.entries(COLUNAS.companies)) {
      if (campo === "description") {
        expect(fonte).toContain("maxLength={4000}");
        continue;
      }
      // o mapa de limites declara o numero de cada campo
      expect(fonte).toMatch(new RegExp(`${campo}:\\s*${teto}\\b`));
    }
  });

  it("o título do evento usa o mesmo teto da coluna", () => {
    const fonte = readFileSync(join(process.cwd(), "src/routes/eventos.tsx"), "utf8");
    expect(fonte).toContain(`maxLength={${COLUNAS.events.title}}`);
  });
});
