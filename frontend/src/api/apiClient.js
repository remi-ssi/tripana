/**
 * API client setup for making HTTP requests
 * You can add interceptors here if using axios
 */

export const apiClient = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',

  /**
   * Get authorization headers with token
   */
  getHeaders: (includeAuth = true) => {
    const headers = { 'Content-Type': 'application/json' }
    if (includeAuth) {
      const token = localStorage.getItem('token')
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }
    return headers
  },

  /**
   * Generic GET request
   */
  get: async (endpoint) => {
    const response = await fetch(`${apiClient.baseURL}${endpoint}`, {
      method: 'GET',
      headers: apiClient.getHeaders(),
    })
    if (!response.ok) throw new Error(`GET ${endpoint} failed`)
    return response.json()
  },

  /**
   * Generic POST request
   */
  post: async (endpoint, data) => {
    const response = await fetch(`${apiClient.baseURL}${endpoint}`, {
      method: 'POST',
      headers: apiClient.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`POST ${endpoint} failed`)
    return response.json()
  },
}
