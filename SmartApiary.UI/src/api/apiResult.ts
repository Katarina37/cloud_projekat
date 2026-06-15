// API pozivi koje koristi apiResult.

import axios from 'axios';

type ErrorResponse = {
  type?: string;
  errors?: string | Record<string, string[]>;
  message?: string;
};

type ResultError = {
  message: string;
  type: string | number;
};

export type ResultResponse<T> = {
  // T predstavlja konkretan podatak koji backend vraca u polju value.
  isSuccess: boolean;
  isFailure: boolean;
  error: ResultError | null;
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
    } else if (responseData) {
      const validationMessage = getValidationErrorMessage(responseData.errors);

      if (validationMessage) {
        return validationMessage;
      }

      if (responseData.message) {
        return responseData.message;
      }
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

function getValidationErrorMessage(errors: ErrorResponse['errors']) {
  if (typeof errors === 'string') {
    return errors;
  }

  if (!errors) {
    return null;
  }

  const messages: string[] = [];

  for (const fieldMessages of Object.values(errors)) {
    messages.push(...fieldMessages);
  }

  return messages.length > 0 ? messages.join(' ') : null;
}
