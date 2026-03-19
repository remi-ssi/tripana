import { ERROR_MESSAGES } from '../constants/api'
import { isEmpty } from '../utils/helpers'

/**
 * Email validation
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return ERROR_MESSAGES.INVALID_EMAIL
  }
  return null
}

/**
 * Password validation
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return ERROR_MESSAGES.PASSWORD_TOO_SHORT
  }
  return null
}

/**
 * Confirm password validation
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return ERROR_MESSAGES.PASSWORDS_DONT_MATCH
  }
  return null
}

/**
 * Validate login form
 */
export const validateLoginForm = (email, password) => {
  const errors = {}

  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError

  if (isEmpty(password)) {
    errors.password = 'Password is required'
  }

  return Object.keys(errors).length > 0 ? errors : null
}

/**
 * Validate registration form
 */
export const validateRegisterForm = (email, password, confirmPassword) => {
  const errors = {}

  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(password)
  if (passwordError) errors.password = passwordError

  const matchError = validatePasswordMatch(password, confirmPassword)
  if (matchError) errors.confirmPassword = matchError

  return Object.keys(errors).length > 0 ? errors : null
}
