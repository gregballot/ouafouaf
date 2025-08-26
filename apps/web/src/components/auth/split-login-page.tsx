import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Alert } from '../ui/alert';
import { PasswordStrength } from '../ui/password-strength';
import { ForgotPasswordForm } from './forgot-password-form';
import { useAuth } from '../../hooks/use-auth';
import {
  loginSchema,
  signupSchema,
  type LoginFormData,
  type SignupFormData,
  getPasswordStrength,
} from '../../schemas/auth-schemas';
import styles from './split-login-page.module.scss';
import splashImage from '../../assets/splash-image.jpg';

type AuthMode = 'login' | 'signup';

export function SplitLoginPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { resetLoginError, resetSignupError } = useAuth();

  const switchToSignup = () => {
    setAuthMode('signup');
    resetLoginError();
  };

  const switchToLogin = () => {
    setAuthMode('login');
    resetSignupError();
  };

  if (authMode === 'signup') {
    return <SignupForm switchToLogin={switchToLogin} />;
  }

  return <LoginForm switchToSignup={switchToSignup} />;
}

interface LoginFormProps {
  switchToSignup: () => void;
}

function LoginForm({ switchToSignup }: LoginFormProps) {
  const { login, isLoggingIn, loginError, resetLoginError } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    resetLoginError();
    login(data);
  };

  return (
    <div className={styles.container}>
      {/* Left side - Splash Image */}
      <div className={styles.imageSide}>
        <img src={splashImage} alt="Welcome" className={styles.splashImage} />
      </div>

      {/* Right side - Login Form */}
      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Welcome back</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email address <span className={styles.requiredMark}>*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
                error={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <div className={styles.error}>{errors.email.message}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password <span className={styles.requiredMark}>*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                error={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <div className={styles.error}>{errors.password.message}</div>
              )}
            </div>

            {/* Remember me and Forgot password */}
            <div className={styles.optionsRow}>
              <Checkbox
                id="remember"
                label="Remember me"
                {...register('remember')}
              />
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className={styles.forgotPassword}
              >
                Forgot password?
              </button>
            </div>

            {loginError && <Alert variant="error">{loginError.message}</Alert>}

            <Button
              type="submit"
              isLoading={isLoggingIn}
              className={styles.submitButton}
            >
              Log in
            </Button>

            {/* Sign up link */}
            <div className={styles.switchForm}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={switchToSignup}
                className={styles.switchFormLink}
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordForm
          onClose={() => setShowForgotPassword(false)}
          onBackToLogin={() => setShowForgotPassword(false)}
        />
      )}
    </div>
  );
}

interface SignupFormProps {
  switchToLogin: () => void;
}

function SignupForm({ switchToLogin }: SignupFormProps) {
  const { signup, isSigningUp, signupError, resetSignupError } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  useEffect(() => {
    if (password) {
      setPasswordStrength(getPasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [password]);

  const onSubmit = (data: SignupFormData) => {
    resetSignupError();
    // Transform to match API schema (remove confirmPassword)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword: _, ...signupData } = data;
    signup(signupData);
  };

  return (
    <div className={styles.container}>
      {/* Left side - Splash Image */}
      <div className={styles.imageSide}>
        <img src={splashImage} alt="Welcome" className={styles.splashImage} />
      </div>

      {/* Right side - Signup Form */}
      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>Sign up to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>
                Full name <span className={styles.requiredMark}>*</span>
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
                error={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <div className={styles.error}>{errors.name.message}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email address <span className={styles.requiredMark}>*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
                error={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <div className={styles.error}>{errors.email.message}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password <span className={styles.requiredMark}>*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                autoComplete="new-password"
                error={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <div className={styles.error}>{errors.password.message}</div>
              )}
              <PasswordStrength
                password={password}
                strength={passwordStrength}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm password <span className={styles.requiredMark}>*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <div className={styles.error}>
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>

            {signupError && (
              <Alert variant="error">{signupError.message}</Alert>
            )}

            <Button
              type="submit"
              isLoading={isSigningUp}
              className={styles.submitButton}
              disabled={isSigningUp || passwordStrength.score < 2}
            >
              Create Account
            </Button>

            {/* Sign in link */}
            <div className={styles.switchForm}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={switchToLogin}
                className={styles.switchFormLink}
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
