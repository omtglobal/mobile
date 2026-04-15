import { isAxiosError } from 'axios';

/** API rejected credentials or token (show login, not generic retry). */
export function isAuthHttpError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
}
