import { useAuth } from './AuthProfile'

export function useAuthStatus() {
  const { user, loading, hasPreferences } = useAuth()

  return {
    isLoading: loading,
    isAuthenticated: Boolean(user),
    hasPreferences: Boolean(hasPreferences),
  }
}
