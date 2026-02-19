export interface PollingRequestOptions<T> {
  request: () => Promise<T>;
  /**
   * Function to check if the polling should stop based on the response
   * Return true to stop polling, false to continue
   */
  shouldStop: (response: T) => boolean;
  /**
   * Custom error handler. If provided and returns true, polling will continue
   * @param error The error that occurred
   * @returns true to retry, false to stop and reject
   */
  onError?: (error: unknown) => boolean;
  /**
   * Callback called when polling stops for any reason
   * @param response The final response (may be undefined if polling stops before any successful response)
   * @param reason The reason polling stopped:
   *   - 'completed': shouldStop returned true
   *   - 'timeout': timeout was reached
   *   - 'max_retries': max retries were exhausted
   *   - 'error': an error occurred and retryOnError is false or onError returned false
   */
  onStop?: (
    response: T | undefined,
    reason: "completed" | "timeout" | "max_retries" | "error"
  ) => void;
  timeout?: number;
  retryDelay?: number;
  maxRetries?: number;
  initialDelay?: number;
  retryOnError?: boolean;
}

export interface PollingRequestResult<T> {
  data: T;
  attempts: number;
  elapsedTime: number;
}

/**
 * Polls a request function until a condition is met, with timeout and retry support
 *
 * @param options Configuration options for polling
 * @returns Promise that resolves with the final result
 * @throws Error if timeout is exceeded or max retries are reached
 *
 * @example
 * ```typescript
 * const result = await pollRequest({
 *   request: () => api.get('/status'),
 *   shouldStop: (response) => response.status === 'completed',
 *   timeout: 30000,
 *   retryDelay: 2000,
 *   maxRetries: 5
 * });
 * ```
 */
export async function pollRequest<T>(
  options: PollingRequestOptions<T>
): Promise<PollingRequestResult<T>> {
  const {
    request,
    shouldStop,
    timeout,
    retryDelay = 1000,
    maxRetries = 3,
    initialDelay = 0,
    retryOnError = true,
    onError,
    onStop,
  } = options;

  const startTime = Date.now();
  let attempts = 0;
  let lastError: unknown;
  let lastResponse: T | undefined;

  const checkTimeout = (): void => {
    if (timeout && Date.now() - startTime >= timeout) {
      if (onStop) {
        onStop(lastResponse, "timeout");
      }

      throw new Error(
        `Polling request timed out after ${timeout}ms (${attempts} attempts)`
      );
    }
  };

  const wait = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  if (initialDelay > 0) {
    await wait(initialDelay);
  }

  const executeWithRetry = async (): Promise<T> => {
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        checkTimeout();
        const response = await request();
        return response;
      } catch (error) {
        lastError = error;

        if (onError && onError(error)) {
          retryCount++;
          if (retryCount <= maxRetries) {
            await wait(retryDelay);
            continue;
          }
        }

        if (!retryOnError) {
          if (onStop) {
            onStop(lastResponse, "error");
          }
          throw error;
        }

        if (retryCount >= maxRetries) {
          if (onStop) {
            onStop(lastResponse, "max_retries");
          }
          throw new Error(
            `Request failed after ${maxRetries} retries: ${error instanceof Error ? error.message : String(error)}`
          );
        }

        retryCount++;
        await wait(retryDelay);
      }
    }

    // This should not be reached, but handle it just in case
    if (onStop) {
      onStop(lastResponse, "max_retries");
    }
    throw lastError;
  };

  while (true) {
    checkTimeout();
    attempts++;

    try {
      const response = await executeWithRetry();
      lastResponse = response;

      if (shouldStop(response)) {
        if (onStop) {
          onStop(response, "completed");
        }

        return {
          data: response,
          attempts,
          elapsedTime: Date.now() - startTime,
        };
      }

      await wait(retryDelay);
    } catch (error) {
      if (onError && onError(error)) {
        await wait(retryDelay);
        continue;
      }

      if (onStop) {
        onStop(lastResponse, "error");
      }

      throw error;
    }
  }
}
