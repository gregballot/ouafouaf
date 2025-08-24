interface AlertProps {
  children: React.ReactNode;
  variant?: 'error' | 'success' | 'warning' | 'info';
  className?: string;
}

export function Alert({ children, variant = 'error', className = '' }: AlertProps) {
  // Use the existing auth-form__error class for errors, or create minimal inline styles for others
  if (variant === 'error') {
    return (
      <div className={`auth-form__error ${className}`}>
        {children}
      </div>
    );
  }

  // For other variants, use simple inline styles to avoid adding more CSS
  const variantStyles = {
    success: { backgroundColor: '#f0f9ff', color: '#059669', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '6px' },
    warning: { backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '12px', borderRadius: '6px' },
    info: { backgroundColor: '#f0f9ff', color: '#0284c7', border: '1px solid #a5f3fc', padding: '12px', borderRadius: '6px' }
  };

  return (
    <div style={variantStyles[variant]} className={className}>
      {children}
    </div>
  );
}