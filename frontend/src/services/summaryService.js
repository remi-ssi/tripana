import { getPaceLabel, formatDateFull, formatTimeString, calculateDays } from '../utils/helpers'

/**
 * Transform form data into summary display structure
 * @param {Object} formData - The form data from TripPlanContext
 * @returns {Object} Formatted summary data with trip details, preferences, attractions, breaks, and snapshot
 */
export const getSummaryData = (formData) => {
  // Build breaks from mealStates
  const breaks = []
  const mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }

  Object.entries(formData.mealStates || {}).forEach(([meal, state], idx) => {
    if (state.checked) {
      breaks.push({
        id: idx + 1,
        name: mealLabels[meal],
        time: formatTimeString(state.time),
        icon: meal,
      })
    }
  })

  // Calculate number of days
  let daysCount = 1
  if (formData.tripType === 'overnight' && formData.startDate && formData.endDate) {
    daysCount = calculateDays(formData.startDate, formData.endDate)
  }

  return {
    tripDetails: {
      destination: formData.city || 'N/A',
      hotel: formData.hotel || 'N/A',
      startDate:
        formData.tripType === 'overnight'
          ? formatDateFull(formData.startDate)
          : formatDateFull(formData.date),
      endDate:
        formData.tripType === 'overnight'
          ? formatDateFull(formData.endDate)
          : formatDateFull(formData.date),
      startTime: formatTimeString(formData.startTime),
      maxAttractions: formData.maxAttractions || 'N/A',
    },
    preferences: {
      budget: formData.budget || 'N/A',
      pace: getPaceLabel(formData.paceLevel),
      interests: formData.interests || [],
    },
    attractions: (formData.attractions || []).map((att, idx) => ({
      id: idx + 1,
      name: att.name || att,
      duration: att.duration || 'N/A',
      slot: att.slot || 'N/A',
    })),
    breaks,
    snapshot: {
      days: daysCount,
      attractions: (formData.attractions || []).length,
      breaks: breaks.length,
      pace: getPaceLabel(formData.paceLevel),
    },
  }
}
