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
  OLD_PASSWORD_REQUIRED: 'Old password is required.',
  NEW_PASSWORD_REQUIRED: 'New password is required.',
  CONFIRM_PASSWORD_REQUIRED: 'Please confirm your new password.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  USER_NOT_EXISTS: 'User doesnt exists',
  PASSWORD_CHANGE_FAILED: 'Failed to change password. Please try again.',
  PASSWORD_CHANGE_SUCCESS: 'Your password has been changed successfully.',
  RESET_TOKEN_INVALID: 'Invalid or expired reset link. Please try forgot password again.',
  
  // OTP-related messages
  OTP_BLOCKED: 'Oops! Too Many Failed Attempts. Please try again later.',
  OTP_INCOMPLETE: 'Please enter all 6 digits.',
  OTP_INVALID: 'Invalid code. Please try again.',
  OTP_RESEND_FAILED: 'Failed to resend OTP. Please try again.',
  OTP_CLOSE_FAILED: 'Unable to close OTP right now. Please try again.',
  
  // Trip Plan Error Messages
  CITY_REQUIRED: 'City is required',
  HOTEL_REQUIRED: 'Hotel is required',
  START_DATE_REQUIRED: 'Start date is required',
  END_DATE_REQUIRED: 'End date is required',
  END_DATE_AFTER_START: 'End date must be after start date',
  MAX_ATTRACTIONS_REQUIRED: 'Max attractions is required',
  MAX_ATTRACTIONS_INVALID: 'Max attractions must be between 1 and 20',
  BUDGET_REQUIRED: 'Budget is required',

  // Attractions Error Messages
  ATTRACTIONS_REQUIRED: 'Please select at least one attraction',

  // Preferences Error Messages
  TRANSPORT_REQUIRED: 'Please select a preferred transport mode',
  PACE_REQUIRED: 'Please select a trip pace',
  INTERESTS_REQUIRED: 'Please select at least one interest',

  // Break Error Messages
  BREAKS_REQUIRED: 'Please select yes or no for break preference',
  MEALS_REQUIRED: 'Please select at least one meal',
  MEAL_TIME_REQUIRED: 'Please set a time for all selected meals',
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
