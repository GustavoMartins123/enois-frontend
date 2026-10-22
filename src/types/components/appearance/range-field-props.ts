export type RangeFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Valor já formatado para leitura (ex.: "25%"). */
  valueLabel: string;
  onChange: (value: number) => void;
  hint?: string;
  /** Trilho colorido com todo o espectro, para os controles de matiz. */
  hueTrack?: boolean;
};
