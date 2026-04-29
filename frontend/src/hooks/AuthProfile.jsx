import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../api/authService";

const AuthContext = createContext()
let sessionStatusRequest = null
let hasInitialFetch = false

function fetchSessionStatusOnce() {
  if (!sessionStatusRequest && !hasInitialFetch) {
    hasInitialFetch = true
    sessionStatusRequest = authService.getSessionStatus()
      .catch(err => {
        console.error("Session fetch failed:", err)
        hasInitialFetch = false
        sessionStatusRequest = null
        return null
      })
  }

  return sessionStatusRequest
}

// Force a fresh session fetch by resetting the cache
function resetSessionCache() {
  sessionStatusRequest = null
  hasInitialFetch = false
}

// Provides user profile and loading state to the app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [hasPreferences, setHasPreferences] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    setLoading(true)

    try {
      // Reset cache to force a fresh fetch
      resetSessionCache()
      const sessionStatus = await fetchSessionStatusOnce()
      setUser(sessionStatus?.authenticated ? sessionStatus?.user ?? null : null)
      setHasPreferences(Boolean(sessionStatus?.has_preferences))
    } catch (error) {
      setUser(null)
      setHasPreferences(false)
      console.error("Failed to fetch user profile:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const setAuthSession = useCallback((nextUser, nextHasPreferences = false) => {
    setUser(nextUser)
    setHasPreferences(Boolean(nextHasPreferences))
    setLoading(false)
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
    setHasPreferences(false)
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  return (
    <AuthContext.Provider value={{ user, loading, hasPreferences, refreshUser, setAuthSession, clearUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
