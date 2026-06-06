import axios from 'axios';

type ErrorResponse = {
  message?: string;
};

export type ResultResponse<T> = {
  // T predstavlja konkretan podatak koji backend vraca u polju value.
  isSuccess: boolean;
  isFailure: boolean;
  error: string | null;
  warning: string | null;
  value: T;
};

export function getApiErrorMessage(error: unknown, fallbackError: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response
      ? error.response.data as string | ErrorResponse
      : null;

    if (typeof responseData === 'string') {
      if (responseData) {
        return responseData;
      }
    } else if (responseData && responseData.message) {
      return responseData.message;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackError;
}
