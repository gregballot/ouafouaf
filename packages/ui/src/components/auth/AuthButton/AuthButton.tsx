import React from 'react';
import { Button, ButtonProps } from '../../Button';
import { spacing } from '../../../tokens/spacing';

export interface AuthButtonProps extends Omit<ButtonProps, 'size'> {
  size?: 'md' | 'lg';
  fullWidth?: boolean;
}

export function AuthButton({
  size = 'lg',
  fullWidth = true,
  style,
  ...props
}: AuthButtonProps) {
  const buttonStyle: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    marginTop: spacing[2],
    ...style,
  };

  return <Button size={size} style={buttonStyle} {...props} />;
}