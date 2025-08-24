import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert } from '../ui/alert';
import { PasswordStrength } from '../ui/password-strength';
import { useAuth } from '../../hooks/use-auth';
import {
  signupSchema,
  type SignupFormData,
  getPasswordStrength,
} from '../../schemas/auth-schemas';
import { useState, useEffect } from 'react';

export function SignupForm() {
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
    <div className="auth-form">
      <div className="auth-form__header">
        <h2 className="auth-form__title">Create Account</h2>
        <p className="auth-form__subtitle">Sign up to get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form__form">
        <div className="form-field">
          <label htmlFor="name" className="form-label">
            Full Name <span style={{ color: '#dc2626' }}>*</span>
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
            <div className="form-error">{errors.name.message}</div>
          )}
        </div>

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
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={!!errors.password}
            {...register('password')}
          />

          <PasswordStrength password={password} strength={passwordStrength} />

          {errors.password && (
            <div className="form-error">{errors.password.message}</div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password <span style={{ color: '#dc2626' }}>*</span>
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
            <div className="form-error">{errors.confirmPassword.message}</div>
          )}
        </div>

        {signupError && <Alert variant="error">{signupError.message}</Alert>}

        <Button
          type="submit"
          isLoading={isSigningUp}
          className="auth-form__submit"
          style={{ width: '100%' }}
          disabled={isSigningUp || passwordStrength.score < 2}
        >
          Create Account
        </Button>
      </form>
    </div>
  );
}
