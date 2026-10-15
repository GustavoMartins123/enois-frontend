export type Navigate = (opts: {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
}) => void;
