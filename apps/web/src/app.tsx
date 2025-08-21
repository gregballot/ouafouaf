import { useAuth } from './hooks/use-auth'
import { AuthTabs } from './components/auth'
import { Button } from '@repo/ui'

export function App() {
  const { isAuthenticated, user, logout } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="app__header">
          <h1 className="app__title">Ouafouaf</h1>
          <p className="app__subtitle">Welcome to your new monorepo!</p>
        </div>
        <div className="app__content">
          <AuthTabs />
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="app__header">
        <h1 className="app__title">Welcome back, {user?.email}!</h1>
        <Button variant="secondary" onClick={logout}>
          Sign Out
        </Button>
      </div>
      <div className="app__content">
        <div className="dashboard">
          <h2>Dashboard</h2>
          <p>You are successfully logged in!</p>
        </div>
      </div>
    </div>
  )
}