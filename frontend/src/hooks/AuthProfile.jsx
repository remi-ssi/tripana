import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../api/authService";

const AuthContext = createContext()

// Provides user profile and loading state to the app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    setLoading(true)

    try {
      const sessionStatus = await authService.getSessionStatus()
      setUser(sessionStatus?.authenticated ? sessionStatus?.user ?? null : null)
    } catch (error) {
      setUser(null)
      console.error("Failed to fetch user profile:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, clearUser }}>
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
