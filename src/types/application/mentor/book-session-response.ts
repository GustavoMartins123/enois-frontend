import type { StatusResponse } from "../api/status-response";

export type BookSessionResponse = StatusResponse & {
  sessionId: string;
};
