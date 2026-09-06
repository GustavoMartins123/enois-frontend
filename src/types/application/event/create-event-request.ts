export type CreateEventRequest = {
  title: string;
  date: string;
  time: string;
  format: string;
  host: string;
  cover?: string | null;
};
