export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  format: "ONLINE" | "IN_PERSON" | "HYBRID";
  host: string;
  attendees: number;
  cover: string | null;
  /** Link da transmissao ao vivo (online/hibrido) — vira o botao "Assistir ao vivo". */
  streamUrl: string | null;
  /** Onde o evento acontece (presencial/hibrido). */
  location: string | null;
  /** O evento já aconteceu: sai da vitrine e não aceita mais confirmação de presença. */
  expired: boolean;
};
