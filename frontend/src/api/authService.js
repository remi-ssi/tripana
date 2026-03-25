import { API_BASE_URL, ERROR_MESSAGES } from '../utils/errors'

//authentication service - handles all auth-related API calls

export const authService = {
 //Login user with email and password
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw new Error(ERROR_MESSAGES.LOGIN_FAILED)
    return response.json()
  },

  //Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    if (!response.ok) throw new Error(ERROR_MESSAGES.REGISTRATION_FAILED)
    return response.json()
  },

  //Logout user
  logout: async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  //Get current user profile
  getProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) throw new Error(ERROR_MESSAGES.PROFILE_FETCH_FAILED)
    return response.json()
  },

  // Verify OTP and complete registration
  verifyOTP: async (email, otp, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, password }),
    })
    if (!response.ok) throw new Error(ERROR_MESSAGES.REGISTRATION_FAILED)
    return response.json()
  },

  //Resend OTP to email
  resendOTP: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!response.ok) throw new Error('Failed to resend OTP')
    return response.json()
  },
}
