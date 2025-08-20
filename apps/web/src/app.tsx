import { Button } from '@repo/ui'

export function App() {
  return (
    <div className="app">
      <h1>Ouafouaf</h1>
      <p>Welcome to your new monorepo!</p>
      <Button onClick={() => console.log('Button clicked!')}>
        Click me
      </Button>
    </div>
  )
}