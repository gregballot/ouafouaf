import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, ...props }, ref) => {
    const classes = [
      'form-input',
      error ? 'form-input--error' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <input
        className={classes}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';