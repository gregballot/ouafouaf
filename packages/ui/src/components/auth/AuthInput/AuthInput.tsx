import React, { forwardRef } from 'react';
import { Input, InputProps } from '../../Input';
import { spacing } from '../../../tokens/spacing';

export interface AuthInputProps extends InputProps {
  fullWidth?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ size = 'lg', fullWidth = true, style, ...props }, ref) => {
    const inputStyle: React.CSSProperties = {
      width: fullWidth ? '100%' : 'auto',
      marginBottom: spacing[4],
      ...style,
    };

    return <Input ref={ref} size={size} style={inputStyle} {...props} />;
  }
);

AuthInput.displayName = 'AuthInput';