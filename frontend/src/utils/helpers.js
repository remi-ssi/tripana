// Helper functions - general utilities

// Format date to readable string
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format time to readable string
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

 //Capitalize first letter of string
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

//Check if string is empty
export const isEmpty = (str) => {
  return !str || str.trim().length === 0
}

//Sleep function for delays
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Format Google Places type to readable tag
export const formatTypeTag = (type) => {
  if (!type) return 'Attraction'
  
  const typeMap = {
    'tourist_attraction': 'Attraction',
    'restaurant': 'Food',
    'cafe': 'Cafe',
    'museum': 'Museum',
    'park': 'Nature',
    'natural_feature': 'Nature',
    'shopping_mall': 'Shopping',
    'bar': 'Nightlife',
    'night_club': 'Nightlife',
    'beach': 'Beach',
    'historical_landmark': 'Historical',
    'art_gallery': 'Art',
    'aquarium': 'Aquarium',
    'zoo': 'Zoo',
    'place_of_worship': 'Cultural',
    'lodging': 'Lodging',
  }
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1)
}
