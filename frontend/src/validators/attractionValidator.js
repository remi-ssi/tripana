import { ERROR_MESSAGES } from '../utils/errors'

/**
 * Validate attraction selection
 * Ensures at least one attraction is selected
 */
export const validateAttractions = (selected) => {
  const errors = {}

  if (!selected || selected.length === 0) {
    errors.attractions = ERROR_MESSAGES.ATTRACTIONS_REQUIRED
  }

  return errors
}

/**
 * Validate trip plan data before fetching attractions
 * Ensures city and preferences are available
 */
export const validateTripPlanData = (formData) => {
  const errors = {}

  if (!formData?.city || formData.city.trim().length === 0) {
    errors.city = 'Trip location not found. Please complete the trip plan first.'
  }

  if (!formData?.interests || formData.interests.length === 0) {
    errors.interests = 'No preferences selected. Please set your interests first.'
  }

  return errors
}

/**
 * Check if there are any validation errors
 */
export const hasErrors = (errors) => {
  return errors && Object.keys(errors).length > 0
}

/**
 * Check if validation passed (no errors)
 */
export const isAttractionsValid = (errors) => {
  return !hasErrors(errors)
}
