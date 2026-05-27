// Helper functions - general utilities

// Format date to readable string
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format date to full readable string (e.g., "June 14, 2025")
export const formatDateFull = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Format time to readable string
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format time string from "HH:MM" format to "02:30 PM"
export const formatTimeString = (timeString) => {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`
}

// Get pace label from pace level (1-3)
export const getPaceLabel = (paceLevel) => {
  const paceMap = { 1: 'Relaxed', 2: 'Moderate', 3: 'Fast' }
  return paceMap[paceLevel] || 'Moderate'
}

// Calculate number of days between two dates
export const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 1
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
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
