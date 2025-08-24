import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert } from '../ui/alert';
import { useAuth } from '../../hooks/use-auth';
import { loginSchema, type LoginFormData } from '../../schemas/auth-schemas';

export function LoginForm() {
  const { login, isLoggingIn, loginError, resetLoginError } = useAuth();

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
    <div className="auth-form">
      <div className="auth-form__header">
        <h2 className="auth-form__title">Welcome Back</h2>
        <p className="auth-form__subtitle">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form__form">
        <div className="form-field">
          <label htmlFor="email" className="form-label">
            Email <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            error={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <div className="form-error">{errors.email.message}</div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="password" className="form-label">
            Password <span style={{ color: '#dc2626' }}>*</span>
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
            <div className="form-error">{errors.password.message}</div>
          )}
        </div>

        {loginError && <Alert variant="error">{loginError.message}</Alert>}

        <Button
          type="submit"
          isLoading={isLoggingIn}
          className="auth-form__submit"
          style={{ width: '100%' }}
        >
          Sign In
        </Button>
      </form>
    </div>
  );
}
