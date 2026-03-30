import { Navigate } from 'react-router-dom'
import { useAuthStatus } from '../hooks/useAuthStatus'

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">
      Loading...
    </div>
  )
}

export function AuthOnlyRoute({ children, requirePreferences }) {
  const { isLoading, isAuthenticated, hasPreferences } = useAuthStatus()

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requirePreferences === true && !hasPreferences) {
    return <Navigate to="/user-preference" replace />
  }

  if (requirePreferences === false && hasPreferences) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function GuestOnlyRoute({ children }) {
  const { isLoading, isAuthenticated, hasPreferences } = useAuthStatus()

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (isAuthenticated) {
    return <Navigate to={hasPreferences ? '/dashboard' : '/user-preference'} replace />
  }

  return children
}
