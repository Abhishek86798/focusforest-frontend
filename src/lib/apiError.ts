import { AxiosError } from 'axios';

/**
 * API Error Response Structure
 * Backend returns: { error: { code: string, message: string } }
 */
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Extract error code from Axios error response
 * @param error - Axios error object
 * @returns Error code string or 'UNKNOWN_ERROR' if not found
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    return data.error?.code || 'UNKNOWN_ERROR';
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Extract error message from Axios error response
 * @param error - Axios error object
 * @returns Error message string or generic message if not found
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    return data.error?.message || 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
}

/**
 * Extract both error code and message from Axios error response
 * @param error - Axios error object
 * @returns Object with code and message
 */
export function getApiError(error: unknown): { code: string; message: string } {
  return {
    code: getErrorCode(error),
    message: getErrorMessage(error),
  };
}
