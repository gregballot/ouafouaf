import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert } from '../ui/alert';
import { useAuth } from '../../hooks/use-auth';
import { loginSchema, type LoginFormData } from '../../schemas/auth-schemas';
import formStyles from './auth-form.module.scss';
import fieldStyles from '../ui/form.module.scss';

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
    <div>
      <div className={formStyles.authFormHeader}>
        <h2 className={formStyles.authFormTitle}>Welcome Back</h2>
        <p className={formStyles.authFormSubtitle}>Sign in to your account</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={formStyles.authFormForm}
      >
        <div className={fieldStyles.formField}>
          <label htmlFor="email" className={fieldStyles.formLabel}>
            Email <span className={fieldStyles.formLabelRequiredMark}>*</span>
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
            <div className={fieldStyles.formError}>{errors.email.message}</div>
          )}
        </div>

        <div className={fieldStyles.formField}>
          <label htmlFor="password" className={fieldStyles.formLabel}>
            Password{' '}
            <span className={fieldStyles.formLabelRequiredMark}>*</span>
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
            <div className={fieldStyles.formError}>
              {errors.password.message}
            </div>
          )}
        </div>

        {loginError && <Alert variant="error">{loginError.message}</Alert>}

        <Button
          type="submit"
          isLoading={isLoggingIn}
          className={formStyles.authFormSubmit}
          style={{ width: '100%' }}
        >
          Sign In
        </Button>
      </form>
    </div>
  );
}
