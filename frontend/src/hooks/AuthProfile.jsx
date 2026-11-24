import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext()

// Provides user profile and loading state to the app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [hasPreferences, setHasPreferences] = useState(false)
  const [loading, setLoading] = useState(true)
  const hasInitializedRef = useRef(false)

  const refreshUser = useCallback(async () => {
    setLoading(true)

    try {
      const sessionStatus = await authService.getSessionStatus()
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
    // Only initialize once per component mount
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      refreshUser()
    }
  }, [])

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
