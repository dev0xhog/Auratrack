/**
 * Centralized API client with error handling, rate limiting, and security
 */

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

/**
 * Enhanced fetch with timeout, retries, and better error handling
 */
export const fetchWithTimeout = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { timeout = 30000, retries = 2, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on timeout or network errors if it's the last attempt
      if (attempt === retries) {
        break;
      }

      // Exponential backoff: wait 1s, 2s, 4s between retries
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  clearTimeout(timeoutId);
  throw lastError || new Error('Request failed after retries');
};

/**
 * Batch API requests with concurrency control
 * Prevents overwhelming servers and triggering rate limits
 */
export const batchFetch = async <T>(
  requests: (() => Promise<T>)[],
  concurrency = 5
): Promise<T[]> => {
  const results: T[] = [];
  
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    results.push(...batchResults);
  }
  
  return results;
};
