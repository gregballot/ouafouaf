import { useForm } from 'react-hook-form';
import { Form, FormField, FormLabel, FormInput, FormError, Button } from '@repo/ui';
import { useAuth } from '../../hooks/use-auth';
import type { SignupRequestType } from '@repo/api-schemas';

export function SignupForm() {
  const { signup, isSigningUp, signupError, resetSignupError } = useAuth();

  const form = useForm<SignupRequestType>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: SignupRequestType) => {
    resetSignupError();
    signup(data);
  };

  return (
    <div className="auth-form">
      <div className="auth-form__header">
        <h2 className="auth-form__title">Create Account</h2>
        <p className="auth-form__subtitle">Sign up to get started</p>
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
            autoComplete="new-password"
            minLength={8}
          />
          <FormError />
        </FormField>

        {signupError && (
          <div className="auth-form__error" role="alert">
            {signupError.message}
          </div>
        )}

        <Button 
          type="submit" 
          loading={isSigningUp}
          className="auth-form__submit"
        >
          {isSigningUp ? 'Creating Account...' : 'Create Account'}
        </Button>
      </Form>
    </div>
  );
}