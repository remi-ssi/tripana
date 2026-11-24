/**
 * Validate and clean city name
 * @param {string} city - The city name to validate
 * @returns {boolean} - True if city name is valid
 */
export const validateCityName = (city) => {
  if (!city || typeof city !== 'string') {
    return false
  }
  
  const trimmed = city.trim()
  
  // City name should have at least 2 characters
  if (trimmed.length < 2) {
    return false
  }
  
  // City name should not exceed 100 characters
  if (trimmed.length > 100) {
    return false
  }
  
  return true
}

/**
 * Remove duplicate cities from an array
 * @param {Array} cities - Array of city objects with 'name' property
 * @returns {Array} - Array with duplicate cities removed
 */
export const removeDuplicateCities = (cities) => {
  if (!Array.isArray(cities)) {
    return []
  }
  
  const seenNames = new Set()
  return cities.filter((city) => {
    const cityNameLower = city.name?.toLowerCase().trim()
    if (!cityNameLower || seenNames.has(cityNameLower)) {
      return false
    }
    seenNames.add(cityNameLower)
    return true
  })
}
