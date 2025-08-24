import React from 'react';
import { Card } from '../../Card';
import { colors } from '../../../tokens/colors';
import { spacing } from '../../../tokens/spacing';
import { fontSize, fontWeight } from '../../../tokens/typography';

export interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthCard({
  title,
  subtitle,
  children,
  style,
  className,
  ...props
}: AuthCardProps) {
  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: spacing[6],
  };

  const titleStyle: React.CSSProperties = {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing[2],
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: fontSize.base,
    color: colors.neutral[600],
    lineHeight: '1.5',
  };

  return (
    <Card
      variant="elevated"
      padding="lg"
      style={cardStyle}
      className={className}
      {...props}
    >
      {(title || subtitle) && (
        <div style={headerStyle}>
          {title && <h1 style={titleStyle}>{title}</h1>}
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </div>
      )}
      {children}
    </Card>
  );
}