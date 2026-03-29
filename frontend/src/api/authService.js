import { API_BASE_URL, ERROR_MESSAGES } from '../utils/errors'

//authentication service - handles all auth-related API calls

export const authService = {
 //Login user with email and password
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) {
      let message = 'Invalid Credentials'
      try {
        const errorData = await response.json()
        if (errorData?.detail) {
          message = errorData.detail
        }
      } catch {
        // Ignore parse errors and keep default message
      }
      throw new Error(message)
    }
    return response.json()
  },

  verifyLoginOTP: async (email, otp) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: otp }),
    })

    if (!response.ok) {
      let message = ERROR_MESSAGES.LOGIN_FAILED
      try {
        const errorData = await response.json()
        if (errorData?.detail) {
          message = errorData.detail
        }
      } catch {
        // Ignore parse errors and keep default message
      }
      throw new Error(message)
    }

    return response.json()
  },

  //Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    if (!response.ok) {
      let message = ERROR_MESSAGES.REGISTRATION_FAILED
      try {
        const errorData = await response.json()
        if (errorData?.detail) {
          message = errorData.detail
        }
      } catch {
        // Ignore parse errors and keep default message
      }
      throw new Error(message)
    }
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
  verifyOTP: async (email, otp, password, firstName, lastName) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        code: otp,
        password,
        first_name: firstName,
        last_name: lastName,
      }),
    })
    if (!response.ok) {
      let message = ERROR_MESSAGES.REGISTRATION_FAILED
      try {
        const errorData = await response.json()
        if (errorData?.detail) {
          message = errorData.detail
        }
      } catch {
        // Ignore parse errors and keep default message
      }
      throw new Error(message)
    }
    return response.json()
  },

  //Resend OTP to email
  resendOTP: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      let message = 'Failed to resend OTP'
      try {
        const errorData = await response.json()
        if (errorData?.detail) {
          message = errorData.detail
        }
      } catch {
        // Ignore parse errors and keep default message
      }
      throw new Error(message)
    }

    return response.json()
  },

  cancelOTP: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/cancel-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      let message = 'Failed to cancel OTP session'
      try {
        const errorData = await response.json()
        if (errorData?.detail) {
          message = errorData.detail
        }
      } catch {
        // Ignore parse errors and keep default message
      }
      throw new Error(message)
    }

    return response.json()
  },

  checkUserExists: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/check-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!response.ok) throw new Error(ERROR_MESSAGES.CHECK_USER_FAILED)
    return response.json()
  }
}
