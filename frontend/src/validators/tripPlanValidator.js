import { ERROR_MESSAGES } from '../utils/errors'

export const validateTripPlan = (form) => {
  const newErrors = {}

  if (!form.city || form.city.trim() === '') {
    newErrors.city = ERROR_MESSAGES.CITY_REQUIRED
  }

  if (!form.hotel || form.hotel.trim() === '') {
    newErrors.hotel = ERROR_MESSAGES.HOTEL_REQUIRED
  }

  if (!form.startDate) {
    newErrors.startDate = ERROR_MESSAGES.START_DATE_REQUIRED
  }

  if (!form.endDate) {
    newErrors.endDate = ERROR_MESSAGES.END_DATE_REQUIRED
  }

  if (!form.maxAttractions || form.maxAttractions === '') {
    newErrors.maxAttractions = ERROR_MESSAGES.MAX_ATTRACTIONS_REQUIRED
  } else if (parseInt(form.maxAttractions) < 1 || parseInt(form.maxAttractions) > 20) {
    newErrors.maxAttractions = ERROR_MESSAGES.MAX_ATTRACTIONS_INVALID
  }

  if (!form.budget) {
    newErrors.budget = ERROR_MESSAGES.BUDGET_REQUIRED
  }

  // Validate date range
  if (form.startDate && form.endDate) {
    if (form.startDate >= form.endDate) {
      newErrors.endDate = ERROR_MESSAGES.END_DATE_AFTER_START
    }
  }

  return newErrors
}

export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0
}
