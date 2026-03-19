/**
 * Helper functions - general utilities
 */

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format time to readable string
 */
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Capitalize first letter of string
 */
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Check if string is empty
 */
export const isEmpty = (str) => {
  return !str || str.trim().length === 0
}

/**
 * Sleep function for delays
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
