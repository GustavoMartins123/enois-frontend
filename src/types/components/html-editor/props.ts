export type HtmlEditorProps = {
  /** Identificador do campo, para o label apontar para o textarea. */
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  /** Explicação curta do que roda e do que não roda dentro do quadro. */
  description: string;
  placeholder: string;
  /** Texto do estado vazio da pré-visualização. */
  emptyPreview: string;
  /** Nome acessível do quadro (o mesmo texto do render final, para não confundir). */
  frameTitle: string;
  maxLength: number;
  /** Altura do quadro de pré-visualização. */
  previewClassName?: string;
};
