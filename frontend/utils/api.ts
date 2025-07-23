import { getApiUrl, API_CONFIG } from '@/config';

/**
 * API request options
 */
type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
};

/**
 * Chat response from the backend
 */
export type ChatResponse = {
  message: string;
  time_taken?: number;
};

/**
 * API Error type
 */
export class ApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Make an API request with consistent error handling, timeout, and retries
 */
export async function apiRequest<T = any>(
  endpoint: keyof typeof API_CONFIG.ENDPOINTS, 
  options: ApiRequestOptions = {}
): Promise<T> {
  const { 
    method = 'GET', 
    body, 
    headers = {}, 
    timeout = API_CONFIG.TIMEOUT,
    retries = 2,
    retryDelay = 1000
  } = options;

  const url = getApiUrl(endpoint);
  console.log(`Making ${method} request to ${url}`, body ? { body } : '');
  
  let lastError: Error;
  
  // Try the request with retries
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      console.log(`Retry attempt ${attempt} of ${retries}`);
    }
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Log the response status
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        let errorMessage = `API responded with status: ${response.status}`;
        try {
          // Try to get error details from response body
          const errorData = await response.json();
          if (errorData && errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (e) {
          // Ignore parsing error, use default message
        }
        throw new ApiError(errorMessage, response.status);
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);
      return responseData;
    } catch (error) {
      lastError = error;
      
      // Format error message for logging
      const errorMessage = error.name === 'AbortError' 
        ? 'Request timed out' 
        : error.message || 'Unknown error';
      
      console.error(`Request error (attempt ${attempt + 1}/${retries + 1}): ${errorMessage}`);
      
      // Don't retry if it was aborted or if we've used all retry attempts
      if (error.name === 'AbortError' || attempt === retries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Increase delay for next retry (exponential backoff)
      options.retryDelay = retryDelay * 2;
    }
  }

  // If we got here, all attempts failed
  if (lastError.name === 'AbortError') {
    throw new ApiError('Request timeout. Please check your connection and try again.');
  }
  throw lastError;
}

/**
 * Send a chat message to the API
 */
export async function sendChatMessage(question: string): Promise<ChatResponse> {
  try {
    const response = await apiRequest<ChatResponse>('CHAT', {
      method: 'POST',
      body: { question },
    });
    
    // Validate response format
    if (!response || typeof response.message !== 'string') {
      throw new ApiError('Invalid response format from server');
    }
    
    return response;
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
} 