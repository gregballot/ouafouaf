import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './form.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, ...props }, ref) => {
    const classes = [
      styles.formInput,
      error ? styles.formInputError : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <input className={classes} ref={ref} {...props} />;
  }
);

Input.displayName = 'Input';
