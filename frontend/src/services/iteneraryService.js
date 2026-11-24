import { apiClient } from '../api/apiClient'

const toApiPayload = (formData) => ({
  trip_type: formData.tripType,
  city: formData.city,
  hotel: formData.hotel || null,
  hotel_lat: formData.hotelCoords?.lat ?? null,
  hotel_lng: formData.hotelCoords?.lng ?? null,
  date: formData.date || null,
  start_date: formData.startDate || null,
  end_date: formData.endDate || null,
  start_time: formData.startTime || null,
  max_attractions:
    formData.tripType === 'overnight'
      ? Number(formData.maxAttractions)
      : formData.attractions?.length || 1,
  budget: formData.budget,
  pace_level: Number(formData.paceLevel || 2),
  attraction_ids: (formData.attractions || []).map((item) => String(item.id)),
  include_breaks: Boolean(formData.includeBreaks),
  meal_breaks: Object.entries(formData.mealStates || {}).map(([mealType, state]) => ({
    meal_type: mealType,
    meal_time: state.time,
    enabled: Boolean(state.checked),
  })),
})

const displayTimeTo24Hour = (value) => {
  if (!value) return '08:00'
  if (!value.includes(' ')) return value

  const [clock, period] = value.split(' ')
  let [hours, minutes] = clock.split(':').map(Number)
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const toSchedulePayload = (days) => {
  const breaks = new Map()
  const dayPayloads = days.map((day) => {
    const activities = []

    day.items.forEach((item) => {
      if (item.type === 'attraction' && item.activityId) {
        activities.push({
          activity_id: item.activityId,
          start_time: displayTimeTo24Hour(item.time),
          status: item.visited ? 'visited' : 'planned',
        })
      }

      if (item.type === 'break' && item.breakId) {
        breaks.set(item.breakId, {
          break_id: item.breakId,
          meal_type: item.title,
          meal_time: displayTimeTo24Hour(item.time),
        })
      }
    })

    return { day_id: day.id, activities }
  })

  return { days: dayPayloads, breaks: Array.from(breaks.values()) }
}

export const itineraryService = {
  generate: (formData) =>
    apiClient.post('/api/v1/itineraries/generate', toApiPayload(formData)),

  list: async ({ skip = 0, limit = 100 } = {}) => {
    const response = await apiClient.get(
      `/api/v1/itineraries?skip=${skip}&limit=${limit}`,
    )
    return response.results || []
  },

  get: (itineraryId) =>
    apiClient.get(`/api/v1/itineraries/${itineraryId}`),

  updateSchedule: (itineraryId, days) =>
    apiClient.put(
      `/api/v1/itineraries/${itineraryId}/schedule`,
      toSchedulePayload(days),
    ),

  delete: (itineraryId) =>
    apiClient.delete(`/api/v1/itineraries/${itineraryId}`),
}
