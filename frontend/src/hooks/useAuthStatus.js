import { useEffect, useState } from 'react'
import { useAuth } from './AuthProfile'

export function useAuthStatus(refreshKey) {
  const { user, loading, hasPreferences } = useAuth()

  useEffect(() => {
    void refreshKey
  }, [refreshKey])

  return {
    isLoading: loading,
    isAuthenticated: Boolean(user),
    hasPreferences: Boolean(hasPreferences),
  }
}
