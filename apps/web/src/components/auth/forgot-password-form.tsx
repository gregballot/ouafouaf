import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert } from '../ui/alert';
import { apiClient, ApiError } from '../../lib/api-client';
import styles from './forgot-password-form.module.scss';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onClose: () => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({
  onClose,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.forgotPassword(data);
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.header}>
            <h2 className={styles.title}>Check your email</h2>
            <button
              type="button"
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className={styles.successMessage}>
            <p>
              If an account with that email exists, we've sent you a password
              reset link.
            </p>
            <p>
              Please check your email and follow the instructions to reset your
              password.
            </p>
          </div>

          <Button
            onClick={onBackToLogin}
            variant="secondary"
            className={styles.backButton}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h2 className={styles.title}>Reset your password</h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className={styles.description}>
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="forgot-email" className={styles.label}>
              Email address <span className={styles.requiredMark}>*</span>
            </label>
            <Input
              id="forgot-email"
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

          {error && <Alert variant="error">{error}</Alert>}

          <div className={styles.buttonGroup}>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className={styles.submitButton}
            >
              Send reset link
            </Button>

            <Button
              type="button"
              onClick={onBackToLogin}
              variant="secondary"
              className={styles.cancelButton}
            >
              Back to Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
