/**
 * API response and error types per 02-api-contracts.md
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginatedMeta;
}

export interface ApiErrorDetails {
  [field: string]: string[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetails;
  correlation_id?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

/** HTTP status and client action (02-api-contracts) */
export const HTTP_ACTIONS = {
  200: 'process_data',
  201: 'process_data',
  202: 'show_confirmation',
  204: 'update_ui',
  401: 'refresh_then_login',
  403: 'show_forbidden',
  404: 'show_not_found',
  422: 'show_validation_errors',
  429: 'retry_with_backoff',
  500: 'show_error_retry',
} as const;
