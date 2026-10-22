/** Trecho do conteúdo dividido nos marcadores `{{media:<id>}}` (item 9: mídia no meio do texto). */
export type InlineChunk = { kind: "text"; text: string } | { kind: "media"; mediaId: string };
