// Simple API client for making requests to the backend
export const apiClient = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',

  getHeaders: () => {
    return { 'Content-Type': 'application/json' }
  },

  // Parse error response and throw a consistent error message
  parseError: async (response, fallbackMessage) => {
    let message = fallbackMessage

    try {
      const errorData = await response.json()
      if (errorData?.detail) {
        message = errorData.detail
      } else if (errorData?.message) {
        message = errorData.message
      }
    } catch {
      // Ignore response parsing errors and keep fallback message
    }

    const error = new Error(message)
    error.status = response.status
    throw error
  },

 // request method that handles all API calls
  request: async (endpoint, { method = 'GET', data } = {}) => {
    const response = await fetch(`${apiClient.baseURL}${endpoint}`, {
      method,
      headers: apiClient.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      await apiClient.parseError(response, `${method} ${endpoint} failed`)
    }

    return response.json()
  },

  //GET request
  get: async (endpoint, options = {}) => {
    return apiClient.request(endpoint, {
      method: 'GET',
      ...options,
    })
  },

  //POST request
  post: async (endpoint, data, options = {}) => {
    return apiClient.request(endpoint, {
      method: 'POST',
      data,
      ...options,
    })
  },
}
