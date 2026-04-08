import { ERROR_MESSAGES } from '../utils/errors'
import { isEmpty } from '../utils/helpers'

// * First name validation
const validateFirstName = (firstName) => {
  if (!firstName || firstName.trim() === '') {
    return ERROR_MESSAGES.FIRST_NAME_REQUIRED
  }
  return null
}

// * Last name validation
const validateLastName = (lastName) => {
  if (!lastName || lastName.trim() === '') {
    return ERROR_MESSAGES.LAST_NAME_REQUIRED
  }
  return null
}

// * Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return ERROR_MESSAGES.INVALID_EMAIL
  }
  return null
}

//Password validation
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return ERROR_MESSAGES.PASSWORD_TOO_SHORT
  }
  if (!/[A-Z]/.test(password)) {
    return ERROR_MESSAGES.PASSWORD_MISSING_UPPERCASE
  }
  if (!/[a-z]/.test(password)) {
    return ERROR_MESSAGES.PASSWORD_MISSING_LOWERCASE
  }
  if (!/[0-9]/.test(password)) {
    return ERROR_MESSAGES.PASSWORD_MISSING_NUMBER
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return ERROR_MESSAGES.PASSWORD_MISSING_SPECIAL_CHAR
  }
  return null
}

//Confirm password validation
const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return ERROR_MESSAGES.PASSWORDS_DONT_MATCH
  }
  return null
}

// Check for empty first and last names
    const validateName = (fname, lname) => {
      if ((!fname || fname.trim() === '') && (!lname || lname.trim() === '')) {
        return ERROR_MESSAGES.NAME_REQUIRED
      }
      return null
    }

//Validate login form
export const validateLoginForm = (email, password) => {
  const errors = {}

  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError

  if (isEmpty(password)) {
    errors.password = 'Password is required'
  }
  const passwordError = validatePassword(password)
  if (passwordError) errors.password = passwordError  

  return Object.keys(errors).length > 0 ? errors : null
}

//Validate registration form
export const validateRegisterForm = (firstName, lastName, email, password, confirmPassword) => {
  const errors = {}

  const firstNameError = validateFirstName(firstName)
  if (firstNameError) errors.firstName = firstNameError

  const lastNameError = validateLastName(lastName)
  if (lastNameError) errors.lastName = lastNameError

  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(password)
  if (passwordError) errors.password = passwordError

  const matchError = validatePasswordMatch(password, confirmPassword)
  if (matchError) errors.confirmPassword = matchError

  return Object.keys(errors).length > 0 ? errors : null
}
