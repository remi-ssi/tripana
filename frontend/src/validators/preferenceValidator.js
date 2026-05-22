import { ERROR_MESSAGES } from '../utils/errors'

export const validatePreferences = (paceLevel, interests, budget) => {
  const errors = {}

  if (!paceLevel || paceLevel < 1 || paceLevel > 5) {
    errors.paceLevel = ERROR_MESSAGES.PACE_REQUIRED
  }

  if (!interests || interests.length === 0) {
    errors.interests = ERROR_MESSAGES.INTERESTS_REQUIRED
  }

  if (!budget) {
    errors.budget = ERROR_MESSAGES.BUDGET_REQUIRED
  }

  return errors
}

export const isPreferencesValid = (errors) => {
  return Object.keys(errors).length === 0
}
