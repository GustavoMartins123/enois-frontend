export const HttpStatus = {
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
} as const;
export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus];
