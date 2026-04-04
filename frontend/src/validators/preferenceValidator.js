import { ERROR_MESSAGES } from '../utils/errors'

export const validatePreferences = (transport, paceLevel, interests) => {
  const errors = {}

  if (!transport) {
    errors.transport = ERROR_MESSAGES.TRANSPORT_REQUIRED
  }

  if (!paceLevel || paceLevel < 1 || paceLevel > 5) {
    errors.paceLevel = ERROR_MESSAGES.PACE_REQUIRED
  }

  if (!interests || interests.length === 0) {
    errors.interests = ERROR_MESSAGES.INTERESTS_REQUIRED
  }

  return errors
}

export const isPreferencesValid = (errors) => {
  return Object.keys(errors).length === 0
}
