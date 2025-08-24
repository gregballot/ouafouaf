import React from 'react';
import { colors } from '../../tokens/colors';
import { spacing, radius } from '../../tokens/spacing';
import { fontSize, fontWeight } from '../../tokens/typography';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const alertVariants = {
  info: {
    backgroundColor: colors.info[50],
    borderColor: colors.info[200],
    titleColor: colors.info[800],
    textColor: colors.info[700],
    iconColor: colors.info[600],
  },
  success: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[200],
    titleColor: colors.success[800],
    textColor: colors.success[700],
    iconColor: colors.success[600],
  },
  warning: {
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
    titleColor: colors.warning[800],
    textColor: colors.warning[700],
    iconColor: colors.warning[600],
  },
  error: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
    titleColor: colors.error[800],
    textColor: colors.error[700],
    iconColor: colors.error[600],
  },
};

const icons = {
  info: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  success: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 4.7L7.7 9 12 13.3 11.3 14 7 9.7 2.7 14 2 13.3 6.3 9 2 4.7 2.7 4 7 8.3 11.3 4 12 4.7z" />
  </svg>
);

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  style,
  className,
  ...props
}: AlertProps) {
  const variantStyles = alertVariants[variant];
  const icon = icons[variant];

  const alertStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.md,
    border: `1px solid ${variantStyles.borderColor}`,
    backgroundColor: variantStyles.backgroundColor,
    ...style,
  };

  const iconStyle: React.CSSProperties = {
    color: variantStyles.iconColor,
    flexShrink: 0,
    marginTop: spacing[1],
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: variantStyles.titleColor,
    marginBottom: spacing[1],
  };

  const textStyle: React.CSSProperties = {
    fontSize: fontSize.sm,
    color: variantStyles.textColor,
    lineHeight: '1.5',
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    padding: spacing[1],
    borderRadius: radius.sm,
    color: variantStyles.iconColor,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <div role="alert" style={alertStyle} className={className} {...props}>
      <div style={iconStyle}>{icon}</div>
      <div style={contentStyle}>
        {title && <div style={titleStyle}>{title}</div>}
        <div style={textStyle}>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          style={closeButtonStyle}
          onClick={onClose}
          aria-label="Close alert"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
