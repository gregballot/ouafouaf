import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthPage } from './components/auth-page'
import { Home } from './components/home'
import { ProtectedRoute } from './components/protected-route'
import { ErrorBoundary } from './components/error-boundary'
import { useAuth } from './hooks/use-auth'
import { InitializingApp } from './components/auth-loading'

function AppContent() {
  const { isInitializing } = useAuth()

  // Show app-wide initialization loading
  if (isInitializing) {
    return <InitializingApp />
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to monitoring service in production
        console.error('Application error:', error, errorInfo)
      }}
    >
      <Router>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </Router>
    </ErrorBoundary>
  )
}