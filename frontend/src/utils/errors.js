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
  
  // OTP-related messages
  OTP_BLOCKED: 'Oops! Too Many Failed Attempts. Please try again later.',
  OTP_INCOMPLETE: 'Please enter all 6 digits.',
  OTP_INVALID: 'Invalid code. Please try again.',
  OTP_RESEND_FAILED: 'Failed to resend OTP. Please try again.',
  OTP_CLOSE_FAILED: 'Unable to close OTP right now. Please try again.',
}

// Configuration for OTP verification and blocking logic
export const OTP_CONFIG = {
  RESEND_WAIT_SECONDS: 120,
  BLOCK_DURATION_SECONDS: 15 * 60,
  BLOCKED_ERROR_KEYWORDS: [
    'verification blocked',
    'resend limit reached',
    'too many attempts',
    'try again in',
  ],
}

export const API_BASE_URL = 'http://localhost:8000'
