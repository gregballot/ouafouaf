import React, { forwardRef } from 'react';
import { colors } from '../../tokens/colors';
import { spacing, radius } from '../../tokens/spacing';
import { fontSize, fontWeight } from '../../tokens/typography';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  helperText?: string;
  error?: string;
}

const inputSizes = {
  sm: {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: fontSize.sm,
    minHeight: '2rem',
  },
  md: {
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: fontSize.base,
    minHeight: '2.5rem',
  },
  lg: {
    padding: `${spacing[4]} ${spacing[5]}`,
    fontSize: fontSize.lg,
    minHeight: '3rem',
  },
};

const inputVariants = {
  default: {
    border: `1px solid ${colors.neutral[300]}`,
    backgroundColor: colors.neutral[0],
    color: colors.neutral[900],
    ':focus': {
      outline: 'none',
      borderColor: colors.primary[500],
      boxShadow: `0 0 0 1px ${colors.primary[500]}`,
    },
    ':hover': {
      borderColor: colors.neutral[400],
    },
    ':disabled': {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[500],
      cursor: 'not-allowed',
    },
  },
  error: {
    border: `1px solid ${colors.error[500]}`,
    backgroundColor: colors.neutral[0],
    color: colors.neutral[900],
    ':focus': {
      outline: 'none',
      borderColor: colors.error[600],
      boxShadow: `0 0 0 1px ${colors.error[500]}`,
    },
  },
  success: {
    border: `1px solid ${colors.success[500]}`,
    backgroundColor: colors.neutral[0],
    color: colors.neutral[900],
    ':focus': {
      outline: 'none',
      borderColor: colors.success[600],
      boxShadow: `0 0 0 1px ${colors.success[500]}`,
    },
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      variant = 'default',
      leftIcon,
      rightIcon,
      label,
      helperText,
      error,
      disabled,
      style,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const actualVariant = error ? 'error' : variant;
    const sizeStyles = inputSizes[size];
    const variantStyles = inputVariants[actualVariant];

    const inputStyle: React.CSSProperties = {
      width: '100%',
      borderRadius: radius.md,
      fontFamily: 'inherit',
      transition: 'all 0.2s ease-in-out',
      outline: 'none',
      ...sizeStyles,
      ...variantStyles,
      ...(disabled && {
        backgroundColor: colors.neutral[100],
        color: colors.neutral[500],
        cursor: 'not-allowed',
      }),
      ...(leftIcon && { paddingLeft: `calc(${sizeStyles.padding.split(' ')[1]} + 1.5rem)` }),
      ...(rightIcon && { paddingRight: `calc(${sizeStyles.padding.split(' ')[1]} + 1.5rem)` }),
      ...style,
    };

    const containerStyle: React.CSSProperties = {
      position: 'relative',
      width: '100%',
    };

    const iconStyle = (position: 'left' | 'right'): React.CSSProperties => ({
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      [position]: spacing[3],
      color: colors.neutral[400],
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });

    const labelStyle: React.CSSProperties = {
      display: 'block',
      marginBottom: spacing[2],
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: colors.neutral[700],
    };

    const helperTextStyle: React.CSSProperties = {
      marginTop: spacing[1],
      fontSize: fontSize.xs,
      color: error ? colors.error[600] : colors.neutral[500],
    };

    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <div style={containerStyle}>
          {leftIcon && <div style={iconStyle('left')}>{leftIcon}</div>}
          <input
            ref={ref}
            id={inputId}
            style={inputStyle}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={className}
            {...props}
          />
          {rightIcon && <div style={iconStyle('right')}>{rightIcon}</div>}
        </div>
        {(error || helperText) && (
          <div
            id={error ? `${inputId}-error` : `${inputId}-helper`}
            style={helperTextStyle}
            role={error ? 'alert' : 'description'}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';