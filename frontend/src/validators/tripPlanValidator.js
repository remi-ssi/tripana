import { ERROR_MESSAGES } from '../utils/errors'

export const validateTripPlan = (form, tripType = form.tripType) => {
  const newErrors = {}

  // Common validation
  if (!form.city || form.city.trim() === '') {
    newErrors.city = ERROR_MESSAGES.CITY_REQUIRED
  }

  // Budget validation (required for all trip types)
  if (!form.budget || form.budget.trim() === '') {
    newErrors.budget = 'Budget is required'
  }

  // Day Tour validation
  if (tripType === 'day') {
    if (!form.date) {
      newErrors.date = ERROR_MESSAGES.DATE_REQUIRED || 'Date is required'
    }

    if (!form.startTime) {
      newErrors.startTime = ERROR_MESSAGES.START_TIME_REQUIRED || 'Start time is required'
    }
  }

  // Overnight Trip validation
  if (tripType === 'overnight') {
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

    // Validate date range
    if (form.startDate && form.endDate) {
      if (form.startDate >= form.endDate) {
        newErrors.endDate = ERROR_MESSAGES.END_DATE_AFTER_START
      }
    }
  }

  return newErrors
}

export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0
}
