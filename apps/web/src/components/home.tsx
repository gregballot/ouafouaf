import { useAuth } from '../hooks/use-auth';
import { Button } from './ui/button';
import appStyles from './app-layout.module.scss';
import dashboardStyles from './dashboard.module.scss';

export function Home() {
  const { user, logout } = useAuth();

  return (
    <div className={appStyles.app}>
      <div className={appStyles.appHeader}>
        <h1 className={appStyles.appTitle}>Welcome back, {user?.email}!</h1>
        <Button variant="secondary" onClick={logout}>
          Sign Out
        </Button>
      </div>
      <div className={appStyles.appContent}>
        <div className={dashboardStyles.dashboard}>
          <h2 className={dashboardStyles.dashboardTitle}>Dashboard</h2>
          <p className={dashboardStyles.dashboardText}>
            You are successfully logged in!
          </p>
        </div>
      </div>
    </div>
  );
}
