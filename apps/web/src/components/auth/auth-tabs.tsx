import { useState } from 'react';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';
import styles from './auth-tabs.module.scss';

type AuthTab = 'login' | 'signup';

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  return (
    <div className={styles.authTabs}>
      <div className={styles.authTabsHeader}>
        <button
          type="button"
          className={`${styles.authTabsTab} ${activeTab === 'login' ? styles.authTabsTabActive : ''}`}
          onClick={() => setActiveTab('login')}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`${styles.authTabsTab} ${activeTab === 'signup' ? styles.authTabsTabActive : ''}`}
          onClick={() => setActiveTab('signup')}
        >
          Create Account
        </button>
      </div>

      <div className={styles.authTabsContent}>
        {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
}
