import React from 'react';
import styles from './Button.module.scss';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const LoadingSpinner = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const spinnerSize =
    size === 'sm' ? '1rem' : size === 'md' ? '1.25rem' : '1.5rem';

  return (
    <svg
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={styles.loadingSpinner}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="32"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="32;0;32"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const classes = [
    styles.button,
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={isDisabled}
      aria-label={isLoading ? loadingText : undefined}
      {...props}
    >
      {isLoading && <LoadingSpinner size={size} />}
      <span
        className={`${styles.buttonContent} ${isLoading ? styles.buttonContentLoading : ''}`}
      >
        {isLoading && loadingText ? loadingText : children}
      </span>
    </button>
  );
}
