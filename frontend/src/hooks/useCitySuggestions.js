import { useState, useEffect } from 'react'
import { getCitySuggestions } from '../api/places_api'
import useDebounce from './useDebounce'

// Custom hook to manage city autocomplete suggestions with caching and optimization
export default function useCitySuggestions(searchQuery) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [cache, setCache] = useState({}) // Local cache to avoid duplicate API calls

  // Debounce the search query with 1000ms delay to reduce API sessions
  const debouncedQuery = useDebounce(searchQuery, 1000)

  useEffect(() => {
    // Only search if query has 3+ characters (reduced API calls)
    if (!debouncedQuery || debouncedQuery.trim().length < 3) {
      setSuggestions([])
      return
    }

    const trimmedQuery = debouncedQuery.trim()

    // Check cache first to avoid duplicate API calls
    if (cache[trimmedQuery]) {
      setSuggestions(cache[trimmedQuery])
      return
    }

    const fetchSuggestions = async () => {
      setIsLoading(true)
      try {
        const results = await getCitySuggestions(trimmedQuery)
        setSuggestions(results)
        // Store results in cache
        setCache((prev) => ({ ...prev, [trimmedQuery]: results }))
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery, cache])

  return { suggestions, isLoading }
}
