import React from 'react';
import { colors } from '../../tokens/colors';
import { spacing, radius } from '../../tokens/spacing';
import { fontSize, fontWeight } from '../../tokens/typography';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: {
    backgroundColor: colors.primary[500],
    color: colors.neutral[0],
    border: `1px solid ${colors.primary[500]}`,
    ':hover': {
      backgroundColor: colors.primary[600],
      borderColor: colors.primary[600],
    },
    ':focus': {
      outline: `2px solid ${colors.primary[500]}`,
      outlineOffset: '2px',
    },
    ':disabled': {
      backgroundColor: colors.neutral[300],
      borderColor: colors.neutral[300],
      color: colors.neutral[500],
      cursor: 'not-allowed',
    },
  },
  secondary: {
    backgroundColor: colors.neutral[0],
    color: colors.neutral[900],
    border: `1px solid ${colors.neutral[300]}`,
    ':hover': {
      backgroundColor: colors.neutral[50],
      borderColor: colors.neutral[400],
    },
    ':focus': {
      outline: `2px solid ${colors.primary[500]}`,
      outlineOffset: '2px',
    },
    ':disabled': {
      backgroundColor: colors.neutral[100],
      borderColor: colors.neutral[200],
      color: colors.neutral[400],
      cursor: 'not-allowed',
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.neutral[700],
    border: '1px solid transparent',
    ':hover': {
      backgroundColor: colors.neutral[100],
    },
    ':focus': {
      outline: `2px solid ${colors.primary[500]}`,
      outlineOffset: '2px',
    },
    ':disabled': {
      color: colors.neutral[400],
      cursor: 'not-allowed',
    },
  },
  destructive: {
    backgroundColor: colors.error[500],
    color: colors.neutral[0],
    border: `1px solid ${colors.error[500]}`,
    ':hover': {
      backgroundColor: colors.error[600],
      borderColor: colors.error[600],
    },
    ':focus': {
      outline: `2px solid ${colors.error[500]}`,
      outlineOffset: '2px',
    },
    ':disabled': {
      backgroundColor: colors.neutral[300],
      borderColor: colors.neutral[300],
      color: colors.neutral[500],
      cursor: 'not-allowed',
    },
  },
};

const buttonSizes = {
  sm: {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    minHeight: '2rem',
  },
  md: {
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    minHeight: '2.5rem',
  },
  lg: {
    padding: `${spacing[4]} ${spacing[6]}`,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    minHeight: '3rem',
  },
};

const LoadingSpinner = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const spinnerSize = size === 'sm' ? '1rem' : size === 'md' ? '1.25rem' : '1.5rem';

  return (
    <svg
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        animation: 'spin 1s linear infinite',
      }}
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
  style,
  className,
  ...props
}: ButtonProps) {
  const variantStyles = buttonVariants[variant];
  const sizeStyles = buttonSizes[size];
  const isDisabled = disabled || isLoading;

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: radius.md,
    fontFamily: 'inherit',
    textDecoration: 'none',
    transition: 'all 0.2s ease-in-out',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    position: 'relative',
    whiteSpace: 'nowrap',
    ...sizeStyles,
    ...variantStyles,
    ...(isDisabled && variantStyles[':disabled']),
    ...style,
  };

  return (
    <button
      style={buttonStyle}
      disabled={isDisabled}
      aria-label={isLoading ? loadingText : undefined}
      className={className}
      {...props}
    >
      {isLoading && <LoadingSpinner size={size} />}
      <span style={{ opacity: isLoading ? 0.7 : 1 }}>
        {isLoading && loadingText ? loadingText : children}
      </span>
    </button>
  );
}