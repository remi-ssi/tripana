import { useEffect, useState } from 'react'
import { authService } from '../api/authService'

export function useAuthStatus() {
  const [state, setState] = useState({
    isLoading: true,
    isAuthenticated: false,
    hasPreferences: false,
  })

  useEffect(() => {
    let isMounted = true

    const loadStatus = async () => {
      try {
        const preferenceStatus = await authService.getPreferenceStatus()

        if (!isMounted) {
          return
        }

        setState({
          isLoading: false,
          isAuthenticated: true,
          hasPreferences: Boolean(preferenceStatus?.has_preferences),
        })
      } catch {
        if (!isMounted) {
          return
        }

        setState({
          isLoading: false,
          isAuthenticated: false,
          hasPreferences: false,
        })
      }
    }

    loadStatus()

    return () => {
      isMounted = false
    }
  }, [])

  return state
}
