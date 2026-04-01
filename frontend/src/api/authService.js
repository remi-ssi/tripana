import { ERROR_MESSAGES } from '../utils/errors'
import { apiClient } from './apiClient'

//authentication service - handles all auth-related API calls

export const authService = {
 //Login user with email and password
  login: async (email, password) => {
    try {
      return await apiClient.post('/auth/login', { email, password })
    } catch (error) {
      if (error?.status === 401) {
        throw new Error('Invalid Credentials')
      }

      throw new Error(error?.message || ERROR_MESSAGES.LOGIN_FAILED)
    }
  },

  //Verify OTP for login and get token
  verifyLoginOTP: async (email, otp) => {
    try {
      return await apiClient.post('/auth/verify-login-otp', { email, code: otp })
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.LOGIN_FAILED)
    }
  },

  //Register new user
  register: async (userData) => {
    try {
      return await apiClient.post('/auth/register', userData)
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.REGISTRATION_FAILED)
    }
  },

  //Logout user
  logout: async () => {
    await apiClient.post('/auth/logout', {})
  },

  //Get current user profile
  getProfile: async () => {
    try {
      return await apiClient.get('/auth/profile')
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.PROFILE_FETCH_FAILED)
    }
  },

  //Check whether the authenticated user already has saved travel preferences
  getPreferenceStatus: async () => {
    try {
      return await apiClient.get('/auth/preference-status')
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch preference status')
    }
  },

  //Save the authenticated user's selected travel preferences
  savePreferences: async (preferredCategories) => {
    try {
      return await apiClient.post('/auth/preferences', {
        preferred_categories: preferredCategories,
      })
    } catch (error) {
      throw new Error(error.message || 'Failed to save preferences')
    }
  },

  // Verify OTP and complete registration
  verifyOTP: async (email, otp, password, firstName, lastName) => {
    try {
      return await apiClient.post(
        '/auth/verify-otp',
        {
          email,
          code: otp,
          password,
          first_name: firstName,
          last_name: lastName,
        }
      )
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.REGISTRATION_FAILED)
    }
  },

  //Resend OTP to email
  resendOTP: async (email) => {
    try {
      return await apiClient.post('/auth/resend-otp', { email })
    } catch (error) {
      throw new Error(error.message || 'Failed to resend OTP')
    }
  },

  //Cancel OTP session when user closes OTP modal
  cancelOTP: async (email) => {
    try {
      return await apiClient.post('/auth/cancel-otp', { email })
    } catch (error) {
      throw new Error(error.message || 'Failed to cancel OTP session')
    }
  },
  
// Check if user exists before registration
  checkUserExists: async (email) => {
    try {
      return await apiClient.post('/auth/check-user', { email })
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.CHECK_USER_FAILED)
    }
  }
}
