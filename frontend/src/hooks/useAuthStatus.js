import { useEffect, useState } from 'react'
import { authService } from '../api/authService'

export function useAuthStatus(refreshKey) {
  const [state, setState] = useState({
    isLoading: true,
    isAuthenticated: false,
    hasPreferences: false,
  })

  useEffect(() => {
    let isMounted = true

    const loadStatus = async () => {
      try {
        const sessionStatus = await authService.getSessionStatus()

        if (!isMounted) {
          return
        }

        setState({
          isLoading: false,
          isAuthenticated: Boolean(sessionStatus?.authenticated),
          hasPreferences: Boolean(sessionStatus?.has_preferences),
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

    setState((prevState) => ({
      ...prevState,
      isLoading: true,
    }))

    loadStatus()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  return state
}
