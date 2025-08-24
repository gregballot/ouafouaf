import { AuthTabs } from './auth'

export function AuthPage() {
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