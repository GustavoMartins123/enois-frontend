import { describe, expect, it } from "vitest";

import { apiSections, apiUseCases } from "./developers-api";

/**
 * A pagina /developers e PUBLICA. Os exemplos dela sao o unico lugar onde o app inteiro
 * "mostra" dados de pessoas — entao nome e username de gente real nao podem aparecer ali.
 *
 * O plano (BACKLOG, "Portal de docs no app") pede "exemplos sinteticos": o formato pode ser o
 * real (capturado da producao), mas o dado tem que ser inventado. Este teste trava a regra:
 * todo identificador de pessoa que aparece nos exemplos precisa estar na lista de personas
 * ficticias. Para usar outro nome de exemplo, acrescente aqui — e o revisor ve a decisao.
 */

/** Personas ficticias usadas nos exemplos. Nenhum usuario real entra nesta lista. */
const PERSONAGENS_FICTICIOS = new Set(["ada", "ada-silva", "ana-silva", "joao-silva"]);

/** Campos que carregam o identificador de uma pessoa dentro dos exemplos. */
const CAMPOS_DE_PESSOA = ["username", "authorUsername", "chave", "from", "to"];

function exemplos(): string[] {
  const brutos: string[] = [];
  for (const secao of apiSections) {
    for (const endpoint of secao.endpoints) {
      brutos.push(endpoint.request ?? "", endpoint.response ?? "");
    }
  }
  for (const caso of apiUseCases) {
    for (const passo of caso.steps) {
      brutos.push(passo.code ?? "", passo.note ?? "");
    }
  }
  return brutos;
}

describe("matriz publica da API", () => {
  it("nao expoe username de pessoa real nos exemplos", () => {
    const encontrados = new Set<string>();
    for (const exemplo of exemplos()) {
      for (const campo of CAMPOS_DE_PESSOA) {
        const padrao = new RegExp(`"${campo}":"([^"]+)"`, "g");
        for (const achado of exemplo.matchAll(padrao)) {
          encontrados.add(achado[1]);
        }
      }
    }
    const foraDaLista = [...encontrados].filter((nome) => !PERSONAGENS_FICTICIOS.has(nome));
    expect(foraDaLista).toEqual([]);
  });

  it("nao aponta para publicacao de pessoa real (id de 32 hex na URL)", () => {
    // O id real de um post tem 32 hex; o exemplo usa um id sintetico tambem com 32 hex, entao
    // o que separa os dois e o ID: o sintetico nao pode estar em producao. Aqui a trava e o
    // formato do exemplo: todo id de post tem de vir da lista de ids de exemplo.
    const IDS_DE_EXEMPLO = new Set(["post_0f1e2d3c4b5a69788796a5b4c3d2e1f0"]);
    const ids = new Set<string>();
    for (const exemplo of exemplos()) {
      for (const achado of exemplo.matchAll(/post_[0-9a-f]{32}/g)) {
        ids.add(achado[0]);
      }
    }
    expect([...ids].filter((id) => !IDS_DE_EXEMPLO.has(id))).toEqual([]);
  });
});
