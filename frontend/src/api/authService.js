import { ERROR_MESSAGES } from '../utils/errors'
import { apiClient } from './apiClient'

//authentication service - handles all auth-related API calls

export const authService = {
  // Build backend Google OAuth entry URL
  getGoogleLoginUrl: () => `${apiClient.baseURL}/auth/google/login`,

  // Get guest-safe current session status
  getSessionStatus: async () => {
    try {
      return await apiClient.get('/auth/session')
    } catch (error) {
      const sessionError = new Error(error.message || 'Failed to fetch session status')
      sessionError.status = error?.status
      throw sessionError
    }
  },

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
      console.log('[AuthService] Registering user with data:', {
        first_name: userData.first_name ? userData.first_name.substring(0, 50) + '...' : null,
        last_name: userData.last_name ? userData.last_name.substring(0, 50) + '...' : null,
        email: userData.email ? userData.email.substring(0, 50) + '...' : null,
        password: userData.password ? userData.password.substring(0, 50) + '...' : null,
      })
      return await apiClient.post('/auth/register', userData)
    } catch (error) {
      console.error('[AuthService] Register failed:', error)
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
      const profileError = new Error(error.message || ERROR_MESSAGES.PROFILE_FETCH_FAILED)
      profileError.status = error?.status
      throw profileError
    }
  },

  //Check whether the authenticated user already has saved travel preferences
  getPreferenceStatus: async () => {
    try {
      return await apiClient.get('/auth/preference-status')
    } catch (error) {
      const preferenceError = new Error(error.message || 'Failed to fetch preference status')
      preferenceError.status = error?.status
      throw preferenceError
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

  // Forgot-password step 1: send OTP if email exists
  forgotPassword: async (email) => {
    try {
      return await apiClient.post('/auth/forgot-password', { email })
    } catch (error) {
      throw new Error(error.message || 'Failed to process forgot password request')
    }
  },

  // Forgot-password step 2: verify OTP and receive reset token
  verifyForgotOTP: async (email, otp) => {
    try {
      return await apiClient.post('/auth/verify-forgot-otp', { email, code: otp })
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.OTP_INVALID)
    }
  },

  // Forgot-password step 3: set a new password using reset token
  resetPassword: async (resetToken, newPassword) => {
    try {
      return await apiClient.post('/auth/reset-password', {
        reset_token: resetToken,
        new_password: newPassword,
      })
    } catch (error) {
      throw new Error(error.message || 'Failed to reset password')
    }
  },

  // Logged-in password change
  changePassword: async (oldPassword, newPassword) => {
    try {
      return await apiClient.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      })
    } catch (error) {
      throw new Error(error.message || 'Failed to change password')
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
