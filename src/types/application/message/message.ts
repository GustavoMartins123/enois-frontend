export type Message = {
  id: string;
  from: string;
  text: string;
  /** Até 4 mídias anexadas; o texto pode vir vazio quando há mídia. */
  mediaIds: string[];
  time: string;
};
