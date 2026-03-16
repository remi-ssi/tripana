import { useState, useEffect } from 'react'
import { getItineraries } from '../services/itineraryService'

/**
 * Custom hook that fetches and returns the list of itineraries.
 *
 * @param {number} [skip=0]
 * @param {number} [limit=20]
 * @returns {{ itineraries: Array, loading: boolean, error: string|null }}
 */
export function useItineraries(skip = 0, limit = 20) {
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getItineraries(skip, limit)
      .then((data) => { if (!cancelled) setItineraries(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [skip, limit])

  return { itineraries, loading, error }
}
