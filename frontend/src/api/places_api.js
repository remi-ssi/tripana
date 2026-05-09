import { searchCitiesPH } from '../services/nomatimService'

// Search for city suggestions (Philippines only)
export const getCitySuggestions = async (query) => {
  return await searchCitiesPH(query)
}