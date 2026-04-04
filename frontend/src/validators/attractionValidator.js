import { ERROR_MESSAGES } from '../utils/errors'

export const validateAttractions = (selected) => {
  const errors = {}

  if (!selected || selected.length === 0) {
    errors.attractions = ERROR_MESSAGES.ATTRACTIONS_REQUIRED
  }

  return errors
}

export const isAttractionsValid = (errors) => {
  return Object.keys(errors).length === 0
}
