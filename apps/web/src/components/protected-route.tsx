import { useAuth } from '../hooks/use-auth'
import { Navigate } from 'react-router-dom'
import { LoadingPage } from './loading'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing } = useAuth()

  // Show loading while we're still checking authentication
  if (isInitializing) {
    return <LoadingPage title="Verifying session" message="Please wait while we verify your authentication" />
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}