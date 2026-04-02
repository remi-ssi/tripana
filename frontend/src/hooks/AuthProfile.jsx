import { createContext, useContext, useState, useEffect, useRef } from "react";
import { authService } from "../api/authService";

const AuthContext = createContext()

// Provides user profile and loading state to the app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const didFetchRef = useRef(false)

  useEffect(() => {
    if (didFetchRef.current) {
      return
    }
    didFetchRef.current = true

    const fetchUser = async () => {
      try {
        const sessionStatus = await authService.getSessionStatus()
        setUser(sessionStatus?.authenticated ? sessionStatus?.user ?? null : null)
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
