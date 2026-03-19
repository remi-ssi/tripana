import { API_BASE_URL } from '../constants/api'

/**
 * Authentication service - handles all auth-related API calls
 */

export const authService = {
  /**
   * Login user with email and password
   */
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw new Error('Login failed')
    return response.json()
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    if (!response.ok) throw new Error('Registration failed')
    return response.json()
  },

  /**
   * Logout user
   */
  logout: async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  /**
   * Get current user profile
   */
  getProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch profile')
    return response.json()
  },
}
