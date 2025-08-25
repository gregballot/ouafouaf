import { AuthTabs } from './auth';
import styles from './app-layout.module.scss';

export function AuthPage() {
  return (
    <div className={styles.app}>
      <div className={styles.appHeader}>
        <h1 className={styles.appTitle}>Ouafouaf</h1>
        <p className={styles.appSubtitle}>Welcome to your new monorepo!</p>
      </div>
      <div className={styles.appContent}>
        <AuthTabs />
      </div>
    </div>
  );
}
