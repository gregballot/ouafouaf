import { useAuth } from '../hooks/use-auth'
import { Button } from './ui/button'

export function Home() {
  const { user, logout } = useAuth()

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