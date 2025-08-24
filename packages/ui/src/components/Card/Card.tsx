import React from 'react';
import { colors } from '../../tokens/colors';
import { spacing, radius, shadows } from '../../tokens/spacing';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const cardVariants = {
  elevated: {
    backgroundColor: colors.neutral[0],
    border: 'none',
    boxShadow: shadows.md,
  },
  outlined: {
    backgroundColor: colors.neutral[0],
    border: `1px solid ${colors.neutral[200]}`,
    boxShadow: 'none',
  },
  filled: {
    backgroundColor: colors.neutral[50],
    border: 'none',
    boxShadow: 'none',
  },
};

const cardPadding = {
  none: '0',
  sm: spacing[4],
  md: spacing[6],
  lg: spacing[8],
};

export function Card({
  variant = 'elevated',
  padding = 'md',
  children,
  style,
  className,
  ...props
}: CardProps) {
  const variantStyles = cardVariants[variant];
  const paddingValue = cardPadding[padding];

  const cardStyle: React.CSSProperties = {
    borderRadius: radius.lg,
    overflow: 'hidden',
    transition: 'all 0.2s ease-in-out',
    ...variantStyles,
    padding: paddingValue,
    ...style,
  };

  return (
    <div style={cardStyle} className={className} {...props}>
      {children}
    </div>
  );
}
