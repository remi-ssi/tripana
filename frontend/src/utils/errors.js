/**
 * Error messages and API configuration
 */

export const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  PROFILE_FETCH_FAILED: 'Failed to fetch profile.',
  FIRST_NAME_REQUIRED: 'First name is required.',
  LAST_NAME_REQUIRED: 'Last name is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  PASSWORD_MISSING_UPPERCASE: 'Password must contain at least 1 uppercase letter.',
  PASSWORD_MISSING_LOWERCASE: 'Password must contain at least 1 lowercase letter.',
  PASSWORD_MISSING_NUMBER: 'Password must contain at least 1 number.',
  PASSWORD_MISSING_SPECIAL_CHAR: 'Password must contain at least 1 special character (!@#$%^&*).',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
}

export const API_BASE_URL = 'http://localhost:8000'
