export type RequestOptions = {
  idempotent?: boolean;
  fingerprint?: boolean;
  expectedSessionKey?: string | null;
};
