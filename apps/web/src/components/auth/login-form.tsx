import { useForm } from 'react-hook-form';
import { Form, FormField, FormLabel, FormInput, FormError, Button } from '@repo/ui';
import { useAuth } from '../../hooks/use-auth';
import type { LoginRequestType } from '@repo/api-schemas';

export function LoginForm() {
  const { login, isLoggingIn, loginError, resetLoginError } = useAuth();
  
  const form = useForm<LoginRequestType>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginRequestType) => {
    resetLoginError();
    login(data);
  };

  return (
    <div className="auth-form">
      <div className="auth-form__header">
        <h2 className="auth-form__title">Welcome Back</h2>
        <p className="auth-form__subtitle">Sign in to your account</p>
      </div>

      <Form form={form} onSubmit={onSubmit} className="auth-form__form">
        <FormField name="email">
          <FormLabel required>Email</FormLabel>
          <FormInput 
            type="email" 
            placeholder="Enter your email"
            required
            autoComplete="email"
          />
          <FormError />
        </FormField>

        <FormField name="password">
          <FormLabel required>Password</FormLabel>
          <FormInput 
            type="password" 
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
          <FormError />
        </FormField>

        {loginError && (
          <div className="auth-form__error" role="alert">
            {loginError.message}
          </div>
        )}

        <Button 
          type="submit" 
          loading={isLoggingIn}
          className="auth-form__submit"
        >
          {isLoggingIn ? 'Signing In...' : 'Sign In'}
        </Button>
      </Form>
    </div>
  );
}