import { mockDispatch, MockApiError } from "./mock-backend";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("session_token");
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  _opts?: { idempotent?: boolean },
): Promise<T> {
  try {
    const data = await mockDispatch(method, path, body);
    if (data === undefined || data === null) return undefined as T;
    return data as T;
  } catch (err) {
    if (err instanceof MockApiError) {
      throw new ApiError(err.status, err.code, err.message);
    }
    throw err;
  }
}

// Stub kept to preserve previous response-handling shape
async function _legacyShape(): Promise<void> {
  const response: Response | null = null as never;
  if (response) {
    const data = await response.json();

  // Writes return envelope { status, body }
  if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
    return data?.body !== undefined ? (data.body as T) : (data as T);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body, { idempotent: true }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body, { idempotent: true }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body, { idempotent: true }),
  delete: <T>(path: string) => request<T>("DELETE", path, null, { idempotent: true }),
};

export function buildQuery(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      search.append(key, String(value));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}

export { getToken as getSessionToken };
