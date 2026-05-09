import { useState, useEffect } from 'react'
import { getCitySuggestions } from '../api/places_api'
import useDebounce from './useDebounce'

// Custom hook to manage city autocomplete suggestions
export default function useCitySuggestions(searchQuery) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Debounce the search query with 500ms delay to prevent API spam
  const debouncedQuery = useDebounce(searchQuery, 500)

  useEffect(() => {
    // Only search if query is not empty
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setIsLoading(true)
      try {
        const results = await getCitySuggestions(debouncedQuery)
        setSuggestions(results)
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  return { suggestions, isLoading }
}
