import { HTMLAttributes, ReactNode } from 'react';
import { useFormField } from './form-field';

export interface FormHelpProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function FormHelp({ children, className = '', ...props }: FormHelpProps) {
  const { id } = useFormField();

  return (
    <div
      id={`${id}-help`}
      className={`form-help ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}