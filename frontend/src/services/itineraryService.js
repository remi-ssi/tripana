import api from './apiClient'

export async function getItineraries(skip = 0, limit = 20) {
  const { data } = await api.get('/itineraries/', { params: { skip, limit } })
  return data
}

export async function getItinerary(id) {
  const { data } = await api.get(`/itineraries/${id}`)
  return data
}

export async function createItinerary(payload) {
  const { data } = await api.post('/itineraries/', payload)
  return data
}
