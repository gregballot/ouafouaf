import React from 'react';
import { colors } from '../../tokens/colors';

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'neutral' | 'current';
  label?: string;
}

const spinnerSizes = {
  xs: '1rem',
  sm: '1.25rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '2.5rem',
};

const spinnerColors = {
  primary: colors.primary[500],
  neutral: colors.neutral[500],
  current: 'currentColor',
};

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  label = 'Loading...',
  style,
  className,
  ...props
}: LoadingSpinnerProps) {
  const spinnerSize = spinnerSizes[size];
  const spinnerColor = spinnerColors[color];

  const containerStyle: React.CSSProperties = {
    display: 'inline-block',
    ...style,
  };

  const svgStyle: React.CSSProperties = {
    animation: 'spin 1s linear infinite',
    width: spinnerSize,
    height: spinnerSize,
    color: spinnerColor,
  };

  return (
    <div
      role="status"
      aria-label={label}
      style={containerStyle}
      className={className}
      {...props}
    >
      <svg
        style={svgStyle}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
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
          <animate
            attributeName="stroke-dasharray"
            values="0 32;16 16;0 32"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      <span className="sr-only">{label}</span>
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
