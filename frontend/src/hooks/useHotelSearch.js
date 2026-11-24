import { useState, useEffect } from 'react'
import useDebounce from './useDebounce'
import { searchHotels, getHotelCoordinates } from '../services/placeSearchService'

/**
 * Custom hook to manage hotel search, suggestions, and modal state
 */
export function useHotelSearch() {
  const [hotelSearchInput, setHotelSearchInput] = useState('')
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false)
  const [hotelSuggestions, setHotelSuggestions] = useState([])
  const [hotelLoading, setHotelLoading] = useState(false)
  const debouncedHotelQuery = useDebounce(hotelSearchInput, 500)

  // Fetch hotel suggestions whenever the debounced query changes
  useEffect(() => {
    if (!debouncedHotelQuery || debouncedHotelQuery.trim().length < 2) {
      setHotelSuggestions([])
      return
    }
    const run = async () => {
      setHotelLoading(true)
      try {
        const results = await searchHotels(debouncedHotelQuery)
        setHotelSuggestions(results)
      } catch (err) {
        console.error('Hotel search failed:', err)
        setHotelSuggestions([])
      } finally {
        setHotelLoading(false)
      }
    }
    run()
  }, [debouncedHotelQuery])

  // Clear hotel search
  const clearHotelSearch = () => {
    setHotelSearchInput('')
    setHotelSuggestions([])
    setShowHotelSuggestions(false)
  }

  // Get hotel coordinates for map modal
  const fetchHotelCoordinates = async (place) => {
    if (place.coordinates) {
      return place
    }
    const details = await getHotelCoordinates(place.id)
    return details || place
  }

  return {
    hotelSearchInput,
    setHotelSearchInput,
    showHotelSuggestions,
    setShowHotelSuggestions,
    hotelSuggestions,
    hotelLoading,
    clearHotelSearch,
    fetchHotelCoordinates,
  }
}
