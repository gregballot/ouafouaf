import { useState } from 'react';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';

type AuthTab = 'login' | 'signup';

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  return (
    <div className="auth-tabs">
      <div className="auth-tabs__header">
        <button
          type="button"
          className={`auth-tabs__tab ${activeTab === 'login' ? 'auth-tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`auth-tabs__tab ${activeTab === 'signup' ? 'auth-tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('signup')}
        >
          Create Account
        </button>
      </div>

      <div className="auth-tabs__content">
        {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
}